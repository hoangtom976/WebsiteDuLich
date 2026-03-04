package com.dulich.backend.service;

import com.dulich.backend.dto.DiaDiemDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaiNguyenTrungLapException;
import com.dulich.backend.entity.DiaDiem;
import com.dulich.backend.repository.DiaDiemRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaDiemService {

    private final DiaDiemRepository diaDiemRepository;
    private final TourRepository tourRepository;

    public List<DiaDiem> layTatCa() {
        return diaDiemRepository.findAll();
    }

    private String chuanHoaTenDiaDiem(String tenDiaDiem) {
        if (!StringUtils.hasText(tenDiaDiem)) {
            throw new LoiBadRequestException("Tên địa điểm không được để trống");
        }
        return tenDiaDiem.trim();
    }

    @Transactional
    public DiaDiem themDiaDiem(DiaDiemDTO req) {
        String tenDiaDiem = chuanHoaTenDiaDiem(req.getTenDiaDiem());
        if (diaDiemRepository.existsByTenDiaDiem(tenDiaDiem)) {
            throw new TaiNguyenTrungLapException("Tên địa điểm '" + tenDiaDiem + "' đã tồn tại.");
        }

        DiaDiem diaDiem = new DiaDiem();
        diaDiem.setTenDiaDiem(tenDiaDiem);
        diaDiem.setMoTa(req.getMoTa() == null ? "" : req.getMoTa().trim());
        return diaDiemRepository.save(diaDiem);
    }

    @Transactional
    public DiaDiem suaDiaDiem(Long id, DiaDiemDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID địa điểm không được để trống");
        }

        DiaDiem diaDiem = diaDiemRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy địa điểm với ID: " + id));

        String tenDiaDiemMoi = chuanHoaTenDiaDiem(req.getTenDiaDiem());
        boolean biTrungTen = diaDiemRepository.findAll().stream()
                .anyMatch(dd -> !dd.getId().equals(id) && tenDiaDiemMoi.equalsIgnoreCase(dd.getTenDiaDiem()));

        if (biTrungTen) {
            throw new TaiNguyenTrungLapException("Tên địa điểm '" + tenDiaDiemMoi + "' đã tồn tại.");
        }

        diaDiem.setTenDiaDiem(tenDiaDiemMoi);
        diaDiem.setMoTa(req.getMoTa() == null ? "" : req.getMoTa().trim());
        return diaDiemRepository.save(diaDiem);
    }

    @Transactional
    public void xoaDiaDiem(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID địa điểm không được để trống");
        }
        if (!diaDiemRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy địa điểm với ID: " + id);
        }
        if (tourRepository.existsByDiaDiem_Id(id)) {
            throw new LoiBadRequestException(
                    "Không thể xóa địa điểm vì còn tour liên kết. Hãy xử lý tour trước.");
        }
        diaDiemRepository.deleteById(id);
    }
}
