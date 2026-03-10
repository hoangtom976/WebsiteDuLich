package com.dulich.backend.service;

import com.dulich.backend.dto.DiaDiemDTO;
import com.dulich.backend.dto.LichKhoiHanhDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaiNguyenTrungLapException;
import com.dulich.backend.dto.TourChiTietDTO;
import com.dulich.backend.dto.TourDTO;
import com.dulich.backend.entity.DanhMuc;
import com.dulich.backend.entity.DiaDiem;
import com.dulich.backend.entity.HinhAnhTour;
import com.dulich.backend.entity.LichKhoiHanh;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.DanhMucRepository;
import com.dulich.backend.repository.DanhGiaRepository;
import com.dulich.backend.repository.DiaDiemRepository;
import com.dulich.backend.repository.HinhAnhTourRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import com.dulich.backend.repository.LichTrinhTourRepository;
import com.dulich.backend.repository.PhanHoiDanhGiaRepository;
import com.dulich.backend.repository.TourRepository;
import com.dulich.backend.repository.YeuThichRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final DanhMucRepository danhMucRepository;
    private final DiaDiemRepository diaDiemRepository;
    private final HinhAnhTourRepository hinhAnhTourRepository;
    private final LichKhoiHanhRepository lichKhoiHanhRepository;
    private final LichTrinhTourRepository lichTrinhTourRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final PhanHoiDanhGiaRepository phanHoiDanhGiaRepository;
    private final YeuThichRepository yeuThichRepository;

    public List<TourDTO> layTatCaTour() {
        return tourRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TourChiTietDTO layChiTietTour(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + id));

        List<String> danhSachAnh = hinhAnhTourRepository.findByTourId(id).stream()
                .map(HinhAnhTour::getUrlHinhAnh)
                .collect(Collectors.toList());

        List<LichKhoiHanhDTO> danhSachLich = lichKhoiHanhRepository
                .findByTourIdAndNgayKhoiHanhGreaterThanEqual(id, LocalDate.now()).stream()
                .map(this::convertLichToDTO)
                .collect(Collectors.toList());

        return convertToChiTietDTO(tour, danhSachAnh, danhSachLich);
    }

    public List<TourDTO> timKiemTour(String tuKhoa, BigDecimal min, BigDecimal max) {
        return tourRepository.timKiemTour(tuKhoa, min, max).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TourDTO> layTourPhoBien() {
        return tourRepository.timTourPhoBien().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TourDTO themTour(TourDTO req) {
        if (tourRepository.existsByTenTour(req.getTenTour())) {
            throw new TaiNguyenTrungLapException("Tên tour '" + req.getTenTour() + "' đã tồn tại.");
        }

        Long danhMucId = req.getDanhMucId();
        Long diaDiemId = req.getDiaDiemId();
        if (danhMucId == null || diaDiemId == null) {
            throw new LoiBadRequestException("Danh mục và địa điểm không được để trống");
        }

        DanhMuc danhMuc = danhMucRepository.findById(Objects.requireNonNull(danhMucId))
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Danh mục không tồn tại với ID: " + danhMucId));

        DiaDiem diaDiem = diaDiemRepository.findById(Objects.requireNonNull(diaDiemId))
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Địa điểm không tồn tại với ID: " + diaDiemId));

        Tour tour = new Tour();
        tour.setTenTour(req.getTenTour());
        tour.setMoTa(req.getMoTa());
        tour.setGia(req.getGia());
        tour.setSoNgay(req.getSoNgay());
        tour.setTrangThai(req.getTrangThai() != null ? req.getTrangThai() : true);
        tour.setDanhMuc(danhMuc);
        tour.setDiaDiem(diaDiem);

        Tour savedTour = tourRepository.save(tour);

        // Lưu lịch trình nếu có
        if (req.getLichTrinhs() != null && !req.getLichTrinhs().isEmpty()) {
            req.getLichTrinhs().forEach(lt -> {
                com.dulich.backend.entity.LichTrinhTour entity = new com.dulich.backend.entity.LichTrinhTour();
                entity.setTour(savedTour);
                entity.setNgayThu(lt.getNgayThu());
                entity.setTieuDe(lt.getTieuDe());
                entity.setMoTa(lt.getMoTa());
                lichTrinhTourRepository.save(entity);
            });
        }

        return convertToDTO(savedTour);
    }

    @Transactional
    public TourDTO suaTour(Long id, TourDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + id));

        Long danhMucId = req.getDanhMucId();
        Long diaDiemId = req.getDiaDiemId();
        if (danhMucId == null || diaDiemId == null) {
            throw new LoiBadRequestException("Danh mục và địa điểm không được để trống");
        }

        DanhMuc danhMuc = danhMucRepository.findById(Objects.requireNonNull(danhMucId))
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Danh mục không tồn tại với ID: " + danhMucId));

        DiaDiem diaDiem = diaDiemRepository.findById(Objects.requireNonNull(diaDiemId))
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Địa điểm không tồn tại với ID: " + diaDiemId));

        tour.setTenTour(req.getTenTour());
        tour.setMoTa(req.getMoTa());
        tour.setGia(req.getGia());
        tour.setSoNgay(req.getSoNgay());
        if (req.getTrangThai() != null) {
            tour.setTrangThai(req.getTrangThai());
        }
        tour.setDanhMuc(danhMuc);
        tour.setDiaDiem(diaDiem);

        Tour updatedTour = tourRepository.save(tour);

        // Cập nhật lịch trình: Xóa cũ, thêm mới
        if (req.getLichTrinhs() != null) {
            lichTrinhTourRepository.deleteByTourId(id);
            req.getLichTrinhs().forEach(lt -> {
                com.dulich.backend.entity.LichTrinhTour entity = new com.dulich.backend.entity.LichTrinhTour();
                entity.setTour(updatedTour);
                entity.setNgayThu(lt.getNgayThu());
                entity.setTieuDe(lt.getTieuDe());
                entity.setMoTa(lt.getMoTa());
                lichTrinhTourRepository.save(entity);
            });
        }

        return convertToDTO(updatedTour);
    }

    @Transactional
    public void xoaTour(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        if (!tourRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + id);
        }
        if (lichKhoiHanhRepository.existsByTour_Id(id)) {
            throw new LoiBadRequestException(
                    "Không thể xóa tour vì còn lịch khởi hành liên kết. "
                            + "Luồng chuẩn: xóa đơn đặt tour -> xóa lịch khởi hành -> xóa tour.");
        }
        if (lichTrinhTourRepository.existsByTourId(id)) {
            throw new LoiBadRequestException(
                    "Không thể xóa tour vì còn lịch trình liên kết. Hãy xóa lịch trình trước.");
        }
        if (hinhAnhTourRepository.existsByTourId(id)) {
            throw new LoiBadRequestException(
                    "Không thể xóa tour vì còn hình ảnh liên kết. Hãy xóa hình ảnh trước.");
        }
        if (danhGiaRepository.existsByTourId(id)) {
            // Dọn phản hồi đánh giá và đánh giá theo tour trước khi xóa tour.
            phanHoiDanhGiaRepository.deleteByDanhGia_Tour_Id(id);
            danhGiaRepository.deleteByTourId(id);
        }

        if (yeuThichRepository.existsByTour_Id(id)) {
            // Tự dọn các bản ghi wishlist để tránh lỗi khóa ngoại khi xóa tour.
            yeuThichRepository.deleteByTour_Id(id);
        }

        try {
            tourRepository.deleteById(id);
            tourRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new LoiBadRequestException(
                    "Không thể xóa tour vì vẫn còn dữ liệu liên kết trong hệ thống. "
                            + "Vui lòng làm mới dữ liệu ở các trang Đơn hàng, Lịch khởi hành, Lịch trình, "
                            + "Ảnh tour, Đánh giá rồi thử lại.");
        }
    }

    private TourDTO convertToDTO(Tour tour) {
        TourDTO dto = new TourDTO();
        dto.setId(tour.getId());
        dto.setTenTour(tour.getTenTour());
        dto.setMoTa(tour.getMoTa());
        dto.setGia(tour.getGia());
        dto.setSoNgay(tour.getSoNgay());
        dto.setTrangThai(tour.getTrangThai());

        if (tour.getDanhMuc() != null) {
            dto.setDanhMucId(tour.getDanhMuc().getId());
            dto.setTenDanhMuc(tour.getDanhMuc().getTenDanhMuc());
        }

        if (tour.getDiaDiem() != null) {
            dto.setDiaDiemId(tour.getDiaDiem().getId());
            dto.setTenDiaDiem(tour.getDiaDiem().getTenDiaDiem());
            dto.setDiaDiem(convertDiaDiemToDTO(tour.getDiaDiem()));
        }

        List<HinhAnhTour> anhs = hinhAnhTourRepository.findByTourId(tour.getId());
        if (!anhs.isEmpty()) {
            dto.setHinhAnh(anhs.get(0).getUrlHinhAnh());
        }

        // Lấy danh sách lịch trình
        List<com.dulich.backend.dto.LichTrinhTourDTO> lts = lichTrinhTourRepository.findByTourId(tour.getId()).stream()
                .map(lt -> {
                    com.dulich.backend.dto.LichTrinhTourDTO ltDto = new com.dulich.backend.dto.LichTrinhTourDTO();
                    ltDto.setId(lt.getId());
                    ltDto.setNgayThu(lt.getNgayThu());
                    ltDto.setTieuDe(lt.getTieuDe());
                    ltDto.setMoTa(lt.getMoTa());
                    ltDto.setTourId(tour.getId());
                    return ltDto;
                })
                .collect(Collectors.toList());
        dto.setLichTrinhs(lts);

        // Lấy đánh giá sao
        List<Object[]> ratingDataList = danhGiaRepository.getAverageRatingAndCountByTourId(tour.getId());
        if (ratingDataList != null && !ratingDataList.isEmpty()) {
            Object[] ratingData = ratingDataList.get(0);
            Number avgNum = (Number) ratingData[0];
            Number countNum = (Number) ratingData[1];

            Double avg = (avgNum != null) ? avgNum.doubleValue() : 0.0;
            Long count = (countNum != null) ? countNum.longValue() : 0L;

            dto.setSoSaoTrungBinh(Math.round(avg * 10.0) / 10.0);
            dto.setTongDanhGia(count.intValue());
        } else {
            dto.setSoSaoTrungBinh(0.0);
            dto.setTongDanhGia(0);
        }

        dto.setDaYeuThich(kiemTraYeuThich(tour.getId()));

        return dto;
    }

    private boolean kiemTraYeuThich(Long tourId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        String email = auth.getName();
        return yeuThichRepository.existsByNguoiDungEmailAndTourId(email, tourId);
    }

    private LichKhoiHanhDTO convertLichToDTO(LichKhoiHanh lich) {
        LichKhoiHanhDTO dto = new LichKhoiHanhDTO();
        dto.setId(lich.getId());
        dto.setNgayKhoiHanh(lich.getNgayKhoiHanh());
        dto.setTongSoCho(lich.getTongSoCho());
        dto.setSoChoConLai(lich.getSoChoConLai());
        if (lich.getTour() != null) {
            dto.setTourId(lich.getTour().getId());
            dto.setTenTour(lich.getTour().getTenTour());
        }
        return dto;
    }

    private TourChiTietDTO convertToChiTietDTO(Tour tour, List<String> anhs, List<LichKhoiHanhDTO> lichs) {
        TourChiTietDTO dto = new TourChiTietDTO();
        dto.setId(tour.getId());
        dto.setTenTour(tour.getTenTour());
        dto.setMoTa(tour.getMoTa());
        dto.setGia(tour.getGia());
        dto.setSoNgay(tour.getSoNgay());
        dto.setTrangThai(tour.getTrangThai());

        if (tour.getDanhMuc() != null) {
            dto.setTenDanhMuc(tour.getDanhMuc().getTenDanhMuc());
        }
        if (tour.getDiaDiem() != null) {
            dto.setTenDiaDiem(tour.getDiaDiem().getTenDiaDiem());
            dto.setDiaDiem(convertDiaDiemToDTO(tour.getDiaDiem()));
        }

        dto.setDanhSachAnh(anhs);
        dto.setDanhSachLich(lichs);

        // Lấy lịch trình chi tiết
        List<com.dulich.backend.dto.LichTrinhTourDTO> lts = lichTrinhTourRepository.findByTourId(tour.getId()).stream()
                .map(lt -> {
                    com.dulich.backend.dto.LichTrinhTourDTO ltDto = new com.dulich.backend.dto.LichTrinhTourDTO();
                    ltDto.setId(lt.getId());
                    ltDto.setNgayThu(lt.getNgayThu());
                    ltDto.setTieuDe(lt.getTieuDe());
                    ltDto.setMoTa(lt.getMoTa());
                    ltDto.setTourId(tour.getId());
                    return ltDto;
                })
                .collect(Collectors.toList());
        dto.setLichTrinhs(lts);
        dto.setDaYeuThich(kiemTraYeuThich(tour.getId()));

        return dto;
    }

    private DiaDiemDTO convertDiaDiemToDTO(DiaDiem diaDiem) {
        if (diaDiem == null)
            return null;
        DiaDiemDTO dto = new DiaDiemDTO();
        dto.setId(diaDiem.getId());
        dto.setTenDiaDiem(diaDiem.getTenDiaDiem());
        dto.setMoTa(diaDiem.getMoTa());
        dto.setLatitude(diaDiem.getLatitude());
        dto.setLongitude(diaDiem.getLongitude());
        return dto;
    }
}
