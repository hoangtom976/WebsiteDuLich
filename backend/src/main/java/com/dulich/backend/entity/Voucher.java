package com.dulich.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "voucher")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_voucher", unique = true, nullable = false, length = 50)
    private String maVoucher;

    @Column(name = "phan_tram_giam")
    @Min(1)
    @Max(100)
    private Integer phanTramGiam;

    @Column(name = "ngay_het_han")
    private LocalDate ngayHetHan;

    @Column(name = "trang_thai")
    @Builder.Default
    private Boolean trangThai = true;
}