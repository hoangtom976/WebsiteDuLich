package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "token_quen_mat_khau")
public class TokenQuenMatKhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @Column(name = "thoi_han")
    private LocalDateTime thoiHan;

    @OneToOne
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;
}