package com.dulich.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardThongKeDTO {
    private long tongTour;
    private long tourDangHoatDong;
    private long tongDanhMuc;
    private long tongDiaDiem;
    private long tongLichKhoiHanh;
    private long tongDonDatTour;
    private long tongBaiViet;
    private long tongVoucher;
    private long voucherDangHoatDong;
    private long tongNguoiDung;
    private long nguoiDungDangHoatDong;
}
