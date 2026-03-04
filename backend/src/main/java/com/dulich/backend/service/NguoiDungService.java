package com.dulich.backend.service;

import com.dulich.backend.dto.CapNhatHoSoDTO;
import com.dulich.backend.dto.DoiMatKhauDTO;
import com.dulich.backend.dto.NguoiDungDTO;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    private NguoiDung layNguoiDungHienTai() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với email: " + email));
    }

    private NguoiDungDTO convertToDTO(NguoiDung nguoiDung) {
        NguoiDungDTO dto = new NguoiDungDTO();
        dto.setId(nguoiDung.getId());
        dto.setEmail(nguoiDung.getEmail());
        dto.setHoTen(nguoiDung.getHoTen());
        dto.setSoDienThoai(nguoiDung.getSoDienThoai());
        dto.setTrangThai(nguoiDung.getTrangThai());
        dto.setNgayTao(nguoiDung.getNgayTao());
        dto.setVaiTro(nguoiDung.getVaiTro());
        return dto;
    }

    public NguoiDungDTO layThongTinCaNhan() {
        NguoiDung nguoiDung = layNguoiDungHienTai();
        return convertToDTO(nguoiDung);
    }

    @Transactional
    public NguoiDungDTO capNhatHoSo(CapNhatHoSoDTO request) {
        NguoiDung nguoiDung = layNguoiDungHienTai();

        if (request.getHoTen() != null) {
            nguoiDung.setHoTen(request.getHoTen());
        }
        if (request.getSoDienThoai() != null) {
            nguoiDung.setSoDienThoai(request.getSoDienThoai());
        }

        return convertToDTO(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public void doiMatKhau(DoiMatKhauDTO request) {
        NguoiDung nguoiDung = layNguoiDungHienTai();

        // 1. Kiểm tra mật khẩu hiện tại có đúng không
        if (!passwordEncoder.matches(request.getMatKhauHienTai(), nguoiDung.getMatKhau())) {
            throw new LoiBadRequestException("Mật khẩu hiện tại không chính xác.");
        }

        // 2. Mã hóa và cập nhật mật khẩu mới
        nguoiDung.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);
    }
}
