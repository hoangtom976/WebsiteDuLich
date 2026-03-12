package com.dulich.backend.service;

import org.springframework.stereotype.Service;

import com.dulich.backend.dto.DashboardThongKeDTO;
import com.dulich.backend.dto.DoanhThuDTO;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.repository.BaiVietRepository;
import com.dulich.backend.repository.DanhMucRepository;
import com.dulich.backend.repository.DiaDiemRepository;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.TourRepository;
import com.dulich.backend.repository.VoucherRepository;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<DoanhThuDTO> layThongKeDoanhThu(String loai) {
        List<DonDatTour> danhSachDon = donDatTourRepository.findAll().stream()
                .filter(d -> "DA_THANH_TOAN".equals(d.getTrangThai()) || "DA_XAC_NHAN".equals(d.getTrangThai()))
                .filter(d -> d.getNgayDat() != null)
                .collect(Collectors.toList());

        Map<String, DoanhThuDTO> ketQua = new java.util.LinkedHashMap<>();

        LocalDateTime hienTai = LocalDateTime.now();
        LocalDateTime thoiDiemBatDau;

        if ("thang".equalsIgnoreCase(loai)) {
            // Tháng hiện tại (từ mùng 1 đến ngày cuối tháng)
            thoiDiemBatDau = hienTai.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            int daysInMonth = java.time.YearMonth.from(hienTai).lengthOfMonth();
            for (int i = 1; i <= daysInMonth; i++) {
                String nhan = String.format("%02d/%02d", i, hienTai.getMonthValue());
                ketQua.put(nhan, DoanhThuDTO.builder().nhan(nhan).tongDoanhThu(BigDecimal.ZERO).soDonHang(0).build());
            }
        } else if ("tuan".equalsIgnoreCase(loai)) {
            // Tuần hiện tại (từ Thứ 2 đến Chủ nhật)
            thoiDiemBatDau = hienTai.with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0).withNano(0);
            String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"};
            for (String day : days) {
                ketQua.put(day, DoanhThuDTO.builder().nhan(day).tongDoanhThu(BigDecimal.ZERO).soDonHang(0).build());
            }
        } else {
            // Ngày hiện tại (24 giờ, từ 00:00 đến 23:59)
            thoiDiemBatDau = hienTai.withHour(0).withMinute(0).withSecond(0).withNano(0);
            for (int i = 0; i < 24; i++) {
                String nhan = String.format("%02d:00", i);
                ketQua.put(nhan, DoanhThuDTO.builder().nhan(nhan).tongDoanhThu(BigDecimal.ZERO).soDonHang(0).build());
            }
        }

        for (DonDatTour don : danhSachDon) {
            if (don.getNgayDat().isBefore(thoiDiemBatDau)) {
                continue; 
            }

            String nhan;
            if ("thang".equalsIgnoreCase(loai)) {
                nhan = String.format("%02d/%02d", don.getNgayDat().getDayOfMonth(), don.getNgayDat().getMonthValue());
            } else if ("tuan".equalsIgnoreCase(loai)) {
                int dayOfWeek = don.getNgayDat().getDayOfWeek().getValue();
                String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"};
                nhan = days[dayOfWeek - 1];
            } else {
                nhan = String.format("%02d:00", don.getNgayDat().getHour());
            }

            if (ketQua.containsKey(nhan)) {
                DoanhThuDTO dto = ketQua.get(nhan);
                dto.setTongDoanhThu(dto.getTongDoanhThu().add(don.getTongTien() != null ? don.getTongTien() : BigDecimal.ZERO));
                dto.setSoDonHang(dto.getSoDonHang() + 1);
            }
        }

        return new ArrayList<>(ketQua.values());
    }
}
