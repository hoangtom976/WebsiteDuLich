package com.dulich.backend.controller;

import com.dulich.backend.dto.CapNhatNgayKhoiHanhDTO;
import com.dulich.backend.dto.CapNhatSoChoDTO;
import com.dulich.backend.dto.LichKhoiHanhDTO;
import com.dulich.backend.service.LichKhoiHanhService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lich-khoi-hanh")
@RequiredArgsConstructor
public class LichKhoiHanhController {

    private final LichKhoiHanhService lichKhoiHanhService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<LichKhoiHanhDTO>> layLichTheoTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(lichKhoiHanhService.layLichTheoTour(tourId));
    }

    @PostMapping
    public ResponseEntity<LichKhoiHanhDTO> themLich(@RequestBody @Valid LichKhoiHanhDTO req) {
        return new ResponseEntity<>(lichKhoiHanhService.themLich(req), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/so-cho")
    public ResponseEntity<LichKhoiHanhDTO> capNhatSoCho(
            @PathVariable Long id,
            @RequestBody @Valid CapNhatSoChoDTO req) {
        return ResponseEntity.ok(lichKhoiHanhService.capNhatSoCho(id, req));
    }

    @PatchMapping("/{id}/ngay-khoi-hanh")
    public ResponseEntity<LichKhoiHanhDTO> capNhatNgayKhoiHanh(
            @PathVariable Long id,
            @RequestBody @Valid CapNhatNgayKhoiHanhDTO req) {
        return ResponseEntity.ok(lichKhoiHanhService.capNhatNgayKhoiHanh(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaLich(@PathVariable Long id) {
        lichKhoiHanhService.xoaLich(id);
        return ResponseEntity.noContent().build();
    }
}
