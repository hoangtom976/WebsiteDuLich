package com.dulich.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dulich.backend.dto.YeuCauChatDTO;
import com.dulich.backend.service.DichVuChatbot;
import com.dulich.backend.service.DongBoDuLieuService;
import com.dulich.backend.service.TaiLieuRagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final DichVuChatbot dichVuChatbot;
    private final DongBoDuLieuService dongBoDuLieuService;
    private final TaiLieuRagService taiLieuRagService;

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

    @GetMapping("/nguoi-dung/{nguoiDungId}/phien-chat")
    public ResponseEntity<?> layPhienChatCuaNguoiDung(@PathVariable Long nguoiDungId) {
        return ResponseEntity.ok(dichVuChatbot.layCacPhienChatCuaNguoiDung(nguoiDungId));
    }

    @GetMapping("/debug-search")
    public ResponseEntity<?> debugSearch(@RequestParam String q) {
        return ResponseEntity.ok(dichVuChatbot.debugSearch(q));
    }

    // ============ ADMIN - RAG ENDPOINTS ============

    /**
     * Đồng bộ dữ liệu tour từ MySQL → Qdrant (chỉ ADMIN)
     */
    @PostMapping("/dong-bo")
    public ResponseEntity<?> dongBoDuLieu() {
        int soLuong = dongBoDuLieuService.dongBo();
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Đồng bộ thành công");
        result.put("soLuongTour", soLuong);
        result.put("tongSoVector", dongBoDuLieuService.laySoLuongVector());
        return ResponseEntity.ok(result);
    }

    /**
     * Upload file .txt chính sách/thông tin → Qdrant (chỉ ADMIN)
     */
    @PostMapping("/upload-tai-lieu")
    public ResponseEntity<?> uploadTaiLieu(@RequestParam("file") MultipartFile file) {
        int soChunks = taiLieuRagService.uploadVaEmbedFile(file);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Upload thành công");
        result.put("tenFile", file.getOriginalFilename());
        result.put("soChunks", soChunks);
        result.put("tongSoVector", dongBoDuLieuService.laySoLuongVector());
        return ResponseEntity.ok(result);
    }

    /**
     * Xóa tài liệu đã upload khỏi Qdrant (chỉ ADMIN)
     */
    @DeleteMapping("/tai-lieu/{tenFile}")
    public ResponseEntity<?> xoaTaiLieu(@PathVariable String tenFile) {
        taiLieuRagService.xoaTaiLieu(tenFile);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Đã xóa tài liệu: " + tenFile);
        result.put("tongSoVector", dongBoDuLieuService.laySoLuongVector());
        return ResponseEntity.ok(result);
    }
}