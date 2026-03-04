package com.dulich.backend.controller;

import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.service.DichVuChatbot;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
}