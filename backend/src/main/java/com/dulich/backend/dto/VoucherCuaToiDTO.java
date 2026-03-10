package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class VoucherCuaToiDTO {
    private Long id;
    private String maVoucher;
    private Integer phanTramGiam;
    private LocalDate ngayHetHan;
    private String trangThai; // "CON_HAN", "DA_DUNG", "HET_HAN"
}
