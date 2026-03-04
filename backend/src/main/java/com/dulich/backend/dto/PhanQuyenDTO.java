package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhanQuyenDTO {
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Tên vai trò không được để trống")
    private String tenVaiTro;
}