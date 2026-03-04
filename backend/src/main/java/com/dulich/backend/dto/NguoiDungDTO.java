package com.dulich.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NguoiDungDTO {
    private Long id;
    private String email;
    private String hoTen;
    private String soDienThoai;
    private Boolean trangThai;
    private String vaiTro;
    private LocalDateTime ngayTao;
}
