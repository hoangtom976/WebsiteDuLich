package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_thong_bao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_nguoi_nhan")
    private String emailNguoiNhan;

    @Column(name = "tieu_de")
    private String tieuDe;

    @Column(name = "ngay_gui")
    @Builder.Default
    private LocalDateTime ngayGui = LocalDateTime.now();
}