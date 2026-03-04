package com.dulich.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BaiVietYeuCauDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String tieuDe;

    private String anhBia;

    @NotBlank(message = "Nội dung không được để trống")
    private String noiDung;

    private String trangThai;
}