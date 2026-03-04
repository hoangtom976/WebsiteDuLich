package com.dulich.backend.controller;

import com.dulich.backend.dto.ChiTietThoiTietDTO;
import com.dulich.backend.service.DichVuThoiTiet;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/thoi-tiet")
@RequiredArgsConstructor
public class ThoiTietController {

    private final DichVuThoiTiet dichVuThoiTiet;

    @GetMapping("/hien-tai")
    public ResponseEntity<ChiTietThoiTietDTO> layThoiTietHienTai(
            @RequestParam Double lat,
            @RequestParam Double lon) {
        return ResponseEntity.ok(dichVuThoiTiet.layThoiTietHienTai(lat, lon));
    }
}