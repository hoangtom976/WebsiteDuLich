package com.dulich.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LichKhoiHanhDTO {
    private Long id;

    @NotNull(message = "Ngày khởi hành không được để trống")
    @Future(message = "Ngày khởi hành phải là ngày trong tương lai")
    private LocalDate ngayKhoiHanh;

    @Min(value = 1, message = "Tổng số chỗ phải lớn hơn hoặc bằng 1")
    private Integer tongSoCho;

    private Integer soChoConLai;

    @NotNull(message = "Vui lòng chọn tour")
    private Long tourId;

    // Trường hiển thị
    private String tenTour;
    private Integer soNgay;
}