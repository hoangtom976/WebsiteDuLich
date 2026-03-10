package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Column(nullable = false)
    private String tieuDe;

    @Column(columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "loai_thong_bao")
    private String loaiThongBao; // "DON_HANG", "THANH_TOAN", "KHUYEN_MAI", "HE_THONG"

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "da_doc")
    @Builder.Default
    private Boolean daDoc = false;

    @PrePersist
    public void prePersist() {
        if (this.ngayTao == null) {
            this.ngayTao = LocalDateTime.now();
        }
    }
}
