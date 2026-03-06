package com.dulich.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cau_hinh_he_thong")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CauHinhHeThong {

    @Id
    private Long id;

    @Column(name = "ten_he_thong", length = 150)
    private String tenHeThong;

    @Column(name = "hotline", length = 50)
    private String hotline;

    @Column(name = "email_lien_he", length = 100)
    private String emailLienHe;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "gio_lam_viec", length = 150)
    private String gioLamViec;

    @Column(name = "bat_email_thong_bao")
    private Boolean batEmailThongBao;

    @Column(name = "bat_chatbot")
    private Boolean batChatbot;

    @Column(name = "bat_thoi_tiet")
    private Boolean batThoiTiet;

    @PrePersist
    public void prePersist() {
        if (id == null) id = 1L;
        if (batEmailThongBao == null) batEmailThongBao = true;
        if (batChatbot == null) batChatbot = true;
        if (batThoiTiet == null) batThoiTiet = true;
    }
}
