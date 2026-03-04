package com.dulich.backend.controller;

import com.dulich.backend.dto.TourDTO;
import com.dulich.backend.service.YeuThichService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/yeu-thich")
@RequiredArgsConstructor
public class YeuThichController {

    private final YeuThichService yeuThichService;

    @PostMapping("/{tourId}")
    public ResponseEntity<String> thayDoiTrangThaiYeuThich(@PathVariable Long tourId) {
        String ketQua = yeuThichService.thayDoiTrangThaiYeuThich(tourId);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping
    public ResponseEntity<List<TourDTO>> layDanhSachYeuThich() {
        return ResponseEntity.ok(yeuThichService.layDanhSachYeuThich());
    }
}