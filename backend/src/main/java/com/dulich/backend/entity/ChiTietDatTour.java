package com.dulich.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "chi_tiet_dat_tour")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietDatTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "don_dat_tour_id")
    @ToString.Exclude
    @JsonIgnore
    private DonDatTour donDatTour;

    @Column(name = "ten_khach", length = 100)
    private String tenKhach;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;
}
