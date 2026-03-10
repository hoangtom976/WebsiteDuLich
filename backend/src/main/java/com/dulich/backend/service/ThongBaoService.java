package com.dulich.backend.service;

import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.ThongBao;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.ThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public List<ThongBao> layThongBaoCuaToi() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        return thongBaoRepository.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDung.getId());
    }

    @Transactional
    public void danhDauDaDoc(Long id) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy thông báo với ID: " + id));
        thongBao.setDaDoc(true);
        thongBaoRepository.save(thongBao);
    }

    @Transactional
    public void taoThongBao(NguoiDung nguoiDung, String tieuDe, String noiDung, String loai) {
        ThongBao thongBao = ThongBao.builder()
                .nguoiDung(nguoiDung)
                .tieuDe(tieuDe)
                .noiDung(noiDung)
                .loaiThongBao(loai)
                .build();
        thongBaoRepository.save(thongBao);
    }

    public long demThongBaoChuaDoc() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return nguoiDungRepository.findByEmail(email)
                .map(u -> thongBaoRepository.countByNguoiDungIdAndDaDocFalse(u.getId()))
                .orElse(0L);
    }
}
