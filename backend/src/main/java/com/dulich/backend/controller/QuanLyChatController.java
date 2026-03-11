package com.dulich.backend.controller;

import com.dulich.backend.dto.PhienChatQuanTriDTO;
import com.dulich.backend.service.DichVuChatbot;
import com.dulich.backend.service.DongBoDuLieuService;
import com.dulich.backend.service.QdrantService;
import com.dulich.backend.service.TaiLieuRagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quan-tri/chat")
@RequiredArgsConstructor
public class QuanLyChatController {
    private final DichVuChatbot dichVuChatbot;
    private final DongBoDuLieuService dongBoDuLieuService;
    private final QdrantService qdrantService;
    private final TaiLieuRagService taiLieuRagService;

    @GetMapping
    public ResponseEntity<List<PhienChatQuanTriDTO>> layTatCaPhienChat() {
        return ResponseEntity.ok(dichVuChatbot.layTatCaPhienChat());
    }

    /**
     * Thống kê RAG: số lượng vector, trạng thái Qdrant
     */
    @GetMapping("/thong-ke-rag")
    public ResponseEntity<?> layThongKeRAG() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("qdrantKhaDung", qdrantService.isAvailable());
        stats.put("tongSoVector", dongBoDuLieuService.laySoLuongVector());
        stats.put("danhSachTaiLieu", taiLieuRagService.layDanhSachTaiLieu());
        return ResponseEntity.ok(stats);
    }

    /**
     * Danh sách tài liệu đã upload
     */
    @GetMapping("/tai-lieu")
    public ResponseEntity<List<String>> layDanhSachTaiLieu() {
        return ResponseEntity.ok(taiLieuRagService.layDanhSachTaiLieu());
    }
}