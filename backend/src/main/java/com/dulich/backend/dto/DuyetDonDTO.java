package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DuyetDonDTO {
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;
}