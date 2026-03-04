package com.dulich.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tour")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @ManyToOne
    @JoinColumn(name = "dia_diem_id")
    private DiaDiem diaDiem;

    @Column(name = "ten_tour", length = 150, nullable = false)
    private String tenTour;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    private BigDecimal gia;

    @Column(name = "so_ngay")
    private Integer soNgay;

    @Column(name = "trang_thai")
    @Builder.Default
    private Boolean trangThai = Boolean.TRUE;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    public void prePersist() {
        if (this.ngayTao == null) {
            this.ngayTao = LocalDateTime.now();
        }
    }
}
