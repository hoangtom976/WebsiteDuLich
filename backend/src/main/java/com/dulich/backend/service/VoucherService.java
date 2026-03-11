package com.dulich.backend.service;

import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaiNguyenTrungLapException;
import com.dulich.backend.dto.VoucherDTO;
import com.dulich.backend.dto.VoucherCuaToiDTO;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.Voucher;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final DonDatTourRepository donDatTourRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public List<Voucher> layTatCaVoucher() {
        return voucherRepository.findAll();
    }

    private String chuanHoaMaVoucher(String maVoucher) {
        if (!StringUtils.hasText(maVoucher)) {
            throw new LoiBadRequestException("Mã voucher không được để trống");
        }
        return maVoucher.trim().toUpperCase();
    }

    private void kiemTraNgayHetHan(LocalDate ngayHetHan) {
        if (ngayHetHan == null) {
            throw new LoiBadRequestException("Ngày hết hạn không được để trống");
        }
    }

    @Transactional
    public Voucher taoVoucher(VoucherDTO req) {
        String maVoucher = chuanHoaMaVoucher(req.getMaVoucher());
        if (voucherRepository.findByMaVoucher(maVoucher).isPresent()) {
            throw new TaiNguyenTrungLapException("Mã voucher '" + maVoucher + "' đã tồn tại.");
        }

        kiemTraNgayHetHan(req.getNgayHetHan());

        Voucher voucher = Voucher.builder()
                .maVoucher(maVoucher)
                .phanTramGiam(req.getPhanTramGiam())
                .ngayHetHan(req.getNgayHetHan())
                .trangThai(req.getTrangThai() != null ? req.getTrangThai() : true)
                .build();

        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher suaVoucher(Long id, VoucherDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID voucher không được để trống");
        }

        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy voucher với ID: " + id));

        String maVoucherMoi = chuanHoaMaVoucher(req.getMaVoucher());
        voucherRepository.findByMaVoucher(maVoucherMoi)
                .filter(v -> !v.getId().equals(id))
                .ifPresent(v -> {
                    throw new TaiNguyenTrungLapException("Mã voucher '" + maVoucherMoi + "' đã tồn tại.");
                });

        kiemTraNgayHetHan(req.getNgayHetHan());

        voucher.setMaVoucher(maVoucherMoi);
        voucher.setPhanTramGiam(req.getPhanTramGiam());
        voucher.setNgayHetHan(req.getNgayHetHan());
        if (req.getTrangThai() != null) {
            voucher.setTrangThai(req.getTrangThai());
        }

        return voucherRepository.save(voucher);
    }

    @Transactional
    public void xoaVoucher(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID voucher không được để trống");
        }
        if (!voucherRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy voucher với ID: " + id);
        }
        voucherRepository.deleteById(id);
    }

    public Voucher kiemTraVoucher(String maVoucher) {
        String ma = chuanHoaMaVoucher(maVoucher);
        Voucher voucher = voucherRepository.findByMaVoucher(ma)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Mã voucher không tồn tại"));

        if (LocalDate.now().isAfter(voucher.getNgayHetHan())) {
            throw new LoiBadRequestException("Mã đã hết hạn");
        }
        if (!Boolean.TRUE.equals(voucher.getTrangThai())) {
            throw new LoiBadRequestException("Mã ngưng hoạt động");
        }

        // Check if user already used this voucher
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !email.equals("anonymousUser")) {
            nguoiDungRepository.findByEmail(email).ifPresent(nguoiDung -> {
                boolean alreadyUsed = donDatTourRepository.findByNguoiDungIdAndVoucherIsNotNull(nguoiDung.getId())
                        .stream()
                        .anyMatch(don -> don.getVoucher() != null && don.getVoucher().getId().equals(voucher.getId())
                                && !don.getTrangThai().equals("DA_HUY"));
                if (alreadyUsed) {
                    throw new LoiBadRequestException("Bạn đã sử dụng mã giảm giá này rồi.");
                }
            });
        }

        return voucher;
    }

    public List<VoucherCuaToiDTO> layVouchersCuaToi() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        List<Voucher> allVouchers = voucherRepository.findAll();
        Set<Long> usedVoucherIds = donDatTourRepository.findByNguoiDungIdAndVoucherIsNotNull(nguoiDung.getId())
                .stream()
                .filter(don -> don.getVoucher() != null)
                .map(don -> don.getVoucher().getId())
                .collect(Collectors.toSet());

        return allVouchers.stream()
                .map(v -> {
                    String status = "CON_HAN";
                    if (usedVoucherIds.contains(v.getId())) {
                        status = "DA_DUNG";
                    } else if (LocalDate.now().isAfter(v.getNgayHetHan()) || !Boolean.TRUE.equals(v.getTrangThai())) {
                        status = "HET_HAN";
                    }

                    return VoucherCuaToiDTO.builder()
                            .id(v.getId())
                            .maVoucher(v.getMaVoucher())
                            .phanTramGiam(v.getPhanTramGiam())
                            .ngayHetHan(v.getNgayHetHan())
                            .trangThai(status)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
