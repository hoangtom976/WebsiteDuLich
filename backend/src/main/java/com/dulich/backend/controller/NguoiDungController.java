package com.dulich.backend.controller;

import com.dulich.backend.dto.CapNhatHoSoDTO;
import com.dulich.backend.dto.DoiMatKhauNguoiDungDTO;
import com.dulich.backend.dto.NguoiDungDTO;
import com.dulich.backend.service.NguoiDungService;
import com.dulich.backend.service.XacThucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final XacThucService xacThucService;
    private final NguoiDungService nguoiDungService;

    @GetMapping("/thong-tin")
    public ResponseEntity<NguoiDungDTO> layThongTinCaNhan() {
        return ResponseEntity.ok(nguoiDungService.layThongTinCaNhan());
    }

    @PutMapping("/thong-tin")
    public ResponseEntity<NguoiDungDTO> capNhatThongTinCaNhan(@Valid @RequestBody CapNhatHoSoDTO request) {
        return ResponseEntity.ok(nguoiDungService.capNhatHoSo(request));
    }

    @PutMapping("/doi-mat-khau")
    public ResponseEntity<String> doiMatKhau(@Valid @RequestBody DoiMatKhauNguoiDungDTO request) {
        return ResponseEntity.ok(xacThucService.doiMatKhau(request));
    }
}
