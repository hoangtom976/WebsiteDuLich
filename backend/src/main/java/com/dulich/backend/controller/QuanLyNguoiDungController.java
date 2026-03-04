package com.dulich.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.dulich.backend.dto.CapNhatNguoiDungDTO;
import com.dulich.backend.dto.NguoiDungDTO;
import com.dulich.backend.dto.PhanQuyenDTO;
import com.dulich.backend.dto.TaoNguoiDungDTO;
import com.dulich.backend.dto.ThayDoiTrangThaiDTO;
import com.dulich.backend.service.QuanLyNguoiDungService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quan-tri/nguoi-dung")
@RequiredArgsConstructor
public class QuanLyNguoiDungController {

    private final QuanLyNguoiDungService quanLyNguoiDungService;

    @GetMapping
    public ResponseEntity<List<NguoiDungDTO>> layTatCaNguoiDung(@RequestParam(required = false) String tuKhoa) {
        List<NguoiDungDTO> danhSach = quanLyNguoiDungService.layTatCaNguoiDung(tuKhoa);
        return ResponseEntity.ok(danhSach);
    }

    @PostMapping
    public ResponseEntity<NguoiDungDTO> taoNguoiDung(@RequestBody @Valid TaoNguoiDungDTO req) {
        return ResponseEntity.ok(quanLyNguoiDungService.taoNguoiDung(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NguoiDungDTO> capNhatNguoiDung(
            @PathVariable Long id,
            @RequestBody @Valid CapNhatNguoiDungDTO req) {
        return ResponseEntity.ok(quanLyNguoiDungService.capNhatNguoiDung(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> xoaNguoiDung(@PathVariable Long id) {
        return ResponseEntity.ok(quanLyNguoiDungService.xoaNguoiDung(id));
    }

    @PostMapping("/phan-quyen")
    public ResponseEntity<String> phanQuyen(@RequestBody @Valid PhanQuyenDTO req) {
        String ketQua = quanLyNguoiDungService.phanQuyenNguoiDung(req);
        return ResponseEntity.ok(ketQua);
    }

    @PostMapping("/thay-doi-trang-thai")
    public ResponseEntity<String> thayDoiTrangThai(@RequestBody @Valid ThayDoiTrangThaiDTO req) {
        String ketQua = quanLyNguoiDungService.thayDoiTrangThai(req);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/khach-hang")
    public ResponseEntity<List<NguoiDungDTO>> layDanhSachKhachHang(@RequestParam(required = false) String tuKhoa) {
        List<NguoiDungDTO> danhSach = quanLyNguoiDungService.layDanhSachKhachHang(tuKhoa);
        return ResponseEntity.ok(danhSach);
    }
}
