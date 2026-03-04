package com.dulich.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TourChiTietDTO {
    private Long id;
    private String tenTour;
    private String moTa;
    private BigDecimal gia;
    private Integer soNgay;
    private Boolean trangThai;

    private String tenDanhMuc;
    private String tenDiaDiem;

    // Các thuộc tính bổ sung
    private List<String> danhSachAnh;
    private List<LichKhoiHanhDTO> danhSachLich;
}