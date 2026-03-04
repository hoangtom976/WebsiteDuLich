package com.dulich.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CapNhatSoChoDTO {
    @NotNull(message = "Tổng số chỗ không được để trống")
    @Min(value = 1, message = "Tổng số chỗ phải lớn hơn hoặc bằng 1")
    private Integer tongSoCho;
}