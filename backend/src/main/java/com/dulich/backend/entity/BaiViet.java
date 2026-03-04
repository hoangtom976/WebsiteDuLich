package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bai_viet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaiViet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tac_gia_id")
    private NguoiDung tacGia;

    @Column(name = "tieu_de", nullable = false)
    private String tieuDe;

    @Column(name = "slug", unique = true, nullable = false)
    private String slug;

    @Column(name = "anh_bia")
    private String anhBia;

    @Column(name = "noi_dung", columnDefinition = "LONGTEXT", nullable = false)
    private String noiDung;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @Column(name = "luot_xem")
    private Integer luotXem;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    public void prePersist() {
        this.ngayTao = LocalDateTime.now();
        this.ngayCapNhat = LocalDateTime.now();
        if (this.luotXem == null) {
            this.luotXem = 0;
        }
        if (this.trangThai == null) {
            this.trangThai = "XUAT_BAN";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.ngayCapNhat = LocalDateTime.now();
    }
}