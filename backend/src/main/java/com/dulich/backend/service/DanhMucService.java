package com.dulich.backend.service;

import com.dulich.backend.dto.DanhMucDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.TaiNguyenTrungLapException;
import com.dulich.backend.entity.DanhMuc;
import com.dulich.backend.repository.DanhMucRepository;
import com.dulich.backend.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final TourRepository tourRepository;

    public List<DanhMuc> layTatCa() {
        return danhMucRepository.findAll();
    }

    private String chuanHoaTenDanhMuc(String tenDanhMuc) {
        if (!StringUtils.hasText(tenDanhMuc)) {
            throw new LoiBadRequestException("Tên danh mục không được để trống");
        }
        return tenDanhMuc.trim();
    }

    @Transactional
    public DanhMuc themDanhMuc(DanhMucDTO req) {
        String tenDanhMuc = chuanHoaTenDanhMuc(req.getTenDanhMuc());
        if (danhMucRepository.existsByTenDanhMuc(tenDanhMuc)) {
            throw new TaiNguyenTrungLapException("Tên danh mục '" + tenDanhMuc + "' đã tồn tại.");
        }

        DanhMuc danhMuc = new DanhMuc();
        danhMuc.setTenDanhMuc(tenDanhMuc);
        danhMuc.setMoTa(req.getMoTa() == null ? "" : req.getMoTa().trim());
        return danhMucRepository.save(danhMuc);
    }

    @Transactional
    public DanhMuc suaDanhMuc(Long id, DanhMucDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID danh mục không được để trống");
        }

        DanhMuc danhMuc = danhMucRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy danh mục với ID: " + id));

        String tenDanhMucMoi = chuanHoaTenDanhMuc(req.getTenDanhMuc());
        boolean biTrungTen = danhMucRepository.findAll().stream()
                .anyMatch(dm -> !dm.getId().equals(id) && tenDanhMucMoi.equalsIgnoreCase(dm.getTenDanhMuc()));

        if (biTrungTen) {
            throw new TaiNguyenTrungLapException("Tên danh mục '" + tenDanhMucMoi + "' đã tồn tại.");
        }

        danhMuc.setTenDanhMuc(tenDanhMucMoi);
        danhMuc.setMoTa(req.getMoTa() == null ? "" : req.getMoTa().trim());
        return danhMucRepository.save(danhMuc);
    }

    @Transactional
    public void xoaDanhMuc(Long id) {
        if (id == null) {
            throw new LoiBadRequestException("ID danh mục không được để trống");
        }
        if (!danhMucRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy danh mục với ID: " + id);
        }
        if (tourRepository.existsByDanhMuc_Id(id)) {
            throw new LoiBadRequestException(
                    "Không thể xóa danh mục vì còn tour liên kết. Hãy xử lý tour trước.");
        }
        danhMucRepository.deleteById(id);
    }
}
