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
@Table(name = "yeu_thich")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuThich {
    @EmbeddedId
    private YeuThichId id;

    @ManyToOne
    @MapsId("nguoiDungId")
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @MapsId("tourId")
    @JoinColumn(name = "tour_id")
    private Tour tour;
}
