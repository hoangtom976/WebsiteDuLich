package com.dulich.backend.dto;

import lombok.Data;

@Data
public class LichTrinhTourDTO {
    private Long id;
    private Integer ngayThu;
    private String tieuDe;
    private String moTa;
    private Long tourId;
}