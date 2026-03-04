package com.dulich.backend.service;

import com.dulich.backend.dto.LichTrinhTourDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaiNguyenTrungLapException;
import com.dulich.backend.entity.LichTrinhTour;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.LichTrinhTourRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichTrinhTourService {

    private final LichTrinhTourRepository lichTrinhTourRepository;
    private final TourRepository tourRepository;

    public List<LichTrinhTourDTO> layLichTrinhTheoTour(Long tourId) {
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour khong duoc de trong");
        }
        if (!tourRepository.existsById(tourId)) {
            throw new TaiNguyenKhongTonTaiException("Khong tim thay tour voi ID: " + tourId);
        }
        return lichTrinhTourRepository.findByTourIdOrderByNgayThuAsc(tourId).stream()
                .map(this::chuyenDoiSangDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LichTrinhTourDTO themLichTrinh(LichTrinhTourDTO req) {
        Long tourId = req.getTourId();
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour khong duoc de trong");
        }
        if (req.getNgayThu() == null || req.getNgayThu() < 1) {
            throw new LoiBadRequestException("Ngay thu phai >= 1");
        }
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Khong tim thay tour voi ID: " + tourId));

        if (lichTrinhTourRepository.existsByTourIdAndNgayThu(tourId, req.getNgayThu())) {
            throw new TaiNguyenTrungLapException("Ngay thu " + req.getNgayThu() + " da ton tai trong tour nay.");
        }

        LichTrinhTour lichTrinh = new LichTrinhTour();
        lichTrinh.setTour(tour);
        lichTrinh.setNgayThu(req.getNgayThu());
        lichTrinh.setTieuDe(req.getTieuDe());
        lichTrinh.setMoTa(req.getMoTa());

        LichTrinhTour savedLichTrinh = lichTrinhTourRepository.save(lichTrinh);
        return chuyenDoiSangDTO(savedLichTrinh);
    }

    @Transactional
    public LichTrinhTourDTO capNhatLichTrinh(Long id, LichTrinhTourDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID lich trinh khong duoc de trong");
        }
        Long tourId = req.getTourId();
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour khong duoc de trong");
        }
        if (req.getNgayThu() == null || req.getNgayThu() < 1) {
            throw new LoiBadRequestException("Ngay thu phai >= 1");
        }

        LichTrinhTour lichTrinh = lichTrinhTourRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Khong tim thay lich trinh voi ID: " + id));

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Khong tim thay tour voi ID: " + tourId));

        if (lichTrinhTourRepository.existsByTourIdAndNgayThuAndIdNot(tourId, req.getNgayThu(), id)) {
            throw new TaiNguyenTrungLapException("Ngay thu " + req.getNgayThu() + " da ton tai trong tour nay.");
        }

        lichTrinh.setTour(tour);
        lichTrinh.setNgayThu(req.getNgayThu());
        lichTrinh.setTieuDe(req.getTieuDe());
        lichTrinh.setMoTa(req.getMoTa());

        LichTrinhTour savedLichTrinh = lichTrinhTourRepository.save(lichTrinh);
        return chuyenDoiSangDTO(savedLichTrinh);
    }

    @Transactional
    public void xoaLichTrinh(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID lich trinh khong duoc de trong");
        }
        if (!lichTrinhTourRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Khong tim thay lich trinh voi ID: " + id);
        }
        lichTrinhTourRepository.deleteById(id);
    }

    private LichTrinhTourDTO chuyenDoiSangDTO(LichTrinhTour entity) {
        LichTrinhTourDTO dto = new LichTrinhTourDTO();
        dto.setId(entity.getId());
        dto.setNgayThu(entity.getNgayThu());
        dto.setTieuDe(entity.getTieuDe());
        dto.setMoTa(entity.getMoTa());
        dto.setTourId(entity.getTour().getId());
        return dto;
    }
}
