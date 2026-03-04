package com.dulich.backend.controller;

import com.dulich.backend.dto.DanhMucDTO;
import com.dulich.backend.entity.DanhMuc;
import com.dulich.backend.service.DanhMucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@RequiredArgsConstructor
public class DanhMucController {

    private final DanhMucService danhMucService;

    @GetMapping
    public ResponseEntity<List<DanhMuc>> layTatCa() {
        return ResponseEntity.ok(danhMucService.layTatCa());
    }

    @PostMapping
    public ResponseEntity<DanhMuc> themDanhMuc(@RequestBody @Valid DanhMucDTO req) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        DanhMuc danhMuc = danhMucService.themDanhMuc(req);
        return new ResponseEntity<>(danhMuc, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhMuc> suaDanhMuc(@PathVariable Long id, @RequestBody @Valid DanhMucDTO req) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        DanhMuc danhMuc = danhMucService.suaDanhMuc(id, req);
        return ResponseEntity.ok(danhMuc);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaDanhMuc(@PathVariable Long id) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        danhMucService.xoaDanhMuc(id);
        return ResponseEntity.noContent().build();
    }
}