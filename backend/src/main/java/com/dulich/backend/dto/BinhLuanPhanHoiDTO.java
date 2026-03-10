package com.dulich.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BinhLuanPhanHoiDTO {
    private Long id;
    private Long nguoiDungId;
    private String tenNguoiDung;
    private String noiDung;
    private LocalDateTime ngayTao;
}
