package com.dulich.backend.service;

import com.dulich.backend.dto.TourDTO;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class YeuThichService {

    private final NguoiDungRepository nguoiDungRepository;
    private final TourRepository tourRepository;

    @Transactional
    public String thayDoiTrangThaiYeuThich(Long tourId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        Tour tour = tourRepository.findById(Objects.requireNonNull(tourId))
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId));

        Set<Tour> danhSachYeuThich = nguoiDung.getDanhSachYeuThich();

        if (danhSachYeuThich.contains(tour)) {
            danhSachYeuThich.remove(tour);
            nguoiDungRepository.save(nguoiDung);
            return "Đã xóa khỏi danh sách yêu thích";
        } else {
            danhSachYeuThich.add(tour);
            nguoiDungRepository.save(nguoiDung);
            return "Đã thêm vào danh sách yêu thích";
        }
    }

    public List<TourDTO> layDanhSachYeuThich() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        return nguoiDung.getDanhSachYeuThich().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TourDTO convertToDTO(Tour tour) {
        TourDTO dto = new TourDTO();
        dto.setId(tour.getId());
        dto.setTenTour(tour.getTenTour());
        dto.setMoTa(tour.getMoTa());
        dto.setGia(tour.getGia());
        dto.setSoNgay(tour.getSoNgay());
        dto.setTrangThai(tour.getTrangThai());

        if (tour.getDanhMuc() != null)
            dto.setTenDanhMuc(tour.getDanhMuc().getTenDanhMuc());
        if (tour.getDiaDiem() != null)
            dto.setTenDiaDiem(tour.getDiaDiem().getTenDiaDiem());

        return dto;
    }
}