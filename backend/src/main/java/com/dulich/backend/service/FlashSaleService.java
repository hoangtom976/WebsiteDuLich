package com.dulich.backend.service;

import com.dulich.backend.dto.FlashSaleDTO;
import com.dulich.backend.entity.FlashSale;
import com.dulich.backend.entity.Tour;
import com.dulich.backend.repository.FlashSaleRepository;
import com.dulich.backend.repository.HinhAnhTourRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final TourRepository tourRepository;
    private final HinhAnhTourRepository hinhAnhTourRepository;

    @Transactional(readOnly = true)
    public List<FlashSaleDTO> getAllFlashSales() {
        return flashSaleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlashSaleDTO getActiveFlashSaleForTour(Long tourId) {
        return flashSaleRepository.findActiveFlashSaleByTourId(tourId, LocalDateTime.now())
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public FlashSaleDTO getActiveFlashSale() {
        return flashSaleRepository.findCurrentFlashSale(LocalDateTime.now())
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public FlashSaleDTO createFlashSale(FlashSaleDTO dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour"));

        FlashSale flashSale = FlashSale.builder()
                .tour(tour)
                .phanTramGiam(10) // Fixed 10% as requested
                .soLuong(dto.getSoLuong())
                .tgBatDau(dto.getTgBatDau())
                .tgKetThuc(dto.getTgKetThuc())
                .trangThai(dto.getTrangThai() != null ? dto.getTrangThai() : true)
                .build();

        return convertToDTO(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public FlashSaleDTO updateFlashSale(Long id, FlashSaleDTO dto) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Flash Sale"));

        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour"));

        flashSale.setTour(tour);
        flashSale.setPhanTramGiam(10);
        flashSale.setSoLuong(dto.getSoLuong());
        flashSale.setTgBatDau(dto.getTgBatDau());
        flashSale.setTgKetThuc(dto.getTgKetThuc());
        flashSale.setTrangThai(dto.getTrangThai());

        return convertToDTO(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public void deleteFlashSale(Long id) {
        flashSaleRepository.deleteById(id);
    }

    private FlashSaleDTO convertToDTO(FlashSale entity) {
        if (entity == null)
            return null;

        FlashSaleDTO dto = new FlashSaleDTO();
        dto.setId(entity.getId());

        if (entity.getTour() != null) {
            dto.setTourId(entity.getTour().getId());
            dto.setTenTour(entity.getTour().getTenTour());

            // Get first image safely
            List<com.dulich.backend.entity.HinhAnhTour> images = hinhAnhTourRepository
                    .findByTourId(entity.getTour().getId());
            if (!images.isEmpty()) {
                dto.setHinhAnh(images.get(0).getUrlHinhAnh());
            }

            BigDecimal giaGoc = entity.getTour().getGia();
            dto.setGiaGoc(giaGoc);

            if (giaGoc != null && entity.getPhanTramGiam() != null) {
                BigDecimal discount = giaGoc.multiply(new BigDecimal(entity.getPhanTramGiam()))
                        .divide(new BigDecimal(100));
                dto.setGiaKhuyenMai(giaGoc.subtract(discount));
            }
        } else {
            // Log warning if tour is missing even though it should be mandatory
            System.err.println("Warning: FlashSale ID " + entity.getId() + " has NO associated Tour!");
        }

        dto.setPhanTramGiam(entity.getPhanTramGiam());
        dto.setSoLuong(entity.getSoLuong());
        dto.setDaBan(entity.getDaBan());
        dto.setTgBatDau(entity.getTgBatDau());
        dto.setTgKetThuc(entity.getTgKetThuc());
        dto.setTrangThai(entity.getTrangThai());

        return dto;
    }
}
