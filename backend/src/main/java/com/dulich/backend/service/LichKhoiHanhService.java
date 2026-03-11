package com.dulich.backend.service;

import com.dulich.backend.dto.CapNhatNgayKhoiHanhDTO;
import com.dulich.backend.dto.CapNhatSoChoDTO;
import com.dulich.backend.dto.LichKhoiHanhDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.entity.LichKhoiHanh;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichKhoiHanhService {

    private final LichKhoiHanhRepository lichKhoiHanhRepository;
    private final TourRepository tourRepository;
    private final DonDatTourRepository donDatTourRepository;

    public List<LichKhoiHanhDTO> layLichTheoTour(Long tourId) {
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        if (!tourRepository.existsById(tourId)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId);
        }
        return lichKhoiHanhRepository.findByTourId(tourId).stream()
                .map(this::chuyenDoiSangDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LichKhoiHanhDTO themLich(LichKhoiHanhDTO req) {
        Long tourId = req.getTourId();
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId));

        LichKhoiHanh lich = new LichKhoiHanh();
        lich.setTour(tour);
        lich.setNgayKhoiHanh(req.getNgayKhoiHanh());
        lich.setTongSoCho(req.getTongSoCho());
        lich.setSoChoConLai(req.getTongSoCho());

        LichKhoiHanh savedLich = lichKhoiHanhRepository.save(lich);
        return chuyenDoiSangDTO(savedLich);
    }

    @Transactional
    public LichKhoiHanhDTO capNhatSoCho(Long lichId, CapNhatSoChoDTO req) {
        if (lichId == null) {
            throw new LoiBadRequestException("ID lịch khởi hành không được để trống");
        }
        LichKhoiHanh lich = lichKhoiHanhRepository.findById(lichId)
                .orElseThrow(
                        () -> new TaiNguyenKhongTonTaiException("Không tìm thấy lịch khởi hành với ID: " + lichId));

        int soKhachDaDat = lich.getTongSoCho() - lich.getSoChoConLai();
        if (req.getTongSoCho() < soKhachDaDat) {
            throw new LoiBadRequestException(
                    "Số chỗ mới không được nhỏ hơn số khách đã đặt (" + soKhachDaDat + ")");
        }

        lich.setTongSoCho(req.getTongSoCho());
        lich.setSoChoConLai(req.getTongSoCho() - soKhachDaDat);

        LichKhoiHanh savedLich = lichKhoiHanhRepository.save(lich);
        return chuyenDoiSangDTO(savedLich);
    }

    @Transactional
    public LichKhoiHanhDTO capNhatNgayKhoiHanh(Long lichId, CapNhatNgayKhoiHanhDTO req) {
        if (lichId == null) {
            throw new LoiBadRequestException("ID lịch khởi hành không được để trống");
        }
        LichKhoiHanh lich = lichKhoiHanhRepository.findById(lichId)
                .orElseThrow(
                        () -> new TaiNguyenKhongTonTaiException("Không tìm thấy lịch khởi hành với ID: " + lichId));

        lich.setNgayKhoiHanh(req.getNgayKhoiHanh());

        LichKhoiHanh savedLich = lichKhoiHanhRepository.save(lich);
        return chuyenDoiSangDTO(savedLich);
    }

    @Transactional
    public void xoaLich(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID lịch khởi hành không được để trống");
        }
        if (!lichKhoiHanhRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy lịch khởi hành với ID: " + id);
        }

        List<DonDatTour> danhSachDon = donDatTourRepository.findByLichKhoiHanh_Id(id);
        boolean conDonChuaHuy = danhSachDon.stream()
                .anyMatch(don -> !"DA_HUY".equals(don.getTrangThai()));

        if (conDonChuaHuy) {
            throw new LoiBadRequestException(
                    "Không thể xóa lịch khởi hành vì còn đơn chưa hủy liên kết. "
                            + "Hãy chuyển tất cả đơn về trạng thái ĐÃ_HỦY trước.");
        }

        if (!danhSachDon.isEmpty()) {
            // Tất cả đơn đã hủy, xóa đơn trước để không vướng khóa ngoại.
            donDatTourRepository.deleteAll(danhSachDon);
        }

        lichKhoiHanhRepository.deleteById(id);
    }

    private LichKhoiHanhDTO chuyenDoiSangDTO(LichKhoiHanh lich) {
        LichKhoiHanhDTO dto = new LichKhoiHanhDTO();
        dto.setId(lich.getId());
        dto.setNgayKhoiHanh(lich.getNgayKhoiHanh());
        dto.setTongSoCho(lich.getTongSoCho());
        dto.setSoChoConLai(lich.getSoChoConLai());

        if (lich.getTour() != null) {
            dto.setTourId(lich.getTour().getId());
            dto.setTenTour(lich.getTour().getTenTour());
            dto.setSoNgay(lich.getTour().getSoNgay());
        }

        return dto;
    }
}
