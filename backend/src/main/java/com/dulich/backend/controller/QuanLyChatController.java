package com.dulich.backend.controller;

import com.dulich.backend.dto.PhienChatQuanTriDTO;
import com.dulich.backend.service.DichVuChatbot;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quan-tri/chat")
@RequiredArgsConstructor
public class QuanLyChatController {
    private final DichVuChatbot dichVuChatbot;
    @GetMapping
    public ResponseEntity<List<PhienChatQuanTriDTO>> layTatCaPhienChat() {
        return ResponseEntity.ok(dichVuChatbot.layTatCaPhienChat());
    }
}