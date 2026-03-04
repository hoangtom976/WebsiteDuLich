package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "phan_hoi_danh_gia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhanHoiDanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "danh_gia_id")
    private DanhGia danhGia;

    @ManyToOne
    @JoinColumn(name = "nhan_vien_id")
    private NguoiDung nhanVien;

    @Column(columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "ngay_phan_hoi")
    private LocalDateTime ngayPhanHoi;

    @PrePersist
    public void prePersist() {
        if (this.ngayPhanHoi == null) {
            this.ngayPhanHoi = LocalDateTime.now();
        }
    }
}
