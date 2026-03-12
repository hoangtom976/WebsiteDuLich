package com.dulich.backend.service;

import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.entity.FlashSale;
import com.dulich.backend.entity.LichKhoiHanh;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.FlashSaleRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

    private final DonDatTourRepository donDatTourRepository;
    private final LichKhoiHanhRepository lichKhoiHanhRepository;
    private final FlashSaleRepository flashSaleRepository;

    /**
     * Chạy mỗi phút để kiểm tra và hủy các đơn hàng chưa thanh toán quá 15 phút.
     */
    @Scheduled(fixedRate = 60000) // 60,000 ms = 1 phút
    @Transactional
    public void tuDongHuyDonHangHetHan() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        List<DonDatTour> expiredBookings = donDatTourRepository.findByTrangThaiAndNgayDatBefore("CHO_THANH_TOAN", cutoffTime);

        if (!expiredBookings.isEmpty()) {
            System.out.println("--- [BẮT ĐẦU] Tự động hủy " + expiredBookings.size() + " đơn hàng hết hạn thanh toán ---");
            for (DonDatTour don : expiredBookings) {
                try {
                    hủyDonHàng(don);
                    System.out.println("Đã hủy đơn hàng: #" + don.getId());
                } catch (Exception e) {
                    System.err.println("Lỗi khi hủy đơn hàng #" + don.getId() + ": " + e.getMessage());
                }
            }
            System.out.println("--- [KẾT THÚC] Hoàn tất quá trình hủy đơn hàng ---");
        }
    }

    private void hủyDonHàng(DonDatTour don) {
        // 1. Cập nhật trạng thái
        don.setTrangThai("DA_HUY");
        donDatTourRepository.save(don);

        // 2. Hoàn lại số chỗ trong lịch khởi hành
        LichKhoiHanh lich = don.getLichKhoiHanh();
        int soKhach = don.getChiTiets() != null ? don.getChiTiets().size() : 0;
        lich.setSoChoConLai(lich.getSoChoConLai() + soKhach);
        lichKhoiHanhRepository.save(lich);

        // 3. Hoàn lại Flash Sale nếu có
        if (don.getFlashSale() != null) {
            FlashSale fs = don.getFlashSale();
            fs.setSoLuong(fs.getSoLuong() + 1);
            flashSaleRepository.save(fs);
        }
    }
}
