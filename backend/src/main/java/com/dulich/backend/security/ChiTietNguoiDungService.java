package com.dulich.backend.security;

import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class ChiTietNguoiDungService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Xử lý vai trò: Đảm bảo luôn có tiền tố ROLE_ và không bị null/khoảng trắng
        String vaiTro = nguoiDung.getVaiTro();
        if (vaiTro == null || vaiTro.trim().isEmpty()) {
            vaiTro = "ROLE_USER"; // Fallback nếu DB lỗi
        }
        vaiTro = vaiTro.trim(); // Xóa khoảng trắng thừa
        if (!vaiTro.startsWith("ROLE_")) {
            vaiTro = "ROLE_" + vaiTro; // Tự động thêm ROLE_ nếu thiếu (ví dụ DB lưu "ADMIN")
        }

        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(vaiTro));

        return new User(
                nguoiDung.getEmail(),
                nguoiDung.getMatKhau(),
                Boolean.TRUE.equals(nguoiDung.getTrangThai()), // Enabled: True = Mở, False = Khóa
                true, // Account Non Expired
                true, // Credentials Non Expired
                true, // Account Non Locked
                authorities);
    }
}