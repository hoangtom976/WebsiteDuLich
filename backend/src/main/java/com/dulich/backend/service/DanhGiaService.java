package com.dulich.backend.service;

import com.dulich.backend.dto.HienThiDanhGiaDTO;
import com.dulich.backend.dto.TraLoiDanhGiaDTO;
import com.dulich.backend.dto.VietDanhGiaDTO;
import com.dulich.backend.entity.DanhGia;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.PhanHoiDanhGia;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.DanhGiaRepository;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.PhanHoiDanhGiaRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final PhanHoiDanhGiaRepository phanHoiDanhGiaRepository;
    private final DonDatTourRepository donDatTourRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final TourRepository tourRepository;

    @Transactional
    public String vietDanhGia(VietDanhGiaDTO req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        Long tourId = req.getTourId();
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }

        // Validation 1: Kiểm tra đã đi tour chưa
        boolean daDiTour = donDatTourRepository.existsByNguoiDungIdAndLichKhoiHanh_Tour_IdAndTrangThai(
                nguoiDung.getId(), tourId, "DA_THANH_TOAN");

        if (!daDiTour) {
            throw new LoiBadRequestException("Bạn phải trải nghiệm tour trước khi đánh giá");
        }

        // Validation 2: Kiểm tra đã đánh giá chưa
        if (danhGiaRepository.existsByNguoiDungIdAndTourId(nguoiDung.getId(), tourId)) {
            throw new LoiBadRequestException("Bạn đã đánh giá tour này rồi");
        }

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId));

        DanhGia danhGia = new DanhGia();
        danhGia.setTour(tour);
        danhGia.setNguoiDung(nguoiDung);
        danhGia.setSoSao(req.getSoSao());
        danhGia.setBinhLuan(req.getBinhLuan());

        danhGiaRepository.save(danhGia);
        return "Đánh giá thành công";
    }

    @Transactional
    public String traLoiDanhGia(TraLoiDanhGiaDTO req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nhanVien = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy nhân viên: " + email));

        Long danhGiaId = req.getDanhGiaId();
        if (danhGiaId == null) {
            throw new LoiBadRequestException("ID đánh giá không được để trống");
        }

        DanhGia danhGia = danhGiaRepository.findById(danhGiaId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đánh giá với ID: " + danhGiaId));

        PhanHoiDanhGia phanHoi = new PhanHoiDanhGia();
        phanHoi.setDanhGia(danhGia);
        phanHoi.setNhanVien(nhanVien);
        phanHoi.setNoiDung(req.getNoiDung());

        phanHoiDanhGiaRepository.save(phanHoi);
        return "Phản hồi đánh giá thành công";
    }

    public List<HienThiDanhGiaDTO> layDanhGiaCuaTour(Long tourId) {
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        if (!tourRepository.existsById(tourId)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId);
        }

        return danhGiaRepository.findByTourIdOrderByNgayDanhGiaDesc(tourId).stream()
                .map(dg -> {
                    HienThiDanhGiaDTO.HienThiDanhGiaDTOBuilder builder = HienThiDanhGiaDTO.builder()
                            .id(dg.getId())
                            .tenNguoiDung(dg.getNguoiDung().getHoTen())
                            // .avatarNguoiDung(...) // Nếu có
                            .soSao(dg.getSoSao())
                            .binhLuan(dg.getBinhLuan())
                            .ngayDanhGia(dg.getNgayDanhGia());

                    if (dg.getPhanHoi() != null) {
                        builder.noiDungPhanHoi(dg.getPhanHoi().getNoiDung())
                                .tenNhanVienPhanHoi(dg.getPhanHoi().getNhanVien().getHoTen())
                                .ngayPhanHoi(dg.getPhanHoi().getNgayPhanHoi());
                    }
                    return builder.build();
                })
                .collect(Collectors.toList());
    }
}