package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TraLoiDanhGiaDTO {
    @NotNull(message = "Vui lòng chọn đánh giá để trả lời")
    private Long danhGiaId;

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String noiDung;
}