package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class LichSuDatTourDTO {
    private Long id;
    private LocalDateTime ngayDat;
    private String tenTour;
    private LocalDate ngayKhoiHanh;
    private Integer soLuongKhach;
    private BigDecimal tongTien;
    private String trangThai;
    private Integer soNgay;
}