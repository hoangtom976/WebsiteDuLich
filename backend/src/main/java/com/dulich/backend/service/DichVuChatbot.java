package com.dulich.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        // Constructor injection thủ công để sửa lỗi Lombok không nhận diện
        public DichVuChatbot(GroqApiService groqApiService,
                        PhienChatRepository phienChatRepository,
                        TinNhanChatRepository tinNhanChatRepository,
                        TourRepository tourRepository) {
                this.groqApiService = groqApiService;
                this.phienChatRepository = phienChatRepository;
                this.tinNhanChatRepository = tinNhanChatRepository;
                this.tourRepository = tourRepository;
        }

        private static final String SYSTEM_INSTRUCTION = """
                        Bạn là trợ lý ảo AI của Việt Tour.
                        Nhiệm vụ: Tư vấn tour du lịch dựa trên dữ liệu được cung cấp.

                        QUY TẮC:
                        1. Luôn vui vẻ, gọi khách là 'anh/chị', xưng 'em'.
                        2. Trả lời bằng Tiếng Việt.
                        3. Dữ liệu: Chỉ dùng thông tin trong phần cung cấp để trả lời.
                        4. Nếu không tìm thấy: Xin lỗi và gợi ý liên hệ hotline 1900-1234.
                        """;

        // Xóa @Transactional để tránh giữ kết nối DB khi đang gọi API AI (thường mất nhiều thời gian)
        public Map<String, Object> xuLyChat(YeuCauChatDTO req) {
                // 1. Lấy/Tạo phiên chat
                PhienChat phienChat = layHoacTaoPhienChat(req);

                // 2. Lưu câu hỏi User
                String noiDungUser = req.getCauHoi() != null ? req.getCauHoi() : "...";
                luuTinNhan(phienChat, "USER", noiDungUser);

                // 3. Tìm thông tin liên quan (RAG)
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
                // Sử dụng findAll và lọc trong Java để đảm bảo hoạt động ổn định
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

                // Tìm và xóa các tin nhắn thuộc phiên chat này trước
                List<TinNhanChat> tinNhans = tinNhanChatRepository.findAll().stream()
                                .filter(t -> t.getPhienChat().getId().equals(phienChatId))
                                .collect(Collectors.toList());
                tinNhanChatRepository.deleteAll(tinNhans);
                phienChatRepository.deleteById(phienChatId);
        }

        @Transactional(readOnly = true)
        public List<PhienChatQuanTriDTO> layTatCaPhienChat() {
                // Lấy tất cả và sắp xếp giảm dần theo thời gian bắt đầu
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

        private String timKiemDuLieuLienQuan(String cauHoi) {
                String tuKhoa = cauHoi.toLowerCase().trim();
                List<Tour> all = tourRepository.findAll();
                List<Tour> matches = new ArrayList<>();

                for (Tour t : all) {
                        if (!Boolean.TRUE.equals(t.getTrangThai())) continue;

                        String tenTour = t.getTenTour() != null ? t.getTenTour().toLowerCase().trim() : "";
                        String tenDiaDiem = (t.getDiaDiem() != null && t.getDiaDiem().getTenDiaDiem() != null)
                                        ? t.getDiaDiem().getTenDiaDiem().toLowerCase().trim() : "";

                        // Sửa lỗi logic: Kiểm tra chuỗi không rỗng trước khi contains để tránh match sai
                        boolean matchTenTour = !tenTour.isEmpty() && (tenTour.contains(tuKhoa) || tuKhoa.contains(tenTour));
                        boolean matchDiaDiem = !tenDiaDiem.isEmpty() && (tenDiaDiem.contains(tuKhoa) || tuKhoa.contains(tenDiaDiem));

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