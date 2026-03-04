package com.dulich.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaoThanhToanDTO {
    @NotNull(message = "Số tiền không được để trống")
    private Long soTien;

    private String noiDung;

    private Long maDonHang;
}