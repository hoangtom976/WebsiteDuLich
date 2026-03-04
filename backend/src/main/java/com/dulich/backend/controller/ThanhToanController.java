package com.dulich.backend.controller;

import com.dulich.backend.dto.TaoThanhToanDTO;
import com.dulich.backend.service.ThanhToanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thanh-toan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    @PostMapping("/tao-url")
    public ResponseEntity<String> taoUrlThanhToan(@RequestBody @Valid TaoThanhToanDTO req, HttpServletRequest request) {
        String url = thanhToanService.taoUrlThanhToan(req, request);
        return ResponseEntity.ok(url);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<String> vnpayReturn(HttpServletRequest request) {
        String ketQua = thanhToanService.xuLyKetQuaThanhToan(request);
        return ResponseEntity.ok(ketQua);
    }
}