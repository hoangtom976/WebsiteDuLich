package com.dulich.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class XacNhanOtpDangKyDTO {

    @NotBlank(message = "Mã OTP không được để trống")
    private String otp;

    @Valid
    private DangKyDTO thongTinDangKy;
}
