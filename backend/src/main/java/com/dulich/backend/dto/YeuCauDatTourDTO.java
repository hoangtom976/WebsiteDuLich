package com.dulich.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class YeuCauDatTourDTO {
    @NotNull(message = "Vui lòng chọn lịch khởi hành")
    private Long lichKhoiHanhId;

    @NotEmpty(message = "Danh sách khách đi cùng không được để trống")
    private List<KhachDiCungDTO> danhSachKhach;

    private String maVoucher;
}