package com.dulich.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "don_dat_tour")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonDatTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "lich_khoi_hanh_id", nullable = false)
    private LichKhoiHanh lichKhoiHanh;

    @Column(name = "ngay_dat")
    private LocalDateTime ngayDat;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @OneToMany(mappedBy = "donDatTour", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<ChiTietDatTour> chiTiets;

    @PrePersist
    public void prePersist() {
        if (this.ngayDat == null) {
            this.ngayDat = LocalDateTime.now();
        }
    }
}
