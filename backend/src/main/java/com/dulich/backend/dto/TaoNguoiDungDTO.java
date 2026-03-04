package com.dulich.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaoNguoiDungDTO {
    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9+\\s()-]{8,20}$", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String matKhau;

    @NotBlank(message = "Vai trò không được để trống")
    private String vaiTro;

    private Boolean trangThai;
}
