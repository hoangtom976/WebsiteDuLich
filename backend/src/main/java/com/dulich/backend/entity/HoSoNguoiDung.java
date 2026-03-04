package com.dulich.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ho_so_nguoi_dung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoSoNguoiDung {
    @Id
    private Long nguoiDungId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    private String diaChi;

    private String anhDaiDien;
}
