package com.dulich.backend.service;

import com.dulich.backend.dto.CapNhatNguoiDungDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.NguoiDungDTO;
import com.dulich.backend.dto.PhanQuyenDTO;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaoNguoiDungDTO;
import com.dulich.backend.dto.ThayDoiTrangThaiDTO;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuanLyNguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    private String chuanHoaVaiTro(String vaiTro) {
        String tenVaiTroYeuCau = (vaiTro == null ? "" : vaiTro.trim().toUpperCase());
        List<String> vaiTroHopLe = List.of("USER", "STAFF", "ADMIN");
        if (!vaiTroHopLe.contains(tenVaiTroYeuCau)) {
            throw new LoiBadRequestException("Vai trò không hợp lệ: " + vaiTro);
        }
        return "ROLE_" + tenVaiTroYeuCau;
    }

    @Transactional
    public NguoiDungDTO taoNguoiDung(TaoNguoiDungDTO req) {
        String email = req.getEmail().trim().toLowerCase();
        if (nguoiDungRepository.existsByEmail(email)) {
            throw new LoiBadRequestException("Email đã tồn tại: " + email);
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setHoTen(req.getHoTen().trim());
        nguoiDung.setEmail(email);
        nguoiDung.setSoDienThoai(req.getSoDienThoai().trim());
        nguoiDung.setMatKhau(passwordEncoder.encode(req.getMatKhau()));
        nguoiDung.setVaiTro(chuanHoaVaiTro(req.getVaiTro()));
        nguoiDung.setTrangThai(req.getTrangThai() == null ? Boolean.TRUE : req.getTrangThai());
        nguoiDung.setNgayTao(LocalDateTime.now());

        return convertToDTO(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public NguoiDungDTO capNhatNguoiDung(Long id, CapNhatNguoiDungDTO req) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với id: " + id));

        String emailMoi = req.getEmail().trim().toLowerCase();
        if (!emailMoi.equalsIgnoreCase(nguoiDung.getEmail()) && nguoiDungRepository.existsByEmail(emailMoi)) {
            throw new LoiBadRequestException("Email đã tồn tại: " + emailMoi);
        }

        nguoiDung.setHoTen(req.getHoTen().trim());
        nguoiDung.setEmail(emailMoi);
        nguoiDung.setSoDienThoai(req.getSoDienThoai().trim());
        nguoiDung.setVaiTro(chuanHoaVaiTro(req.getVaiTro()));
        if (req.getTrangThai() != null) {
            nguoiDung.setTrangThai(req.getTrangThai());
        }
        if (StringUtils.hasText(req.getMatKhauMoi())) {
            nguoiDung.setMatKhau(passwordEncoder.encode(req.getMatKhauMoi()));
        }

        return convertToDTO(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public String xoaNguoiDung(Long id) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với id: " + id));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (nguoiDung.getEmail() != null && nguoiDung.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new LoiBadRequestException("Không thể tự xóa chính tài khoản admin đang đăng nhập.");
        }

        nguoiDungRepository.delete(nguoiDung);
        return "Đã xóa tài khoản: " + nguoiDung.getEmail();
    }

    @Transactional
    public String phanQuyenNguoiDung(PhanQuyenDTO req) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Không tìm thấy người dùng với email: " + req.getEmail()));

        String vaiTroMoi = chuanHoaVaiTro(req.getTenVaiTro());
        nguoiDung.setVaiTro(vaiTroMoi);
        nguoiDungRepository.save(nguoiDung);

        return String.format("Đã cập nhật quyền '%s' cho tài khoản '%s'",
                vaiTroMoi.replace("ROLE_", ""),
                req.getEmail());
    }

    public List<NguoiDungDTO> layTatCaNguoiDung(String tuKhoa) {
        return nguoiDungRepository.findAll().stream()
                .filter(u -> {
                    if (!StringUtils.hasText(tuKhoa))
                        return true;
                    String lowerKey = tuKhoa.toLowerCase();
                    return (u.getHoTen() != null && u.getHoTen().toLowerCase().contains(lowerKey)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerKey)) ||
                            (u.getSoDienThoai() != null && u.getSoDienThoai().contains(lowerKey));
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String thayDoiTrangThai(ThayDoiTrangThaiDTO req) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException(
                        "Không tìm thấy người dùng với email: " + req.getEmail()));

        nguoiDung.setTrangThai(req.getTrangThai());
        nguoiDungRepository.save(nguoiDung);

        return "Tài khoản " + req.getEmail() + " đã được chuyển sang trạng thái: "
                + (req.getTrangThai() ? "Hoạt động" : "Bị khóa");
    }

    public List<NguoiDungDTO> layDanhSachKhachHang(String tuKhoa) {
        return nguoiDungRepository.findAll().stream()
                .filter(u -> "ROLE_USER".equals(u.getVaiTro()))
                .filter(u -> {
                    if (!StringUtils.hasText(tuKhoa))
                        return true;
                    String lowerKey = tuKhoa.toLowerCase();
                    return (u.getHoTen() != null && u.getHoTen().toLowerCase().contains(lowerKey)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerKey)) ||
                            (u.getSoDienThoai() != null && u.getSoDienThoai().contains(lowerKey));
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private NguoiDungDTO convertToDTO(NguoiDung nguoiDung) {
        NguoiDungDTO dto = new NguoiDungDTO();
        dto.setId(nguoiDung.getId());
        dto.setEmail(nguoiDung.getEmail());
        dto.setHoTen(nguoiDung.getHoTen());
        dto.setSoDienThoai(nguoiDung.getSoDienThoai());
        dto.setTrangThai(nguoiDung.getTrangThai());
        dto.setVaiTro(nguoiDung.getVaiTro());
        dto.setNgayTao(nguoiDung.getNgayTao());
        return dto;
    }
}
