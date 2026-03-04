package com.dulich.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VietDanhGiaDTO {
    @NotNull(message = "Vui lòng chọn tour để đánh giá")
    private Long tourId;

    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer soSao;

    @NotBlank(message = "Bình luận không được để trống")
    private String binhLuan;
}