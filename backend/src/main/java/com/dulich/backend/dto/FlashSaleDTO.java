package com.dulich.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FlashSaleDTO {
    private Long id;
    private Long tourId;
    private String tenTour;
    private String hinhAnh;
    private Integer phanTramGiam;
    private Integer soLuong;
    private Integer daBan;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime tgBatDau;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime tgKetThuc;
    private Boolean trangThai;

    // Add display fields
    private java.math.BigDecimal giaGoc;
    private java.math.BigDecimal giaKhuyenMai;
}
