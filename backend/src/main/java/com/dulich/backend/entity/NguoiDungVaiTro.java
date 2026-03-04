package com.dulich.backend.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nguoi_dung_vai_tro")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDungVaiTro {
    @EmbeddedId
    private NguoiDungVaiTroId id;

    @ManyToOne
    @MapsId("nguoiDungId")
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @MapsId("vaiTroId")
    @JoinColumn(name = "vai_tro_id")
    private VaiTro vaiTro;
}
