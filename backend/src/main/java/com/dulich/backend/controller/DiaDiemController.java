package com.dulich.backend.controller;

import com.dulich.backend.dto.DiaDiemDTO;
import com.dulich.backend.entity.DiaDiem;
import com.dulich.backend.service.DiaDiemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dia-diem")
@RequiredArgsConstructor
public class DiaDiemController {

    private final DiaDiemService diaDiemService;

    @GetMapping
    public ResponseEntity<List<DiaDiem>> layTatCa() {
        return ResponseEntity.ok(diaDiemService.layTatCa());
    }

    @PostMapping
    public ResponseEntity<DiaDiem> themDiaDiem(@RequestBody @Valid DiaDiemDTO req) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        DiaDiem diaDiem = diaDiemService.themDiaDiem(req);
        return new ResponseEntity<>(diaDiem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiaDiem> suaDiaDiem(@PathVariable Long id, @RequestBody @Valid DiaDiemDTO req) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        DiaDiem diaDiem = diaDiemService.suaDiaDiem(id, req);
        return ResponseEntity.ok(diaDiem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaDiaDiem(@PathVariable Long id) {
        // Việc kiểm tra quyền STAFF/ADMIN sẽ được thực hiện ở SecurityConfig
        diaDiemService.xoaDiaDiem(id);
        return ResponseEntity.noContent().build();
    }
}