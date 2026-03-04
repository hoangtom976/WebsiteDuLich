package com.dulich.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO (Data Transfer Object) chuẩn hóa cho các phản hồi lỗi của API.
 */
@Data
@AllArgsConstructor
public class PhanHoiLoi {
    private LocalDateTime thoiGian;
    private int maLoi;
    private String loi;
    private String thongDiep;
    private String duongDan;
}