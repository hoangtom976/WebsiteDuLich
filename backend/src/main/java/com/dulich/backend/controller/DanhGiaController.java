package com.dulich.backend.controller;

import com.dulich.backend.dto.HienThiDanhGiaDTO;
import com.dulich.backend.dto.TraLoiDanhGiaDTO;
import com.dulich.backend.dto.TourChoDanhGiaDTO;
import com.dulich.backend.dto.VietDanhGiaDTO;
import com.dulich.backend.service.DanhGiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-gia")
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    @PostMapping
    public ResponseEntity<String> vietDanhGia(@RequestBody @Valid VietDanhGiaDTO req) {
        String ketQua = danhGiaService.vietDanhGia(req);
        return new ResponseEntity<>(ketQua, HttpStatus.CREATED);
    }

    @PostMapping("/phan-hoi")
    public ResponseEntity<String> traLoiDanhGia(@RequestBody @Valid TraLoiDanhGiaDTO req) {
        String ketQua = danhGiaService.traLoiDanhGia(req);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<HienThiDanhGiaDTO>> layDanhGiaCuaTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(danhGiaService.layDanhGiaCuaTour(tourId));
    }

    @GetMapping("/cua-toi")
    public ResponseEntity<List<HienThiDanhGiaDTO>> layDanhGiaCuaToi() {
        return ResponseEntity.ok(danhGiaService.layDanhGiaCuaToi());
    }

    @GetMapping("/tour-cho-danh-gia")
    public ResponseEntity<List<TourChoDanhGiaDTO>> layTourChoDanhGia() {
        return ResponseEntity.ok(danhGiaService.layTourChoDanhGia());
    }

    @GetMapping("/tat-ca")
    public ResponseEntity<List<HienThiDanhGiaDTO>> layTatCaDanhGia() {
        return ResponseEntity.ok(danhGiaService.layTatCaDanhGia());
    }
}