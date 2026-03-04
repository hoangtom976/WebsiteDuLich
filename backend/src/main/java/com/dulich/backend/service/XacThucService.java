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
import com.dulich.backend.security.TienIchJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TienIchJwt tienIchJwt;
    private final TokenQuenMatKhauRepository tokenQuenMatKhauRepository;

    @Transactional
    public String dangKy(DangKyDTO request) {
        // 1. Kiểm tra email
        if (nguoiDungRepository.existsByEmail(request.getEmail())) {
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

    public String dangNhap(DangNhapDTO dangNhapDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dangNhapDto.getEmail(),
                        dangNhapDto.getMatKhau()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return tienIchJwt.generateToken(authentication);
    }

    @Transactional
    public String quenMatKhau(String email) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với email: " + email));

        // Xóa token cũ nếu có
        tokenQuenMatKhauRepository.deleteByNguoiDung(nguoiDung);

        String token = UUID.randomUUID().toString();

        TokenQuenMatKhau resetToken = new TokenQuenMatKhau();
        resetToken.setNguoiDung(nguoiDung);
        resetToken.setToken(token);
        resetToken.setThoiHan(LocalDateTime.now().plusMinutes(15));

        tokenQuenMatKhauRepository.save(resetToken);

        return token;
    }

    @Transactional
    public String datLaiMatKhau(String token, String matKhauMoi) {
        TokenQuenMatKhau resetToken = tokenQuenMatKhauRepository.findByToken(token)
                .orElseThrow(() -> new LoiBadRequestException("Token không hợp lệ!"));

        if (resetToken.getThoiHan().isBefore(LocalDateTime.now())) {
            throw new LoiBadRequestException("Token đã hết hạn!");
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
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Người dùng không được xác thực."));

        // 1. Kiểm tra mật khẩu cũ
        // Lỗi "rawPassword cannot be null" sẽ xảy ra ở đây nếu request.getMatKhauCu() là null
        if (!passwordEncoder.matches(request.getMatKhauCu(), nguoiDung.getMatKhau())) {
            throw new LoiBadRequestException("Mật khẩu cũ không chính xác.");
        }

        // 2. Cập nhật mật khẩu mới
        // Lỗi "rawPassword cannot be null" cũng có thể xảy ra ở đây nếu request.getMatKhauMoi() là null
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);

        return "Đổi mật khẩu thành công!";
    }
}