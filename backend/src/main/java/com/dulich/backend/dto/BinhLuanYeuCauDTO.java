package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BinhLuanYeuCauDTO {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String noiDung;
}
