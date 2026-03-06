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
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChiTietNguoiDungService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Xử lý vai trò: Thu thập từ cả cột vai_tro (String) và bảng quan hệ vai_tros
        // (Set)
        Set<String> roles = new HashSet<>();

        // 1. Lấy từ cột vai_tro
        if (nguoiDung.getVaiTro() != null && !nguoiDung.getVaiTro().trim().isEmpty()) {
            roles.add(nguoiDung.getVaiTro().trim().toUpperCase());
        }

        // 2. Lấy từ bảng quan hệ vai_tros
        if (nguoiDung.getVaiTros() != null) {
            nguoiDung.getVaiTros().forEach(vt -> roles.add(vt.getTenVaiTro().trim().toUpperCase()));
        }

        // Nếu không có vai trò nào, mặc định là USER
        if (roles.isEmpty()) {
            roles.add("USER");
        }

        List<GrantedAuthority> authorities = roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

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