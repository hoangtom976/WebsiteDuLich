package com.dulich.backend.service;

import com.dulich.backend.entity.HinhAnhTour;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.HinhAnhTourRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HinhAnhTourService {

    private final HinhAnhTourRepository hinhAnhTourRepository;
    private final TourRepository tourRepository;
    private final LuuTruAnhService luuTruAnhService;

    public List<HinhAnhTour> layAnhTheoTour(Long tourId) {
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        if (!tourRepository.existsById(tourId)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId);
        }
        return hinhAnhTourRepository.findByTourId(tourId);
    }

    @Transactional
    public HinhAnhTour themAnhChoTour(Long tourId, MultipartFile file) {
        if (tourId == null) {
            throw new LoiBadRequestException("ID tour không được để trống");
        }
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy tour với ID: " + tourId));

        String url = luuTruAnhService.uploadAnh(file);

        HinhAnhTour hinhAnh = new HinhAnhTour();
        hinhAnh.setTour(tour);
        hinhAnh.setUrlHinhAnh(url);

        return hinhAnhTourRepository.save(hinhAnh);
    }

    @Transactional
    public void xoaAnh(Long hinhAnhId) {
        if (hinhAnhId == null) {
            throw new LoiBadRequestException("ID hình ảnh không được để trống");
        }
        if (!hinhAnhTourRepository.existsById(hinhAnhId)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy hình ảnh với ID: " + hinhAnhId);
        }
        hinhAnhTourRepository.deleteById(hinhAnhId);
    }
}
