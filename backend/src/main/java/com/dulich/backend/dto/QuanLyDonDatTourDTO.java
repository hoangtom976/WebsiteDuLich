package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class QuanLyDonDatTourDTO {
    private Long id;
    private Long nguoiDungId;
    private String hoTenNguoiDat;
    private String emailNguoiDat;
    private String soDienThoaiNguoiDat;
    private Long tourId;
    private String tenTour;
    private Long lichKhoiHanhId;
    private LocalDate ngayKhoiHanh;
    private LocalDateTime ngayDat;
    private Integer soLuongKhach;
    private BigDecimal tongTien;
    private String trangThai;
}
