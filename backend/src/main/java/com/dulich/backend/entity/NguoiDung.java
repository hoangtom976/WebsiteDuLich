package com.dulich.backend.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nguoi_dung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(name = "mat_khau")
    private String matKhau;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "vai_tro")
    private String vaiTro;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "nguoi_dung_vai_tro",
        joinColumns = @JoinColumn(name = "nguoi_dung_id"),
        inverseJoinColumns = @JoinColumn(name = "vai_tro_id")
    )
    private Set<VaiTro> vaiTros;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "yeu_thich",
        joinColumns = @JoinColumn(name = "nguoi_dung_id"),
        inverseJoinColumns = @JoinColumn(name = "tour_id")
    )
    @Builder.Default
    private Set<Tour> danhSachYeuThich = new HashSet<>();
}
