package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiaDiemDTO {
    private Long id;

    @NotBlank(message = "Tên địa điểm không được để trống")
    private String tenDiaDiem;

    private String moTa;

    private Double latitude;
    private Double longitude;
}