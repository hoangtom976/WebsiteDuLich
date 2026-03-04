package com.dulich.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "thanh_toan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "don_dat_tour_id")
    private DonDatTour donDatTour;

    @Column(name = "phuong_thuc", length = 50)
    private String phuongThuc;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @Column(name = "ma_giao_dich", length = 100)
    private String maGiaoDich;

    @Column(name = "thoi_gian_thanh_toan")
    private LocalDateTime thoiGianThanhToan;
}
