package com.dulich.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.service.DichVuChatbot;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final DichVuChatbot dichVuChatbot;

    @PostMapping("/hoi")
    public ResponseEntity<?> hoiChatbot(@RequestBody YeuCauChatDTO req) {
        Map<String, Object> ketQua = dichVuChatbot.xuLyChat(req);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/goi-y")
    public ResponseEntity<List<String>> layCauHoiGoiY() {
        return ResponseEntity.ok(dichVuChatbot.layDanhSachCauHoiGoiY());
    }

    @GetMapping("/lich-su/{phienChatId}")
    public ResponseEntity<?> layLichSuChat(@PathVariable Long phienChatId) {
        return ResponseEntity.ok(dichVuChatbot.layLichSuChat(phienChatId));
    }

    @DeleteMapping("/lich-su/{phienChatId}")
    public ResponseEntity<Void> xoaLichSuChat(@PathVariable Long phienChatId) {
        dichVuChatbot.xoaPhienChat(phienChatId);
        return ResponseEntity.noContent().build();
    }
}