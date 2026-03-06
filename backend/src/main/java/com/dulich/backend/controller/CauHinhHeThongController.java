package com.dulich.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dulich.backend.dto.CauHinhHeThongDTO;
import com.dulich.backend.service.CauHinhHeThongService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quan-tri/he-thong")
@RequiredArgsConstructor
public class CauHinhHeThongController {

    private final CauHinhHeThongService cauHinhHeThongService;

    @GetMapping("/cai-dat")
    public ResponseEntity<CauHinhHeThongDTO> layCauHinh() {
        return ResponseEntity.ok(cauHinhHeThongService.layCauHinh());
    }

    @PutMapping("/cai-dat")
    public ResponseEntity<CauHinhHeThongDTO> capNhatCauHinh(@RequestBody CauHinhHeThongDTO request) {
        return ResponseEntity.ok(cauHinhHeThongService.capNhatCauHinh(request));
    }
}
