package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KhachDiCungDTO {
    @NotBlank(message = "Tên khách không được để trống")
    private String tenKhach;

    private String soDienThoai;
}