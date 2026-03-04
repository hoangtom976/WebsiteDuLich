package com.dulich.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CapNhatNgayKhoiHanhDTO {
    @NotNull(message = "Ngày khởi hành không được để trống")
    @Future(message = "Ngày khởi hành phải là ngày trong tương lai")
    private LocalDate ngayKhoiHanh;
}
