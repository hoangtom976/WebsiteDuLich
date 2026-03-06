package com.dulich.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flash_sale")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "phan_tram_giam", nullable = false)
    private Integer phanTramGiam;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "da_ban")
    @Builder.Default
    private Integer daBan = 0;

    @Column(name = "tg_bat_dau", nullable = false)
    private LocalDateTime tgBatDau;

    @Column(name = "tg_ket_thuc", nullable = false)
    private LocalDateTime tgKetThuc;

    @Column(name = "trang_thai")
    @Builder.Default
    private Boolean trangThai = Boolean.TRUE;
}
