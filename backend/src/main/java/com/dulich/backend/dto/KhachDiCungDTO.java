package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KhachDiCungDTO {
    @NotBlank(message = "Tên khách không được để trống")
    private String tenKhach;

    private String soDienThoai;
}