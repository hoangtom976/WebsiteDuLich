package com.dulich.backend.controller;

import com.dulich.backend.dto.DonDatTourChiTietDTO;
import com.dulich.backend.dto.DuyetDonDTO;
import com.dulich.backend.dto.LichSuDatTourDTO;
import com.dulich.backend.dto.QuanLyDonDatTourDTO;
import com.dulich.backend.dto.YeuCauDatTourDTO;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.service.DatTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/dat-tour")
@RequiredArgsConstructor
public class DatTourController {

    private final DatTourService datTourService;

    @PostMapping
    public ResponseEntity<?> datTour(@RequestBody @Valid YeuCauDatTourDTO req) {
        DonDatTour donDatTour = datTourService.datTour(req);
        return new ResponseEntity<>(donDatTour, HttpStatus.CREATED);
    }

    @PutMapping("/huy/{id}")
    public ResponseEntity<String> huyDonHang(@PathVariable Long id) {
        String ketQua = datTourService.huyDonHang(id);
        return ResponseEntity.ok(ketQua);
    }

    @PutMapping("/xac-nhan-thanh-toan/{id}")
    public ResponseEntity<String> xacNhanThanhToan(@PathVariable Long id) {
        String ketQua = datTourService.xacNhanThanhToanThuCong(id);
        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/lich-su")
    public ResponseEntity<?> layLichSuDatTour() {
        List<LichSuDatTourDTO> lichSu = datTourService.layLichSuDatTour();
        return ResponseEntity.ok(lichSu);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonDatTourChiTietDTO> layChiTietDonHang(@PathVariable Long id) {
        return ResponseEntity.ok(datTourService.layChiTietDonHang(id));
    }

    @GetMapping("/quan-ly")
    public ResponseEntity<List<QuanLyDonDatTourDTO>> layDanhSachDonQuanTri(
            @RequestParam(required = false) String tuKhoa,
            @RequestParam(required = false) String trangThai) {
        return ResponseEntity.ok(datTourService.layDanhSachDonQuanTri(tuKhoa, trangThai));
    }

    @PutMapping("/duyet/{id}")
    public ResponseEntity<String> duyetDonHang(@PathVariable Long id, @RequestBody @Valid DuyetDonDTO req) {
        String ketQua = datTourService.duyetDonHang(id, req);
        return ResponseEntity.ok(ketQua);
    }

    @SuppressWarnings("null")
    @GetMapping("/xuat-excel/{lichKhoiHanhId}")
    public ResponseEntity<InputStreamResource> xuatDanhSachKhachHang(@PathVariable Long lichKhoiHanhId) {
        ByteArrayInputStream in = datTourService.xuatDanhSachKhachHang(lichKhoiHanhId);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=danh_sach_khach.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
