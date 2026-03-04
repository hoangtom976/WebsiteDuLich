package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hinh_anh_tour")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_hinh_anh", nullable = false)
    private String urlHinhAnh;

    @ManyToOne
    @JoinColumn(name = "tour_id")
    private Tour tour;
}