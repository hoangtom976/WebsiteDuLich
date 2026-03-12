package com.dulich.backend.service;

import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.TourRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.dulich.backend.entity.LichTrinhTour;
import com.dulich.backend.repository.LichTrinhTourRepository;

import static io.qdrant.client.ValueFactory.value;

/**
 * Đồng bộ dữ liệu Tour từ MySQL → Qdrant vector database
 */
@Service
public class DongBoDuLieuService {

    private static final Logger logger = LoggerFactory.getLogger(DongBoDuLieuService.class);

    private final TourRepository tourRepository;
    private final LichTrinhTourRepository lichTrinhTourRepository;
    private final HuggingFaceEmbeddingService embeddingService;
    private final QdrantService qdrantService;

    public DongBoDuLieuService(TourRepository tourRepository,
            LichTrinhTourRepository lichTrinhTourRepository,
            HuggingFaceEmbeddingService embeddingService,
            QdrantService qdrantService) {
        this.tourRepository = tourRepository;
        this.lichTrinhTourRepository = lichTrinhTourRepository;
        this.embeddingService = embeddingService;
        this.qdrantService = qdrantService;
    }

    /**
     * Đồng bộ toàn bộ tour active → Qdrant
     * 
     * @return Số lượng tour đã đồng bộ
     */
    public int dongBo() {
        if (!qdrantService.isAvailable()) {
            throw new RuntimeException("Qdrant không khả dụng. Hãy đảm bảo Qdrant đang chạy.");
        }

        // Xóa tất cả tour vectors cũ (giữ lại tài liệu)
        qdrantService.xoaTheoFilter("loai", "tour");
        logger.info("Đã xóa tour vectors cũ, bắt đầu đồng bộ lại...");

        List<Tour> tours = tourRepository.findAll();
        int count = 0;

        for (Tour tour : tours) {
            if (!Boolean.TRUE.equals(tour.getTrangThai()))
                continue;

            try {
                // 1. Tạo text mô tả tour
                String text = taoTextMoTa(tour);

                // 2. Embed text → vector
                List<Float> vector = embeddingService.embed(text.toLowerCase());

                // 3. Tạo payload
                Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = new HashMap<>();
                payload.put("loai", value("tour"));
                payload.put("tourId", value(tour.getId()));
                payload.put("tenTour", value(tour.getTenTour() != null ? tour.getTenTour() : ""));
                payload.put("gia", value(tour.getGia() != null ? tour.getGia().toString() : "0"));
                payload.put("diaDiem", value(tour.getDiaDiem() != null && tour.getDiaDiem().getTenDiaDiem() != null
                        ? tour.getDiaDiem().getTenDiaDiem()
                        : ""));
                payload.put("moTa", value(tour.getMoTa() != null ? tour.getMoTa() : ""));
                payload.put("soNgay", value(tour.getSoNgay() != null ? tour.getSoNgay().toString() : ""));
                payload.put("noiDung", value(text));

                // 4. Upsert vào Qdrant (dùng tour ID làm point ID)
                qdrantService.upsertVector(tour.getId(), vector, payload);
                count++;

                logger.debug("Đã đồng bộ tour ID={}: {}", tour.getId(), tour.getTenTour());
            } catch (Exception e) {
                logger.error("Lỗi đồng bộ tour ID={}: {}", tour.getId(), e.getMessage());
            }
        }

        logger.info("Đồng bộ hoàn tất: {}/{} tour", count, tours.size());
        return count;
    }

    /**
     * Lấy số lượng vector hiện có trong Qdrant
     */
    public long laySoLuongVector() {
        return qdrantService.demSoLuong();
    }

    /**
     * Tạo text mô tả chi tiết tour để embedding
     */
    private String taoTextMoTa(Tour tour) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tour: ").append(tour.getTenTour() != null ? tour.getTenTour() : "N/A");

        if (tour.getDanhMuc() != null && tour.getDanhMuc().getTenDanhMuc() != null) {
            sb.append(" | Danh mục: ").append(tour.getDanhMuc().getTenDanhMuc());
        }

        if (tour.getDiaDiem() != null && tour.getDiaDiem().getTenDiaDiem() != null) {
            sb.append(" | Địa điểm: ").append(tour.getDiaDiem().getTenDiaDiem());
        }

        if (tour.getGia() != null) {
            sb.append(" | Giá: ").append(tour.getGia()).append(" VNĐ");
        }

        if (tour.getSoNgay() != null) {
            sb.append(" | Thời gian: ").append(tour.getSoNgay()).append(" ngày");
        }

        if (tour.getMoTa() != null && !tour.getMoTa().isBlank()) {
            String moTa = tour.getMoTa().length() > 500
                    ? tour.getMoTa().substring(0, 500) + "..."
                    : tour.getMoTa();
            sb.append(" | Mô tả: ").append(moTa);
        }

        // Bổ sung lịch trình chi tiết vào text embedding
        List<LichTrinhTour> lichTrinhs = lichTrinhTourRepository.findByTourIdOrderByNgayThuAsc(tour.getId());
        if (lichTrinhs != null && !lichTrinhs.isEmpty()) {
            sb.append(" | Lịch trình chi tiết tour \"").append(tour.getTenTour()).append("\": ");
            String chiTietLichTrinh = lichTrinhs.stream()
                    .map(lt -> String.format("Ngày %d của tour \"%s\" - %s: %s", 
                            lt.getNgayThu(), 
                            tour.getTenTour() != null ? tour.getTenTour() : "N/A",
                            lt.getTieuDe() != null ? lt.getTieuDe() : "", 
                            lt.getMoTa() != null ? lt.getMoTa() : ""))
                    .collect(Collectors.joining(". "));
            
            // Giới hạn độ dài lịch trình để tránh vector text quá dài (HF limit)
            if (chiTietLichTrinh.length() > 3000) {
                chiTietLichTrinh = chiTietLichTrinh.substring(0, 3000) + "...";
            }
            sb.append(chiTietLichTrinh);
        }

        return sb.toString();
    }
}
