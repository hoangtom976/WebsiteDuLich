package com.dulich.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LienHeDTO {
    @NotBlank(message = "Họ tên không được để trống")
    private String name;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    private String phone;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;
}
