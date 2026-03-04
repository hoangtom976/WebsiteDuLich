package com.dulich.backend.controller;

import com.dulich.backend.entity.HinhAnhTour;
import com.dulich.backend.service.HinhAnhTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/hinh-anh")
@RequiredArgsConstructor
public class HinhAnhTourController {

    private final HinhAnhTourService hinhAnhTourService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<HinhAnhTour>> layAnhTheoTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(hinhAnhTourService.layAnhTheoTour(tourId));
    }

    @PostMapping("/tour/{tourId}")
    public ResponseEntity<?> uploadAnh(@PathVariable Long tourId, @RequestParam("file") MultipartFile file) {
        HinhAnhTour hinhAnh = hinhAnhTourService.themAnhChoTour(tourId, file);
        return new ResponseEntity<>(hinhAnh, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaAnh(@PathVariable Long id) {
        hinhAnhTourService.xoaAnh(id);
        return ResponseEntity.noContent().build();
    }
}
