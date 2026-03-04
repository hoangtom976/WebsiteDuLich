package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "phien_chat")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhienChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_dung_id")
    private Long nguoiDungId;

    @Column(name = "tieu_de")
    private String tieuDe;

    @Column(name = "thoi_gian_bat_dau")
    private LocalDateTime thoiGianBatDau;
}