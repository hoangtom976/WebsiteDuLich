package com.dulich.backend.service;

import com.dulich.backend.entity.EmailThongBao;
import com.dulich.backend.repository.EmailThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuiEmailService {

    private static final Logger logger = LoggerFactory.getLogger(GuiEmailService.class);
    private final JavaMailSender javaMailSender;
    private final EmailThongBaoRepository emailThongBaoRepository;

    public void guiEmail(String nguoiNhan, String tieuDe, String noiDung) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(nguoiNhan);
            message.setSubject(tieuDe);
            message.setText(noiDung);

            javaMailSender.send(message);

            // Lưu lịch sử gửi email
            EmailThongBao emailThongBao = EmailThongBao.builder()
                    .emailNguoiNhan(nguoiNhan)
                    .tieuDe(tieuDe)
                    .build();
            emailThongBaoRepository.save(emailThongBao);

            logger.info("Gửi email thành công đến {}", nguoiNhan);
        } catch (Exception e) {
            logger.error("Lỗi gửi email đến {}: {}", nguoiNhan, e.getMessage());
            // Không ném ngoại lệ để tránh ảnh hưởng đến luồng chính
        }
    }

    public void guiEmailXacNhanDatTour(String email, String maDonHang, String tenTour, Double tongTien) {
        String tieuDe = "Xác nhận đặt tour thành công - Mã đơn: " + maDonHang;
        String noiDung = String.format(
                "Cảm ơn bạn đã đặt tour tại Việt Tour.\n\nMã đơn hàng: %s\nTên tour: %s\nTổng tiền: %.0f VNĐ\n\nVui lòng thanh toán để hoàn tất đặt chỗ.",
                maDonHang, tenTour, tongTien);
        guiEmail(email, tieuDe, noiDung);
    }

    public void guiEmailThanhToanThanhCong(String email, String maDonHang) {
        String tieuDe = "Thanh toán thành công - Mã đơn: " + maDonHang;
        String noiDung = String.format("Thanh toán thành công đơn hàng %s.\n\nChúc bạn có chuyến đi vui vẻ!",
                maDonHang);
        guiEmail(email, tieuDe, noiDung);
    }
}