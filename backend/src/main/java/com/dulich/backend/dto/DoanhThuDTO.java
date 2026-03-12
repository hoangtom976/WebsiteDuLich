package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DoanhThuDTO {
    private String nhan; // Nhãn thời gian (VD: "2023-10-01", "Tuần 40", "Tháng 10")
    private BigDecimal tongDoanhThu;
    private long soDonHang;
}
