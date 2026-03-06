package com.dulich.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dulich.backend.dto.DashboardThongKeDTO;
import com.dulich.backend.service.ThongKeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardThongKeDTO> layThongKeDashboard() {
        return ResponseEntity.ok(thongKeService.layThongKeTongQuan());
    }
}
