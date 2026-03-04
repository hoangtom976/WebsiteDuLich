package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DanhMucDTO {
    private Long id;

    @NotBlank(message = "Tên danh mục không được để trống")
    private String tenDanhMuc;

    private String moTa;
}