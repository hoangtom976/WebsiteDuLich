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
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.PhienChatRepository;
import com.dulich.backend.repository.TinNhanChatRepository;
import com.dulich.backend.repository.TourRepository;

@Service
public class DichVuChatbot {

        private static final Logger logger = LoggerFactory.getLogger(DichVuChatbot.class);

        private final GroqApiService groqApiService;
        private final PhienChatRepository phienChatRepository;
        private final TinNhanChatRepository tinNhanChatRepository;
        private final TourRepository tourRepository;
        private final HuggingFaceEmbeddingService embeddingService;
        private final QdrantService qdrantService;

        public DichVuChatbot(GroqApiService groqApiService,
                        PhienChatRepository phienChatRepository,
                        TinNhanChatRepository tinNhanChatRepository,
                        TourRepository tourRepository,
                        HuggingFaceEmbeddingService embeddingService,
                        QdrantService qdrantService) {
                this.groqApiService = groqApiService;
                this.phienChatRepository = phienChatRepository;
                this.tinNhanChatRepository = tinNhanChatRepository;
                this.tourRepository = tourRepository;
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
                        """;

        public Map<String, Object> xuLyChat(YeuCauChatDTO req) {
                // 1. Lấy/Tạo phiên chat
                PhienChat phienChat = layHoacTaoPhienChat(req);

                // 2. Lưu câu hỏi User
                String noiDungUser = req.getCauHoi() != null ? req.getCauHoi() : "...";
                luuTinNhan(phienChat, "USER", noiDungUser);

                // 3. Tìm thông tin liên quan (RAG với vector search, fallback keyword)
                String contextDuLieu = timKiemDuLieuLienQuan(noiDungUser);

                // 4. Gọi Groq AI
                String noiDungAI = goiGroqAI(noiDungUser, contextDuLieu);

                // 5. Lưu câu trả lời AI
                luuTinNhan(phienChat, "AI", noiDungAI);

                // 6. Trả kết quả
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
         * Tìm kiếm dữ liệu liên quan bằng RAG (vector search).
         * Fallback sang keyword matching nếu Qdrant không khả dụng.
         */
        private String timKiemDuLieuLienQuan(String cauHoi) {
                // Thử RAG vector search trước
                try {
                        if (qdrantService.isAvailable()) {
                                String ragResult = timKiemBangVector(cauHoi);
                                if (ragResult != null && !ragResult.isBlank()) {
                                        logger.info("RAG vector search thành công cho câu hỏi: {}", cauHoi);
                                        return ragResult;
                                }
                        }
                } catch (Exception e) {
                        logger.warn("RAG vector search thất bại, dùng fallback: {}", e.getMessage());
                }

                // Fallback: keyword matching (logic cũ)
                logger.info("Dùng fallback keyword search cho câu hỏi: {}", cauHoi);
                return timKiemBangKeyword(cauHoi);
        }

        /**
         * Tìm kiếm bằng vector similarity (RAG)
         */
        private String timKiemBangVector(String cauHoi) {
                // 1. Embed câu hỏi
                List<Float> queryVector = embeddingService.embed(cauHoi);

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
                                                "- Tour: %s\n  Giá: %s VNĐ\n  Nơi đến: %s\n  Số ngày: %s\n  Mô tả: %s\n  (Độ liên quan: %.2f)\n\n",
                                                getPayloadString(point, "tenTour"),
                                                getPayloadString(point, "gia"),
                                                getPayloadString(point, "diaDiem"),
                                                getPayloadString(point, "soNgay"),
                                                catNgan(getPayloadString(point, "moTa")),
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

        /**
         * Tìm kiếm bằng keyword (logic cũ, dùng làm fallback)
         */
        private String timKiemBangKeyword(String cauHoi) {
                String tuKhoa = cauHoi.toLowerCase().trim();
                List<Tour> all = tourRepository.findAll();
                List<Tour> matches = new ArrayList<>();

                for (Tour t : all) {
                        if (!Boolean.TRUE.equals(t.getTrangThai()))
                                continue;

                        String tenTour = t.getTenTour() != null ? t.getTenTour().toLowerCase().trim() : "";
                        String tenDiaDiem = (t.getDiaDiem() != null && t.getDiaDiem().getTenDiaDiem() != null)
                                        ? t.getDiaDiem().getTenDiaDiem().toLowerCase().trim()
                                        : "";

                        boolean matchTenTour = !tenTour.isEmpty()
                                        && (tenTour.contains(tuKhoa) || tuKhoa.contains(tenTour));
                        boolean matchDiaDiem = !tenDiaDiem.isEmpty()
                                        && (tenDiaDiem.contains(tuKhoa) || tuKhoa.contains(tenDiaDiem));

                        if (matchTenTour || matchDiaDiem) {
                                matches.add(t);
                        }
                }

                if (matches.isEmpty()) {
                        return "Không tìm thấy dữ liệu chính xác. Dưới đây là 3 tour phổ biến nhất:\n"
                                        + formatList(tourRepository.timTourPhoBien());
                }

                return formatList(matches.stream().limit(3).collect(Collectors.toList()));
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

        private String formatList(List<Tour> list) {
                if (list == null || list.isEmpty())
                        return "";
                return list.stream().map(t -> String.format(
                                "- Tour: %s\n  Giá: %s VNĐ\n  Nơi đến: %s\n  Mô tả: %s",
                                t.getTenTour(),
                                t.getGia(),
                                (t.getDiaDiem() != null ? t.getDiaDiem().getTenDiaDiem() : "N/A"),
                                catNgan(t.getMoTa()))).collect(Collectors.joining("\n\n"));
        }

        private String catNgan(String s) {
                if (s == null)
                        return "Chưa có mô tả";
                return s.length() > 150 ? s.substring(0, 150) + "..." : s;
        }

        private String goiGroqAI(String question, String context) {
                String prompt = String.format("""
                                [Dữ liệu hệ thống]:
                                %s

                                [Câu hỏi]: "%s"
                                """, context, question);
                try {
                        return groqApiService.generateContentWithSystem(SYSTEM_INSTRUCTION, prompt);
                } catch (Exception e) {
                        logger.error("Error calling Groq AI", e);
                        return "Lỗi: " + e.getMessage();
                }
        }
}