package com.dulich.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class VoucherDTO {
    @NotBlank(message = "Mã voucher không được để trống")
    private String maVoucher;

    @Min(value = 1, message = "Phần trăm giảm tối thiểu là 1")
    @Max(value = 100, message = "Phần trăm giảm tối đa là 100")
    private Integer phanTramGiam;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDate ngayHetHan;

    private Boolean trangThai;
}