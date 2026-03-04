package com.dulich.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThoiTietDTO {
    private String thoiGian;
    private Double nhietDo;
    private Double camGiacNhu;
    private Integer doAm;
    private String moTa;
    private String icon;
    private String thanhPho;
}