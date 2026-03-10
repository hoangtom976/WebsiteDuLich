package com.dulich.backend.controller;

import com.dulich.backend.dto.ChiTietThoiTietDTO;
import com.dulich.backend.dto.DuBaoThoiTietDTO;
import com.dulich.backend.service.DiaDiemService;
import com.dulich.backend.service.DichVuThoiTiet;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thoi-tiet")
@RequiredArgsConstructor
public class ThoiTietController {

    private final DichVuThoiTiet dichVuThoiTiet;
    private final DiaDiemService diaDiemService;

    @GetMapping("/hien-tai")
    public ResponseEntity<ChiTietThoiTietDTO> layThoiTietHienTai(
            @RequestParam Double lat,
            @RequestParam Double lon) {
        return ResponseEntity.ok(dichVuThoiTiet.layThoiTietHienTai(lat, lon));
    }

    @GetMapping("/du-bao")
    public ResponseEntity<DuBaoThoiTietDTO> layDuBaoThoiTiet(
            @RequestParam Double lat,
            @RequestParam Double lon) {
        return ResponseEntity.ok(dichVuThoiTiet.layDuBaoThoiTiet(lat, lon));
    }

    @PostMapping("/cap-nhat-toa-do")
    public ResponseEntity<String> capNhatToaDoChoDiaDiem() {
        try {
            int count = diaDiemService.capNhatToaDoChoTatCa();
            return ResponseEntity.ok("Đã cập nhật tọa độ tự động cho " + count + " địa điểm.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

}