package com.dulich.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "khuyen_mai")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMai {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_khuyen_mai", length = 50, unique = true)
    private String maKhuyenMai;

    @Column(name = "phan_tram_giam")
    private Integer phanTramGiam;

    @Column(name = "ngay_het_han")
    private LocalDate ngayHetHan;

    @Column(name = "trang_thai")
    @Builder.Default
    private Boolean trangThai = Boolean.TRUE;
}
