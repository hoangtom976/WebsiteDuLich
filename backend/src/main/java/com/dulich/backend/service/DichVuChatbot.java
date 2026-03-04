package com.dulich.backend.service;

import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.entity.PhienChat;
import com.dulich.backend.entity.TinNhanChat;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.PhienChatRepository;
import com.dulich.backend.repository.TinNhanChatRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DichVuChatbot {

        private static final Logger logger = LoggerFactory.getLogger(DichVuChatbot.class);

        private final GroqApiService groqApiService;
        private final PhienChatRepository phienChatRepository;
        private final TinNhanChatRepository tinNhanChatRepository;
        private final TourRepository tourRepository;

        private static final String SYSTEM_INSTRUCTION = """
                        Bạn là trợ lý ảo AI của Việt Tour.
                        Nhiệm vụ: Tư vấn tour du lịch dựa trên dữ liệu được cung cấp.

                        QUY TẮC:
                        1. Luôn vui vẻ, gọi khách là 'anh/chị', xưng 'em'.
                        2. Trả lời bằng Tiếng Việt.
                        3. Dữ liệu: Chỉ dùng thông tin trong phần cung cấp để trả lời.
                        4. Nếu không tìm thấy: Xin lỗi và gợi ý liên hệ hotline 1900-1234.
                        """;

        @Transactional
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
                String tuKhoa = cauHoi.toLowerCase();
                List<Tour> all = tourRepository.findAll();
                List<Tour> matches = new ArrayList<>();

                for (Tour t : all) {
                        if (!Boolean.TRUE.equals(t.getTrangThai()))
                                continue;

                        String tenTour = t.getTenTour() == null ? "" : t.getTenTour().toLowerCase();
                        String tenDiaDiem = (t.getDiaDiem() != null && t.getDiaDiem().getTenDiaDiem() != null)
                                        ? t.getDiaDiem().getTenDiaDiem().toLowerCase()
                                        : "";

                        // Logic: Nếu câu hỏi chứa tên địa điểm HOẶC chứa tên tour
                        // Ví dụ: tuKhoa="du lịch đà lạt" -> contains "đà lạt" -> match
                        if ((!tenDiaDiem.isEmpty() && tuKhoa.contains(tenDiaDiem)) || tuKhoa.contains(tenTour)) {
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