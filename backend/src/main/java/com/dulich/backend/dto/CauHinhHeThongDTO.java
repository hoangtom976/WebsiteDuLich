package com.dulich.backend.dto;

import lombok.Data;

@Data
public class CauHinhHeThongDTO {
    private String tenHeThong;
    private String hotline;
    private String emailLienHe;
    private String diaChi;
    private String gioLamViec;
    private Boolean batEmailThongBao;
    private Boolean batChatbot;
    private Boolean batThoiTiet;
}
