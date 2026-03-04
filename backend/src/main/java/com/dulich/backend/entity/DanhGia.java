package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "danh_gia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id")
    private Tour tour;

    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "so_sao")
    private Integer soSao;

    @Column(columnDefinition = "TEXT")
    private String binhLuan;

    @Column(name = "ngay_danh_gia")
    private LocalDateTime ngayDanhGia;

    @OneToOne(mappedBy = "danhGia", cascade = CascadeType.ALL)
    private PhanHoiDanhGia phanHoi;

    @PrePersist
    public void prePersist() {
        if (this.ngayDanhGia == null) {
            this.ngayDanhGia = LocalDateTime.now();
        }
    }
}
