package com.dulich.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TourDTO {
    private Long id;

    @NotBlank(message = "Tên tour không được để trống")
    private String tenTour;

    private String moTa;

    @NotNull(message = "Giá tour không được để trống")
    @Min(value = 0, message = "Giá tour phải lớn hơn hoặc bằng 0")
    private BigDecimal gia;

    @Min(value = 1, message = "Số ngày phải lớn hơn hoặc bằng 1")
    private Integer soNgay;

    private Boolean trangThai;

    @NotNull(message = "Vui lòng chọn danh mục")
    private Long danhMucId;

    @NotNull(message = "Vui lòng chọn địa điểm")
    private Long diaDiemId;

    // Các trường hiển thị (Read-only)
    private String tenDanhMuc;
    private String tenDiaDiem;
}