package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "binh_luan_bai_viet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BinhLuanBaiViet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bai_viet_id", nullable = false)
    private BaiViet baiViet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String noiDung;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    public void prePersist() {
        if (this.ngayTao == null) {
            this.ngayTao = LocalDateTime.now();
        }
    }
}
