package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HienThiDanhGiaDTO {
    private Long id;
    private String tenNguoiDung;
    private String avatarNguoiDung;
    private Integer soSao;
    private String binhLuan;
    private LocalDateTime ngayDanhGia;

    private String noiDungPhanHoi;
    private String tenNhanVienPhanHoi;
    private LocalDateTime ngayPhanHoi;
}