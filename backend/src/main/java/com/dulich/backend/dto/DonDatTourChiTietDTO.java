package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DonDatTourChiTietDTO {
    private Long id;
    private LocalDateTime ngayDat;
    private String trangThai;
    private BigDecimal tongTien;

    // Thông tin tour
    private Long tourId;
    private String tenTour;
    private String hinhAnh;
    private LocalDate ngayKhoiHanh;
    private String tenDiaDiem;

    // Chi tiết khách
    private List<KhachDiCungDTO> danhSachKhach;

    // Voucher nếu có
    private String maVoucher;
    private Integer phanTramGiam;
}
