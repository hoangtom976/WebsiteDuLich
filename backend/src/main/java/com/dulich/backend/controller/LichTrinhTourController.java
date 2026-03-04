package com.dulich.backend.controller;

import com.dulich.backend.dto.LichTrinhTourDTO;
import com.dulich.backend.service.LichTrinhTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lich-trinh")
@RequiredArgsConstructor
public class LichTrinhTourController {

    private final LichTrinhTourService lichTrinhTourService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<LichTrinhTourDTO>> layLichTrinhTheoTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(lichTrinhTourService.layLichTrinhTheoTour(tourId));
    }

    @PostMapping
    public ResponseEntity<LichTrinhTourDTO> themLichTrinh(@RequestBody @Valid LichTrinhTourDTO req) {
        return new ResponseEntity<>(lichTrinhTourService.themLichTrinh(req), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichTrinhTourDTO> capNhatLichTrinh(
            @PathVariable Long id,
            @RequestBody @Valid LichTrinhTourDTO req) {
        return ResponseEntity.ok(lichTrinhTourService.capNhatLichTrinh(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaLichTrinh(@PathVariable Long id) {
        lichTrinhTourService.xoaLichTrinh(id);
        return ResponseEntity.noContent().build();
    }
}
