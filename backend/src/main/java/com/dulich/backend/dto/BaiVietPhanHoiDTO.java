package com.dulich.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BaiVietPhanHoiDTO {
    private Long id;
    private String tieuDe;
    private String slug;
    private String anhBia;
    private String noiDung;
    private String trangThai;
    private Integer luotXem;
    private LocalDateTime ngayTao;
    private String tenTacGia;
}