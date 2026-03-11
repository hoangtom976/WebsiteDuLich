package com.dulich.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.dulich.backend.dto.CauHinhHeThongDTO;
import com.dulich.backend.dto.LienHeDTO;
import com.dulich.backend.service.CauHinhHeThongService;
import com.dulich.backend.service.EmailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cong-khai/he-thong")
@RequiredArgsConstructor
public class CongKhaiHeThongController {

    private final CauHinhHeThongService cauHinhHeThongService;
    private final EmailService emailService;

    @GetMapping("/cai-dat")
    public ResponseEntity<CauHinhHeThongDTO> layCauHinh() {
        return ResponseEntity.ok(cauHinhHeThongService.layCauHinh());
    }

    @PostMapping("/lien-he")
    public ResponseEntity<String> guiLienHe(@Valid @RequestBody LienHeDTO request) {
        String adminEmail = cauHinhHeThongService.layCauHinh().getEmailLienHe();
        if (adminEmail == null || adminEmail.isEmpty()) {
            return ResponseEntity.badRequest().body("Hệ thống chưa cấu hình email liên hệ.");
        }

        String subject = "Có tin nhắn liên hệ mới từ: " + request.getName();
        String text = "Bạn nhận được một tin nhắn liên hệ từ hệ thống:\n\n" +
                "Họ tên: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n" +
                "Số điện thoại: " + (request.getPhone() != null ? request.getPhone() : "Không có") + "\n\n" +
                "Nội dung:\n" + request.getMessage();
        emailService.sendSimpleMessage(adminEmail, subject, text);

        return ResponseEntity.ok("Gửi liên hệ thành công!");
    }
}
