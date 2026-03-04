package com.dulich.backend.controller;

import com.dulich.backend.dto.TourDTO;
import com.dulich.backend.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourDTO>> layTatCaTour() {
        return ResponseEntity.ok(tourService.layTatCaTour());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layChiTietTour(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.layChiTietTour(id));
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<List<TourDTO>> timKiemTour(
            @RequestParam(required = false) String tuKhoa,
            @RequestParam(required = false) BigDecimal giaMin,
            @RequestParam(required = false) BigDecimal giaMax) {
        return ResponseEntity.ok(tourService.timKiemTour(tuKhoa, giaMin, giaMax));
    }

    @GetMapping("/pho-bien")
    public ResponseEntity<?> layTourPhoBien() {
        return ResponseEntity.ok(tourService.layTourPhoBien());
    }

    @PostMapping
    public ResponseEntity<?> themTour(@RequestBody @Valid TourDTO req) {
        TourDTO tour = tourService.themTour(req);
        return new ResponseEntity<>(tour, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> suaTour(@PathVariable Long id, @RequestBody @Valid TourDTO req) {
        TourDTO tour = tourService.suaTour(id, req);
        return ResponseEntity.ok(tour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaTour(@PathVariable Long id) {
        tourService.xoaTour(id);
        return ResponseEntity.noContent().build();
    }
}