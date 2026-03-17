package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TourChoDanhGiaDTO {
    private Long tourId;
    private String tenTour;
    private LocalDate ngayKhoiHanh;
    private String anhTour;
}
