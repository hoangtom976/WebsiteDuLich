package com.dulich.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuBaoThoiTietDTO {
    private String thanhPho;
    private List<ChiTietDuBaoDTO> danhSachDuBao;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietDuBaoDTO {
        private String thoiGian; // dd/MM/yyyy
        private Double nhietDoNgay;
        private Double nhietDoDem;
        private Integer doAm;
        private String moTa;
        private String icon;
    }
}
