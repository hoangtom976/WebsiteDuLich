package com.dulich.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.qdrant.client.grpc.Points.ScoredPoint;
import static io.qdrant.client.ValueFactory.value;
import static io.qdrant.client.PointIdFactory.id;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.dulich.backend.dto.PhienChatQuanTriDTO;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.entity.PhienChat;
import com.dulich.backend.entity.TinNhanChat;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.PhienChatRepository;
import com.dulich.backend.repository.TinNhanChatRepository;
import com.dulich.backend.repository.TourRepository;
import com.dulich.backend.util.VNCharacterUtils;

@Service
public class DichVuChatbot {

        private static final Logger logger = LoggerFactory.getLogger(DichVuChatbot.class);

        /**
         * Ngưỡng similarity tối thiểu. Kết quả dưới ngưỡng này bị loại bỏ vì không
         * đủ liên quan.
         * Cosine similarity từ MiniLM-L12 thường nằm trong khoảng 0.2–0.8.
         */
        private static final float SIMILARITY_THRESHOLD = 0.35f;

        /**
         * Số lượng kết quả tối đa giữ lại từ vector search.
         */
        private static final int TOP_K = 5;

        /**
         * Giới hạn ký tự nội dung mỗi tour trong context gửi cho AI.
         */
        private static final int MAX_CONTENT_LENGTH = 1200;

        private final GroqApiService groqApiService;
        private final PhienChatRepository phienChatRepository;
        private final TinNhanChatRepository tinNhanChatRepository;
        private final HuggingFaceEmbeddingService embeddingService;
        private final QdrantService qdrantService;
        private final NguoiDungRepository nguoiDungRepository;
        private final TourRepository tourRepository;

        public DichVuChatbot(GroqApiService groqApiService,
                        PhienChatRepository phienChatRepository,
                        TinNhanChatRepository tinNhanChatRepository,
                        HuggingFaceEmbeddingService embeddingService,
                        QdrantService qdrantService,
                        NguoiDungRepository nguoiDungRepository,
                        TourRepository tourRepository) {
                this.groqApiService = groqApiService;
                this.phienChatRepository = phienChatRepository;
                this.tinNhanChatRepository = tinNhanChatRepository;
                this.embeddingService = embeddingService;
                this.qdrantService = qdrantService;
                this.nguoiDungRepository = nguoiDungRepository;
                this.tourRepository = tourRepository;
        }

        // ======================== SYSTEM PROMPT ========================

        private static final String SYSTEM_INSTRUCTION = """
                        Bạn là Việt Tour AI – trợ lý ảo của công ty du lịch Việt Tour.
                        Nhiệm vụ chính: tư vấn tour du lịch, trả lời chính sách, và hỗ trợ khách hàng.

                        QUY TẮC BẮT BUỘC:
                        1. PHONG CÁCH: Vui vẻ, chuyên nghiệp. Gọi khách là "anh/chị", xưng "em". Trả lời hoàn toàn bằng Tiếng Việt.
                        2. DỮ LIỆU: CHỈ dùng thông tin trong phần "Dữ liệu hệ thống" bên dưới để trả lời. KHÔNG BAO GIỜ tự bịa thông tin về tour, giá, lịch trình hoặc chính sách.
                        3. KHI CÓ DỮ LIỆU TOUR PHÙ HỢP:
                           - Trả lời chi tiết, trình bày rõ ràng: tên tour, giá, số ngày, điểm đến, mô tả ngắn.
                           - Nếu có lịch trình thì trình bày theo từng ngày.
                           - Luôn đính kèm mã `[TOURID:X]` (X = số ID cụ thể) ngay sau khi nhắc đến tour.
                        4. KHI KHÔNG CÓ DỮ LIỆU PHÙ HỢP:
                           - Xin lỗi lịch sự.
                           - Gợi ý khách mô tả cụ thể hơn hoặc liên hệ hotline 1900-1234.
                        5. NGỮ CẢNH HỘI THOẠI:
                           - Ghi nhớ nội dung các câu hỏi và câu trả lời trước đó.
                           - Khi khách hỏi tiếp (ví dụ: "cho tôi xem lịch trình", "giá bao nhiêu?"), hiểu là đang hỏi về tour/chủ đề trước đó.
                        6. MÃ TOUR:
                           - CHỈ dùng ID có trong dữ liệu hệ thống.
                           - KHÔNG tự bịa mã (ví dụ [TOURID:1]) nếu ID đó không có trong kết quả tìm kiếm.
                           - KHÔNG chèn mã khi chỉ chào hỏi.

                        VÍ DỤ TRẢ LỜI TỐT:
                        "Dạ, hiện em tìm thấy tour **Khám phá Phú Quốc 3N2Đ** rất phù hợp ạ! [TOURID:7]
                        - 💰 Giá: 4.200.000 VNĐ/người
                        - ⏰ Thời gian: 3 ngày 2 đêm
                        - 📍 Điểm đến: Đảo Phú Quốc
                        Anh/chị muốn em giới thiệu lịch trình chi tiết không ạ?"
                        """;

        // ======================== PUBLIC API ========================

        public Map<String, Object> xuLyChat(YeuCauChatDTO req) {
                // 1. Lấy user ID từ SecurityContext nếu đã đăng nhập
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                        String email = auth.getName();
                        nguoiDungRepository.findByEmail(email).ifPresent(user -> req.setNguoiDungId(user.getId()));
                }

                // 2. Lấy/Tạo phiên chat
                PhienChat phienChat = layHoacTaoPhienChat(req);

                // 3. Lưu câu hỏi User
                String noiDungUser = req.getCauHoi() != null ? req.getCauHoi() : "...";
                luuTinNhan(phienChat, "USER", noiDungUser);

                // 4. Lấy lịch sử hội thoại từ DB (tối đa 5 tin nhắn gần nhất)
                List<TinNhanChat> lichSu = tinNhanChatRepository
                                .findByPhienChatIdOrderByThoiGianGuiAsc(phienChat.getId());
                int maxHistory = 5;
                if (lichSu.size() > maxHistory) {
                        lichSu = lichSu.subList(lichSu.size() - maxHistory, lichSu.size());
                }

                // 5. Lấy câu hỏi USER trước đó (để lấy ngữ cảnh song song)
                String cauHoiTruoc = layCauHoiTruoc(noiDungUser, lichSu);

                // 6. Tìm thông tin liên quan bằng cả 2 câu hỏi (kết quả gộp)
                String contextDuLieu = timKiemDuLieuLienQuan(noiDungUser, cauHoiTruoc);

                // 7. Gọi Groq AI với lịch sử hội thoại
                String noiDungAI = goiGroqAI(noiDungUser, contextDuLieu, lichSu);

                // 8. Lưu câu trả lời AI
                luuTinNhan(phienChat, "AI", noiDungAI);

                // 9. Trả kết quả
                Map<String, Object> response = new HashMap<>();
                response.put("cauTraLoi", noiDungAI);
                response.put("phienChatId", phienChat.getId());
                return response;
        }

        /**
         * Phương thức debug để xem kết quả RAG thô (xóa sau khi hoàn tất debug)
         */
        public Map<String, Object> debugSearch(String query) {
                Map<String, Object> debug = new HashMap<>();
                debug.put("query", query);

                try {
                        // This method now calls the new combined search logic
                        List<ScoredPoint> combinedResults = timKiemDuLieuLienQuanCombined(query);
                        debug.put("formattedContext", formatSearchResults(combinedResults));

                        List<Float> vector = embeddingService.embed(query.toLowerCase());
                        List<ScoredPoint> rawResults = qdrantService.timKiem(vector, TOP_K);

                        List<Map<String, Object>> points = rawResults.stream().map(p -> {
                                Map<String, Object> map = new HashMap<>();
                                map.put("score", p.getScore());
                                map.put("tourId", getPayloadString(p, "tourId"));
                                map.put("tenTour", getPayloadString(p, "tenTour"));
                                map.put("loai", getPayloadString(p, "loai"));
                                return map;
                        }).collect(Collectors.toList());

                        debug.put("rawPoints", points);
                        debug.put("threshold", SIMILARITY_THRESHOLD);
                } catch (Exception e) {
                        debug.put("error", e.getMessage());
                }

                return debug;
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
                                                .tenNguoiDung(layTenNguoiDung(p.getNguoiDungId()))
                                                .thoiGianBatDau(p.getThoiGianBatDau())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<PhienChatQuanTriDTO> layCacPhienChatCuaNguoiDung(Long nguoiDungId) {
                return phienChatRepository.findByNguoiDungId(nguoiDungId).stream()
                                .sorted(Comparator.comparing(PhienChat::getThoiGianBatDau).reversed())
                                .map(p -> PhienChatQuanTriDTO.builder()
                                                .id(p.getId())
                                                .tieuDe(p.getTieuDe())
                                                .nguoiDungId(p.getNguoiDungId())
                                                .tenNguoiDung(layTenNguoiDung(p.getNguoiDungId()))
                                                .thoiGianBatDau(p.getThoiGianBatDau())
                                                .build())
                                .collect(Collectors.toList());
        }

        private String layTenNguoiDung(Long nguoiDungId) {
                if (nguoiDungId == null)
                        return "Khách ẩn danh";
                return nguoiDungRepository.findById(nguoiDungId)
                                .map(nd -> nd.getHoTen() != null ? nd.getHoTen() : nd.getEmail())
                                .orElse("Khách ẩn danh");
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
         * Lấy câu hỏi gần nhất của USER (không tính câu hiện tại) để làm context RAG
         * phụ.
         */
        private String layCauHoiTruoc(String cauHoiHienTai, List<TinNhanChat> lichSu) {
                if (lichSu == null || lichSu.isEmpty())
                        return null;

                List<String> cauHoiTruoc = lichSu.stream()
                                .filter(t -> "USER".equals(t.getNguoiGui()))
                                .map(TinNhanChat::getNoiDung)
                                .filter(nd -> !nd.equals(cauHoiHienTai))
                                .collect(Collectors.toList());

                if (cauHoiTruoc.isEmpty())
                        return null;

                // Trả về đúng 1 câu hỏi USER gần nhất
                return cauHoiTruoc.get(cauHoiTruoc.size() - 1);
        }

        /**
         * Tìm kiếm dữ liệu liên quan bằng RAG (vector search) cho 2 câu hỏi và gộp
         * kết quả.
         * Áp dụng ngưỡng similarity để loại kết quả nhiễu.
         */
        private String timKiemDuLieuLienQuan(String cauHoiHienTai, String cauHoiTruoc) {
                StringBuilder ketQua = new StringBuilder();

                try {
                        if (qdrantService.isAvailable()) {
                                List<ScoredPoint> allResults = new ArrayList<>();

                                // Search 1: Câu hỏi hiện tại (cả bản gốc và bản không dấu)
                                List<ScoredPoint> res1 = timKiemDuLieuLienQuanCombined(cauHoiHienTai);
                                if (res1 != null)
                                        allResults.addAll(res1);

                                // Search 1b: Câu hỏi hiện tại bản bỏ dấu (nếu khác bản gốc)
                                String cauHoiKhongDau = VNCharacterUtils.removeDiacritics(cauHoiHienTai);
                                if (!cauHoiKhongDau.equalsIgnoreCase(cauHoiHienTai)) {
                                        List<ScoredPoint> res1b = timKiemDuLieuLienQuanCombined(cauHoiKhongDau);
                                        if (res1b != null)
                                                allResults.addAll(res1b);
                                }

                                // Search 2: Câu hỏi trước đó (chỉ khi khác câu hiện tại)
                                if (cauHoiTruoc != null && !cauHoiTruoc.isBlank()) {
                                        List<ScoredPoint> res2 = timKiemDuLieuLienQuanCombined(cauHoiTruoc);
                                        if (res2 != null)
                                                allResults.addAll(res2);
                                }

                                // Gộp kết quả, loại bỏ trùng lặp theo ID và giữ score cao nhất
                                Map<String, ScoredPoint> uniquePoints = new HashMap<>();
                                for (ScoredPoint p : allResults) {
                                        String idStr = p.getId().hasNum() ? String.valueOf(p.getId().getNum())
                                                        : p.getId().getUuid();
                                        if (!uniquePoints.containsKey(idStr)
                                                        || uniquePoints.get(idStr).getScore() < p.getScore()) {
                                                uniquePoints.put(idStr, p);
                                        }
                                }

                                // Lọc theo ngưỡng similarity + giữ top K
                                List<ScoredPoint> topPoints = uniquePoints.values().stream()
                                                .filter(p -> p.getScore() >= SIMILARITY_THRESHOLD)
                                                .sorted((a, b) -> Float.compare(b.getScore(), a.getScore()))
                                                .limit(TOP_K)
                                                .collect(Collectors.toList());

                                logger.info("RAG search: query='{}', raw={}, dedup={}, afterThreshold={}",
                                                cauHoiHienTai, allResults.size(), uniquePoints.size(),
                                                topPoints.size());
                                for (ScoredPoint p : topPoints) {
                                        logger.info("  -> [{}] ID={}, Tour='{}', Score={}",
                                                        getPayloadString(p, "loai"),
                                                        getPayloadString(p, "tourId"),
                                                        getPayloadString(p, "tenTour"),
                                                        p.getScore());
                                }

                                String ragResult = formatSearchResults(topPoints);

                                if (!ragResult.isBlank()) {
                                        ketQua.append(ragResult);
                                }
                        }
                } catch (Exception e) {
                        logger.warn("RAG vector search thất bại: {}", e.getMessage());
                }

                if (ketQua.isEmpty()) {
                        return "KHÔNG TÌM THẤY DỮ LIỆU PHÙ HỢP. Hãy xin lỗi khách và gợi ý liên hệ hotline 1900-1234.";
                }

                return ketQua.toString();
        }

        /**
         * Trả về danh sách thô từ Qdrant (kết hợp keyword search và vector search)
         */
        private List<ScoredPoint> timKiemDuLieuLienQuanCombined(String cauHoi) {
                if (cauHoi == null || cauHoi.isBlank())
                        return new ArrayList<>();

                String cauHoiKhongDau = VNCharacterUtils.removeDiacritics(cauHoi).toLowerCase();

                // 1. TÌM KIẾM BẰNG KEYWORD TỪ DATABASE
                // Trích xuất từ khóa bằng cách loại bỏ các stop words phổ biến và các từ xưng hô, hỏi hang
                String stopWordsRegex = "(?i)\\b(co|tour|di|khong|a|toi|muon|tim|cho|xin|hoi|nhung|cac|nao|ve|o|dau|ben|minh|với|là|thì|gì|sao|bao|nhiêu|giá|vnđ|đồng|k|ngàn|triệu|nha|nhé|nè|đâu|nào|đấy|đó|kia)\\b";
                String keyword = cauHoiKhongDau.replaceAll(stopWordsRegex, " ")
                        .replaceAll("[^a-z0-9\\s]", " ")
                        .trim()
                        .replaceAll("\\s+", " ");
                
                List<ScoredPoint> dbResults = new ArrayList<>();
                if (!keyword.isEmpty() && keyword.length() >= 3) { // Keyword đủ dài
                    List<Tour> allTours = tourRepository.findAll();
                    for (Tour t : allTours) {
                        if (!t.getTrangThai()) continue;
                        String tenKhongDau = VNCharacterUtils.removeDiacritics(t.getTenTour()).toLowerCase();
                        String diaDiemKhongDau = t.getDiaDiem() != null ? 
                                VNCharacterUtils.removeDiacritics(t.getDiaDiem().getTenDiaDiem()).toLowerCase() : "";
                        
                        // Nếu tên tour hoặc địa điểm chứa keyword (Full match)
                        boolean match = tenKhongDau.contains(keyword) || diaDiemKhongDau.contains(keyword);
                        
                        // Fallback: Nếu không khớp toàn bộ, thử khớp từng từ quan trọng (độ dài >= 2)
                        if (!match && keyword.contains(" ")) {
                            String[] words = keyword.split("\\s+");
                            for (String w : words) {
                                if (w.length() >= 3 && (tenKhongDau.contains(w) || diaDiemKhongDau.contains(w))) {
                                    match = true;
                                    break;
                                }
                            }
                        }

                        if (match) {
                            // Tạo một ScoredPoint giả định điểm cao (1.0)
                            Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = new HashMap<>();
                            payload.put("loai", value("tour"));
                            payload.put("tourId", value(String.valueOf(t.getId())));
                            payload.put("tenTour", value(t.getTenTour()));
                            
                            StringBuilder mt = new StringBuilder();
                            mt.append("Tour: ").append(t.getTenTour()).append("\n");
                            if (t.getDanhMuc() != null) mt.append("Danh mục: ").append(t.getDanhMuc().getTenDanhMuc()).append("\n");
                            if (t.getDiaDiem() != null) mt.append("Địa điểm: ").append(t.getDiaDiem().getTenDiaDiem()).append("\n");
                            mt.append("Giá: ").append(t.getGia()).append(" VNĐ\n");
                            mt.append("Thời gian: ").append(t.getSoNgay() > 0 ? t.getSoNgay() + " ngày" : "Trong ngày").append("\n");
                            mt.append("Mô tả: ").append(t.getMoTa()).append("\n");
                            
                            payload.put("noiDung", value(mt.toString())); // Changed from "moTa" to "noiDung" for consistency with formatSearchResults
                            payload.put("gia", value(String.valueOf(t.getGia())));
                            payload.put("soNgay", value(String.valueOf(t.getSoNgay())));
                            payload.put("diaDiem", value(t.getDiaDiem() != null ? t.getDiaDiem().getTenDiaDiem() : ""));

                            ScoredPoint pt = ScoredPoint.newBuilder()
                                    .setId(id(t.getId() + 1000000)) // ID ảo để tránh trùng với Qdrant IDs
                                    .setScore(1.0f) // High score for direct keyword match
                                    .putAllPayload(payload)
                                    .build();
                            dbResults.add(pt);
                        }
                    }
                }

                // 2. TÌM KIẾM VECTOR (Qdrant)
                List<Float> originalQueryVector = embeddingService.embed(cauHoi.trim().toLowerCase());
                List<Float> unaccentedQueryVector = embeddingService.embed(cauHoiKhongDau);

                List<ScoredPoint> originalResults = qdrantService.timKiem(originalQueryVector, TOP_K);
                List<ScoredPoint> unaccentedResults = qdrantService.timKiem(unaccentedQueryVector, TOP_K);

                // Gộp kết quả, ưu tiên Database Keyword > Vector cao điểm
                Map<Long, ScoredPoint> mergedMap = new HashMap<>();
                
                // Add DB results first, they have high score (1.0f)
                for (ScoredPoint pt : dbResults) {
                    mergedMap.put(pt.getId().getNum(), pt);
                }

                // Add Qdrant results, only if not already present or if score is higher
                for (ScoredPoint pt : originalResults) {
                    if (!mergedMap.containsKey(pt.getId().getNum()) || mergedMap.get(pt.getId().getNum()).getScore() < pt.getScore()) {
                        mergedMap.put(pt.getId().getNum(), pt);
                    }
                }
                for (ScoredPoint pt : unaccentedResults) {
                    if (!mergedMap.containsKey(pt.getId().getNum()) || mergedMap.get(pt.getId().getNum()).getScore() < pt.getScore()) {
                        mergedMap.put(pt.getId().getNum(), pt);
                    }
                }

                return new ArrayList<>(mergedMap.values());
        }

        /**
         * Format danh sách điểm số thành String context cho AI.
         * Tách riêng tour và tài liệu, trình bày rõ ràng để AI dễ hiểu.
         */
        private String formatSearchResults(List<ScoredPoint> results) {
                if (results == null || results.isEmpty())
                        return "";

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
                        context.append("=== DỮ LIỆU TOUR TÌM ĐƯỢC ===\n");
                        for (ScoredPoint point : tourResults) {
                                String tourId = getPayloadString(point, "tourId");
                                String tenTour = getPayloadString(point, "tenTour");
                                String gia = getPayloadString(point, "gia");
                                String soNgay = getPayloadString(point, "soNgay");
                                String diaDiem = getPayloadString(point, "diaDiem");
                                String noiDung = getPayloadString(point, "noiDung");

                                // Cắt ngắn nội dung để tránh vượt TPM limit
                                if (noiDung.length() > MAX_CONTENT_LENGTH) {
                                        noiDung = noiDung.substring(0, MAX_CONTENT_LENGTH) + "...";
                                }

                                context.append(String.format(
                                                "--- Tour ID=%s ---\n" +
                                                                "Tên: %s\n" +
                                                                "Giá: %s VNĐ\n" +
                                                                "Số ngày: %s\n" +
                                                                "Địa điểm: %s\n" +
                                                                "Chi tiết: %s\n" +
                                                                "(Độ phù hợp: %.0f%%)\n\n",
                                                tourId, tenTour, gia, soNgay, diaDiem, noiDung,
                                                point.getScore() * 100));
                        }
                }

                // Format kết quả tài liệu chính sách
                if (!docResults.isEmpty()) {
                        context.append("=== DỮ LIỆU CHÍNH SÁCH / TÀI LIỆU ===\n");
                        for (ScoredPoint point : docResults) {
                                String tenFile = getPayloadString(point, "tenFile");
                                String noiDung = getPayloadString(point, "noiDung");
                                context.append(String.format(
                                                "[Nguồn: %s]\n%s\n(Độ phù hợp: %.0f%%)\n\n",
                                                tenFile, noiDung, point.getScore() * 100));
                        }
                }

                return context.toString();
        }

        private String getPayloadString(ScoredPoint point, String key) {
                io.qdrant.client.grpc.JsonWithInt.Value val = point.getPayloadMap().get(key);
                if (val == null)
                        return "";
                if (val.hasStringValue()) {
                        return val.getStringValue();
                }
                // tourId được lưu bằng value(Long) → kiểu integer trong protobuf
                if (val.hasIntegerValue()) {
                        return String.valueOf(val.getIntegerValue());
                }
                if (val.hasDoubleValue()) {
                        return String.valueOf((long) val.getDoubleValue());
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

                        // Thêm lịch sử hội thoại trước đó (bỏ tin nhắn cuối — chính là câu hỏi hiện
                        // tại)
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
                        String currentPrompt = String.format(
                                        """
                                                        [Dữ liệu hệ thống]:
                                                        %s

                                                        [Câu hỏi của khách]: "%s"

                                                        Hãy trả lời câu hỏi trên dựa trên dữ liệu hệ thống. Nếu dữ liệu có tour phù hợp, hãy giới thiệu tour đó với đầy đủ thông tin và mã [TOURID:X]. Nếu không có dữ liệu phù hợp, hãy xin lỗi và gợi ý liên hệ hotline.
                                                        """,
                                        context, question);

                        Map<String, String> currentMsg = new HashMap<>();
                        currentMsg.put("role", "user");
                        currentMsg.put("content", currentPrompt);
                        messages.add(currentMsg);

                        return groqApiService.generateContentWithMessages(SYSTEM_INSTRUCTION, messages);
                } catch (Exception e) {
                        logger.error("Error calling Groq AI", e);
                        return "Xin lỗi anh/chị, em đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline 1900-1234 để được hỗ trợ.";
                }
        }
}