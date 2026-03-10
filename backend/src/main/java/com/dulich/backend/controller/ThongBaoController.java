package com.dulich.backend.controller;

import com.dulich.backend.entity.ThongBao;
import com.dulich.backend.service.ThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thong-bao")
@RequiredArgsConstructor
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    @GetMapping
    public ResponseEntity<List<ThongBao>> layThongBaoCuaToi() {
        return ResponseEntity.ok(thongBaoService.layThongBaoCuaToi());
    }

    @PutMapping("/doc/{id}")
    public ResponseEntity<Void> danhDauDaDoc(@PathVariable Long id) {
        thongBaoService.danhDauDaDoc(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/chua-doc/count")
    public ResponseEntity<Long> demThongBaoChuaDoc() {
        return ResponseEntity.ok(thongBaoService.demThongBaoChuaDoc());
    }
}
