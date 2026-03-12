package com.dulich.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.qdrant.client.grpc.Points.ScoredPoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dulich.backend.dto.PhienChatQuanTriDTO;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.entity.PhienChat;
import com.dulich.backend.entity.TinNhanChat;
import com.dulich.backend.repository.PhienChatRepository;
import com.dulich.backend.repository.TinNhanChatRepository;

@Service
public class DichVuChatbot {

        private static final Logger logger = LoggerFactory.getLogger(DichVuChatbot.class);

        private final GroqApiService groqApiService;
        private final PhienChatRepository phienChatRepository;
        private final TinNhanChatRepository tinNhanChatRepository;
        private final HuggingFaceEmbeddingService embeddingService;
        private final QdrantService qdrantService;

        public DichVuChatbot(GroqApiService groqApiService,
                        PhienChatRepository phienChatRepository,
                        TinNhanChatRepository tinNhanChatRepository,
                        HuggingFaceEmbeddingService embeddingService,
                        QdrantService qdrantService) {
                this.groqApiService = groqApiService;
                this.phienChatRepository = phienChatRepository;
                this.tinNhanChatRepository = tinNhanChatRepository;
                this.embeddingService = embeddingService;
                this.qdrantService = qdrantService;
        }

        private static final String SYSTEM_INSTRUCTION = """
                        Bạn là trợ lý ảo AI của Việt Tour.
                        Nhiệm vụ: Tư vấn tour du lịch và trả lời câu hỏi dựa trên dữ liệu được cung cấp.

                        QUY TẮC:
                        1. Luôn vui vẻ, gọi khách là 'anh/chị', xưng 'em'.
                        2. Trả lời bằng Tiếng Việt.
                        3. Dữ liệu: Chỉ dùng thông tin trong phần cung cấp để trả lời.
                        4. Nếu dữ liệu chứa thông tin chính sách, hãy trả lời chính xác theo nội dung.
                        5. Nếu không tìm thấy: Xin lỗi và gợi ý liên hệ hotline 1900-1234.
                        6. NGỮ CẢNH HỘI THOẠI: Luôn ghi nhớ nội dung các câu hỏi và câu trả lời trước đó trong cuộc hội thoại. Khi khách hỏi câu tiếp theo (ví dụ: "cho tôi xem lịch trình", "giá bao nhiêu?", "tour đó có gì?"), hãy hiểu là khách đang hỏi về tour/chủ đề đã được đề cập trước đó trong hội thoại và ưu tiên trả lời về tour/chủ đề đó. Chỉ sử dụng dữ liệu hệ thống liên quan đến chủ đề đang thảo luận.
                        """;

        public Map<String, Object> xuLyChat(YeuCauChatDTO req) {
                // 1. Lấy/Tạo phiên chat
                PhienChat phienChat = layHoacTaoPhienChat(req);

                // 2. Lưu câu hỏi User
                String noiDungUser = req.getCauHoi() != null ? req.getCauHoi() : "...";
                luuTinNhan(phienChat, "USER", noiDungUser);

                // 3. Lấy lịch sử hội thoại từ DB (tối đa 10 tin nhắn gần nhất)
                List<TinNhanChat> lichSu = tinNhanChatRepository
                                .findByPhienChatIdOrderByThoiGianGuiAsc(phienChat.getId());
                int maxHistory = 10;
                if (lichSu.size() > maxHistory) {
                        lichSu = lichSu.subList(lichSu.size() - maxHistory, lichSu.size());
                }

                // 4. Xây dựng câu tìm kiếm mở rộng (kết hợp ngữ cảnh hội thoại)
                String cauHoiMoRong = xayDungCauHoiMoRong(noiDungUser, lichSu);

                // 5. Tìm thông tin liên quan bằng câu hỏi mở rộng
                String contextDuLieu = timKiemDuLieuLienQuan(cauHoiMoRong);

                // 6. Gọi Groq AI với lịch sử hội thoại
                String noiDungAI = goiGroqAI(noiDungUser, contextDuLieu, lichSu);

                // 7. Lưu câu trả lời AI
                luuTinNhan(phienChat, "AI", noiDungAI);

                // 8. Trả kết quả
                Map<String, Object> response = new HashMap<>();
                response.put("cauTraLoi", noiDungAI);
                response.put("phienChatId", phienChat.getId());
                return response;
        }

        @Transactional(readOnly = true)
        public List<Map<String, Object>> layLichSuChat(Long phienChatId) {
                List<TinNhanChat> all = tinNhanChatRepository.findAll();
                return all.stream()
                                .filter(t -> t.getPhienChat().getId().equals(phienChatId))
                                .sorted(Comparator.comparing(TinNhanChat::getThoiGianGui))
                                .map(t -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("nguoiGui", t.getNguoiGui());
                                        map.put("noiDung", t.getNoiDung());
                                        map.put("thoiGian", t.getThoiGianGui());
                                        return map;
                                })
                                .collect(Collectors.toList());
        }

        @Transactional
        public void xoaPhienChat(Long phienChatId) {
                if (!phienChatRepository.existsById(phienChatId)) {
                        throw new TaiNguyenKhongTonTaiException("Không tìm thấy phiên chat với ID: " + phienChatId);
                }

                List<TinNhanChat> tinNhans = tinNhanChatRepository.findAll().stream()
                                .filter(t -> t.getPhienChat().getId().equals(phienChatId))
                                .collect(Collectors.toList());
                tinNhanChatRepository.deleteAll(tinNhans);
                phienChatRepository.deleteById(phienChatId);
        }

        @Transactional(readOnly = true)
        public List<PhienChatQuanTriDTO> layTatCaPhienChat() {
                return phienChatRepository.findAll().stream()
                                .sorted(Comparator.comparing(PhienChat::getThoiGianBatDau).reversed())
                                .map(p -> PhienChatQuanTriDTO.builder()
                                                .id(p.getId())
                                                .tieuDe(p.getTieuDe())
                                                .nguoiDungId(p.getNguoiDungId())
                                                .thoiGianBatDau(p.getThoiGianBatDau())
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<String> layDanhSachCauHoiGoiY() {
                return List.of(
                                "Làm sao để đặt tour du lịch?",
                                "Chính sách hủy tour như thế nào?",
                                "Có tour nào đi Đà Lạt giá rẻ không?",
                                "Tôi muốn xem các tour đang khuyến mãi",
                                "Quy định về hành lý khi đi tour?",
                                "Liên hệ hỗ trợ khẩn cấp ở đâu?");
        }

        // =============== PRIVATE METHODS ===============

        /**
         * Xây dựng câu hỏi mở rộng bằng cách kết hợp câu hỏi hiện tại
         * với ngữ cảnh từ các câu hỏi trước đó trong hội thoại.
         * VD: "lịch trình chi tiết" + history("có tour Huế không") → "lịch trình chi tiết tour Huế"
         */
        private String xayDungCauHoiMoRong(String cauHoiHienTai, List<TinNhanChat> lichSu) {
                if (lichSu.size() <= 1) {
                        // Chỉ có tin nhắn hiện tại hoặc không có lịch sử → dùng câu hỏi gốc
                        return cauHoiHienTai;
                }

                // Lấy tối đa 2 câu hỏi USER gần nhất (không bao gồm câu hiện tại)
                List<String> cauHoiTruoc = lichSu.stream()
                                .filter(t -> "USER".equals(t.getNguoiGui()))
                                .map(TinNhanChat::getNoiDung)
                                .filter(nd -> !nd.equals(cauHoiHienTai))
                                .collect(Collectors.toList());

                if (cauHoiTruoc.isEmpty()) {
                        return cauHoiHienTai;
                }

                // Lấy 2 câu hỏi gần nhất
                int from = Math.max(0, cauHoiTruoc.size() - 2);
                List<String> ganNhat = cauHoiTruoc.subList(from, cauHoiTruoc.size());

                // Kết hợp: câu hỏi hiện tại + ngữ cảnh từ câu hỏi trước
                String moRong = cauHoiHienTai + " " + String.join(" ", ganNhat);
                logger.info("Câu hỏi mở rộng cho RAG: {}", moRong);
                return moRong;
        }

        /**
         * Tìm kiếm dữ liệu liên quan bằng RAG (vector search).
         */
        private String timKiemDuLieuLienQuan(String cauHoi) {
                StringBuilder ketQua = new StringBuilder();

                // RAG vector search (tìm theo ngữ nghĩa)
                String ragResult = null;
                try {
                        if (qdrantService.isAvailable()) {
                                ragResult = timKiemBangVector(cauHoi);
                                if (ragResult != null && !ragResult.isBlank()) {
                                        logger.info("RAG vector search thành công cho câu hỏi: {}", cauHoi);
                                        ketQua.append(ragResult);
                                }
                        }
                } catch (Exception e) {
                        logger.warn("RAG vector search thất bại: {}", e.getMessage());
                }

                if (ketQua.isEmpty()) {
                        return "Không tìm thấy dữ liệu chính xác về tour hoặc thông tin mà anh/chị đang hỏi. Vui lòng cho em biết tên địa điểm hoặc yêu cầu cụ thể hơn, hoặc gọi hotline 1900-1234 để được hỗ trợ trực tiếp.";
                }

                return ketQua.toString();
        }

        /**
         * Tìm kiếm bằng vector similarity (RAG)
         */
        private String timKiemBangVector(String cauHoi) {
                // 1. Embed câu hỏi
                List<Float> queryVector = embeddingService.embed(cauHoi.toLowerCase());

                // 2. Tìm top 5 kết quả tương tự trong Qdrant
                List<ScoredPoint> results = qdrantService.timKiem(queryVector, 5);

                if (results.isEmpty()) {
                        return null; // Fallback sang keyword search
                }

                // 3. Tổng hợp context từ kết quả
                StringBuilder context = new StringBuilder();

                // Tách kết quả tour và tài liệu
                List<ScoredPoint> tourResults = new ArrayList<>();
                List<ScoredPoint> docResults = new ArrayList<>();

                for (ScoredPoint point : results) {
                        String loai = getPayloadString(point, "loai");
                        if ("tai_lieu".equals(loai)) {
                                docResults.add(point);
                        } else {
                                tourResults.add(point);
                        }
                }

                // Format kết quả tour
                if (!tourResults.isEmpty()) {
                        context.append("=== THÔNG TIN TOUR ===\n");
                        for (ScoredPoint point : tourResults) {
                                context.append(String.format(
                                                "[Thông tin Tour]:\n%s\n(Độ liên quan: %.2f)\n\n",
                                                getPayloadString(point, "noiDung"),
                                                point.getScore()));
                        }
                }

                // Format kết quả tài liệu chính sách
                if (!docResults.isEmpty()) {
                        context.append("=== THÔNG TIN CHÍNH SÁCH / TÀI LIỆU ===\n");
                        for (ScoredPoint point : docResults) {
                                String tenFile = getPayloadString(point, "tenFile");
                                String noiDung = getPayloadString(point, "noiDung");
                                context.append(String.format(
                                                "[Nguồn: %s]\n%s\n(Độ liên quan: %.2f)\n\n",
                                                tenFile, noiDung, point.getScore()));
                        }
                }

                return context.toString();
        }



        private String getPayloadString(ScoredPoint point, String key) {
                io.qdrant.client.grpc.JsonWithInt.Value val = point.getPayloadMap().get(key);
                if (val != null && val.hasStringValue()) {
                        return val.getStringValue();
                }
                return "";
        }

        private PhienChat layHoacTaoPhienChat(YeuCauChatDTO req) {
                Long phienChatId = req.getPhienChatId();
                if (phienChatId != null) {
                        return phienChatRepository.findById(phienChatId)
                                        .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                                                        "Không tìm thấy phiên chat"));
                }
                String ch = req.getCauHoi() != null ? req.getCauHoi() : "Hội thoại mới";
                String tieuDe = ch.length() > 50 ? ch.substring(0, 50) + "..." : ch;

                PhienChat p = PhienChat.builder()
                                .nguoiDungId(req.getNguoiDungId())
                                .tieuDe(tieuDe)
                                .thoiGianBatDau(LocalDateTime.now())
                                .build();
                PhienChat savedPhienChat = java.util.Objects.requireNonNull(phienChatRepository.save(p));
                return savedPhienChat;
        }

        private void luuTinNhan(PhienChat p, String role, String content) {
                TinNhanChat t = TinNhanChat.builder()
                                .phienChat(p)
                                .nguoiGui(role)
                                .noiDung(content)
                                .thoiGianGui(LocalDateTime.now())
                                .build();
                java.util.Objects.requireNonNull(tinNhanChatRepository.save(t));
        }





        private String goiGroqAI(String question, String context, List<TinNhanChat> lichSu) {
                try {
                        // Xây dựng danh sách messages từ lịch sử hội thoại
                        List<Map<String, String>> messages = new ArrayList<>();

                        // Thêm lịch sử hội thoại trước đó (không bao gồm tin nhắn hiện tại vì nó đã được lưu)
                        // Bỏ tin nhắn cuối cùng vì đó chính là câu hỏi hiện tại
                        List<TinNhanChat> lichSuTruoc = lichSu.size() > 1
                                        ? lichSu.subList(0, lichSu.size() - 1)
                                        : new ArrayList<>();

                        for (TinNhanChat tinNhan : lichSuTruoc) {
                                Map<String, String> msg = new HashMap<>();
                                msg.put("role", "USER".equals(tinNhan.getNguoiGui()) ? "user" : "assistant");
                                msg.put("content", tinNhan.getNoiDung());
                                messages.add(msg);
                        }

                        // Thêm câu hỏi hiện tại kèm context RAG
                        String currentPrompt = String.format("""
                                        [Dữ liệu hệ thống]:
                                        %s

                                        [Câu hỏi]: "%s"
                                        """, context, question);

                        Map<String, String> currentMsg = new HashMap<>();
                        currentMsg.put("role", "user");
                        currentMsg.put("content", currentPrompt);
                        messages.add(currentMsg);

                        return groqApiService.generateContentWithMessages(SYSTEM_INSTRUCTION, messages);
                } catch (Exception e) {
                        logger.error("Error calling Groq AI", e);
                        return "Lỗi: " + e.getMessage();
                }
        }
}