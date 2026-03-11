package com.dulich.backend.service;

import com.dulich.backend.dto.DangKyDTO;
import com.dulich.backend.dto.DangNhapDTO;
import com.dulich.backend.dto.DoiMatKhauNguoiDungDTO;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.TokenQuenMatKhau;
import com.dulich.backend.dto.EmailDaTonTaiException;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.TokenQuenMatKhauRepository;
import com.dulich.backend.repository.XacThucOtpRepository;
import com.dulich.backend.security.TienIchJwt;
import com.dulich.backend.entity.XacThucOtp;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TienIchJwt tienIchJwt;
    private final TokenQuenMatKhauRepository tokenQuenMatKhauRepository;
    private final XacThucOtpRepository xacThucOtpRepository;
    private final EmailService emailService;

    @Transactional
    public String dangKy(DangKyDTO request) {
        // 1. Kiểm tra email
        if (nguoiDungRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new EmailDaTonTaiException("Email '" + request.getEmail() + "' đã được sử dụng.");
        }

        // 2. Tạo NguoiDung mới
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setHoTen(request.getHoTen());
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        nguoiDung.setNgayTao(LocalDateTime.now());
        nguoiDung.setTrangThai(true);

        // CẬP NHẬT: Gán trực tiếp vai trò vào cột vai_tro
        nguoiDung.setVaiTro("ROLE_USER");

        nguoiDungRepository.save(nguoiDung);

        return "Đăng ký tài khoản thành công!";
    }

    @Transactional
    public String guiOtpDangKy(String email) {
        if (email == null) {
            throw new LoiBadRequestException("Email là bắt buộc.");
        }
        final String finalEmail = email.trim().toLowerCase();

        // 1. Kiểm tra định dạng Gmail (theo yêu cầu người dùng)
        if (!finalEmail.endsWith("@gmail.com")) {
            throw new LoiBadRequestException("Vui lòng sử dụng địa chỉ Gmail (@gmail.com) để đăng ký.");
        }

        // 2. Kiểm tra xem email đã được đăng ký thật chưa
        if (nguoiDungRepository.existsByEmailIgnoreCase(finalEmail)) {
            throw new EmailDaTonTaiException("Email '" + finalEmail + "' đã được sử dụng.");
        }

        // Xóa OTP cũ nếu có để tránh rác DB
        xacThucOtpRepository.deleteByEmail(finalEmail);

        // Tạo mã OTP 6 số
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Lưu vào DB (hết hạn sau 5 phút)
        XacThucOtp xacThucOtp = XacThucOtp.builder()
                .email(email)
                .otp(otp)
                .thoiHan(LocalDateTime.now().plusMinutes(5))
                .build();
        xacThucOtpRepository.save(xacThucOtp);

        // Gửi email
        String subject = "Mã xác thực đăng ký tài khoản";
        String text = "Xin chào,\n\nMã xác thực (OTP) đăng ký tài khoản của bạn là: " + otp
                + "\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ hỗ trợ.";

        try {
            emailService.sendSimpleMessage(finalEmail, subject, text);
        } catch (Exception e) {
            // Log lỗi nếu cần
            throw new LoiBadRequestException(
                    "Gmail không tồn tại hoặc không thể gửi thư. Vui lòng kiểm tra lại địa chỉ Gmail.");
        }

        return "Đã gửi mã xác thực đến email của bạn.";
    }

    @Transactional
    public String xacNhanDangKy(DangKyDTO request, String otp) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        request.setEmail(email);

        // 1. Kiểm tra OTP
        XacThucOtp xacThucOtp = xacThucOtpRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new LoiBadRequestException("Mã xác thực không hợp lệ."));

        if (xacThucOtp.getThoiHan().isBefore(LocalDateTime.now())) {
            throw new LoiBadRequestException("Mã xác thực đã hết hạn.");
        }

        // 2. Kiểm tra lại email lần nữa để chắc chắn
        if (nguoiDungRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new EmailDaTonTaiException("Email '" + request.getEmail() + "' đã được sử dụng.");
        }

        // 3. Tạo tài khoản
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setHoTen(request.getHoTen());
        nguoiDung.setEmail(request.getEmail());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        nguoiDung.setNgayTao(LocalDateTime.now());
        nguoiDung.setTrangThai(true);
        nguoiDung.setVaiTro("ROLE_USER");

        nguoiDungRepository.save(nguoiDung);

        // 4. Xóa OTP
        xacThucOtpRepository.delete(xacThucOtp);

        return "Đăng ký tài khoản thành công!";
    }

    public String dangNhap(DangNhapDTO dangNhapDto) {
        String email = dangNhapDto.getEmail() != null ? dangNhapDto.getEmail().trim().toLowerCase() : "";
        dangNhapDto.setEmail(email);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        dangNhapDto.getMatKhau()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return tienIchJwt.generateToken(authentication);
    }

    @Transactional
    public String quenMatKhau(String email) {
        if (email == null) {
            throw new LoiBadRequestException("Email là bắt buộc.");
        }
        final String finalEmail = email.trim().toLowerCase();

        NguoiDung nguoiDung = nguoiDungRepository.findByEmailIgnoreCase(finalEmail)
                .orElseThrow(
                        () -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với email: " + finalEmail));

        // Bước quan trọng: Xóa sạch các token cũ của người dùng này trước khi tạo mới
        // Việc xóa bằng @Modifying query giúp giải quyết dứt điểm lỗi Duplicate Entry
        tokenQuenMatKhauRepository.xoaTatCaTokenCuaNguoiDung(nguoiDung.getId());

        TokenQuenMatKhau resetToken = new TokenQuenMatKhau();
        resetToken.setNguoiDung(nguoiDung);

        // Sinh mã OTP 6 số mới
        String token = String.format("%06d", new Random().nextInt(1000000));
        resetToken.setToken(token);
        resetToken.setThoiHan(LocalDateTime.now().plusMinutes(15));

        // Lưu và đẩy xuống DB ngay lập tức
        tokenQuenMatKhauRepository.saveAndFlush(resetToken);

        // Gửi email
        String subject = "Mã OTP đặt lại mật khẩu";
        String text = "Xin chào " + nguoiDung.getHoTen() + ",\n\n"
                + "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n"
                + "Vui lòng sử dụng mã OTP dưới đây để tiếp tục quá trình đặt lại mật khẩu:\n\n"
                + "Mã OTP: " + token + "\n\n"
                + "Mã này sẽ hết hạn sau 15 phút.\n"
                + "Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\nĐội ngũ hỗ trợ.";

        emailService.sendSimpleMessage(finalEmail, subject, text);

        return "Đã gửi mã OTP lấy lại mật khẩu vào email của bạn.";
    }

    @Transactional
    public String datLaiMatKhau(String token, String matKhauMoi) {
        TokenQuenMatKhau resetToken = tokenQuenMatKhauRepository.findByToken(token)
                .orElseThrow(() -> new LoiBadRequestException("Mã OTP không hợp lệ!"));

        if (resetToken.getThoiHan().isBefore(LocalDateTime.now())) {
            throw new LoiBadRequestException("Mã OTP đã hết hạn!");
        }

        NguoiDung nguoiDung = resetToken.getNguoiDung();
        nguoiDung.setMatKhau(passwordEncoder.encode(matKhauMoi));
        nguoiDungRepository.save(nguoiDung);

        tokenQuenMatKhauRepository.delete(resetToken);

        return "Mật khẩu đã được đặt lại thành công!";
    }

    @Transactional
    public String doiMatKhau(DoiMatKhauNguoiDungDTO request) {
        // Lấy email của người dùng đã được xác thực từ security context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Người dùng không được xác thực."));

        // 1. Kiểm tra mật khẩu cũ
        // Lỗi "rawPassword cannot be null" sẽ xảy ra ở đây nếu request.getMatKhauCu()
        // là null
        if (!passwordEncoder.matches(request.getMatKhauCu(), nguoiDung.getMatKhau())) {
            throw new LoiBadRequestException("Mật khẩu cũ không chính xác.");
        }

        // 2. Cập nhật mật khẩu mới
        // Lỗi "rawPassword cannot be null" cũng có thể xảy ra ở đây nếu
        // request.getMatKhauMoi() là null
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);

        return "Đổi mật khẩu thành công!";
    }
}