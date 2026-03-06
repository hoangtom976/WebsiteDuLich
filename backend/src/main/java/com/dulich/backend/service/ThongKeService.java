package com.dulich.backend.service;

import org.springframework.stereotype.Service;

import com.dulich.backend.dto.DashboardThongKeDTO;
import com.dulich.backend.repository.BaiVietRepository;
import com.dulich.backend.repository.DanhMucRepository;
import com.dulich.backend.repository.DiaDiemRepository;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.TourRepository;
import com.dulich.backend.repository.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ThongKeService {

    private final TourRepository tourRepository;
    private final DanhMucRepository danhMucRepository;
    private final DiaDiemRepository diaDiemRepository;
    private final LichKhoiHanhRepository lichKhoiHanhRepository;
    private final DonDatTourRepository donDatTourRepository;
    private final BaiVietRepository baiVietRepository;
    private final VoucherRepository voucherRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public DashboardThongKeDTO layThongKeTongQuan() {
        return DashboardThongKeDTO.builder()
                .tongTour(tourRepository.count())
                .tourDangHoatDong(tourRepository.countByTrangThaiTrue())
                .tongDanhMuc(danhMucRepository.count())
                .tongDiaDiem(diaDiemRepository.count())
                .tongLichKhoiHanh(lichKhoiHanhRepository.count())
                .tongDonDatTour(donDatTourRepository.count())
                .tongBaiViet(baiVietRepository.count())
                .tongVoucher(voucherRepository.count())
                .voucherDangHoatDong(voucherRepository.countByTrangThaiTrue())
                .tongNguoiDung(nguoiDungRepository.count())
                .nguoiDungDangHoatDong(nguoiDungRepository.countByTrangThaiTrue())
                .build();
    }
}
