package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ThayDoiTrangThaiDTO {
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotNull(message = "Trạng thái không được để trống")
    private Boolean trangThai;
}