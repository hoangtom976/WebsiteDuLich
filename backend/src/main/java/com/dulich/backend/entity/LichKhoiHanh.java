package com.dulich.backend.entity;

import java.time.LocalDate;

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
@Table(name = "lich_khoi_hanh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichKhoiHanh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id")
    private Tour tour;

    @Column(name = "ngay_khoi_hanh", nullable = false)
    private LocalDate ngayKhoiHanh;

    @Column(name = "tong_so_cho")
    private Integer tongSoCho;

    @Column(name = "so_cho_con_lai")
    private Integer soChoConLai;
}
