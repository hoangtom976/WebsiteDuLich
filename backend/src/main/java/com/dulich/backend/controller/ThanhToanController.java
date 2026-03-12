package com.dulich.backend.controller;

import com.dulich.backend.dto.TaoThanhToanDTO;
import com.dulich.backend.service.ThanhToanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
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
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String ketQua = thanhToanService.xuLyKetQuaThanhToan(request);
        String orderId = request.getParameter("vnp_TxnRef");

        if ("Thanh toán thành công".equals(ketQua)) {
            response.sendRedirect("http://localhost:3000/thanh-toan/ket-qua?status=success&orderId=" + orderId);
        } else if (ketQua != null && ketQua.startsWith("CANCELED:")) {
            String tourId = ketQua.split(":")[1];
            response.sendRedirect("http://localhost:3000/tours/" + tourId);
        } else {
            response.sendRedirect("http://localhost:3000/thanh-toan/ket-qua?status=failed&orderId=" + orderId);
        }
    }
}