package com.dulich.backend.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dulich.backend.dto.BaiVietPhanHoiDTO;
import com.dulich.backend.dto.BaiVietYeuCauDTO;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.entity.BaiViet;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.repository.BaiVietRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.repository.BinhLuanBaiVietRepository;
import com.dulich.backend.entity.BinhLuanBaiViet;
import com.dulich.backend.dto.BinhLuanYeuCauDTO;
import com.dulich.backend.dto.BinhLuanPhanHoiDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BaiVietService {

    private final BaiVietRepository baiVietRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BinhLuanBaiVietRepository binhLuanBaiVietRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Tạo một bài viết mới.
     * 
     * @param yeuCau     DTO chứa thông tin bài viết mới.
     * @return DTO của bài viết đã được tạo.
     */
    @Transactional
    public BaiVietPhanHoiDTO taoBaiViet(BaiVietYeuCauDTO yeuCau) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung tacGia = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy nhân viên với email: " + email));

        String slug = taoSlug(yeuCau.getTieuDe());

        // Kiểm tra và đảm bảo slug là duy nhất
        if (baiVietRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        BaiViet baiViet = BaiViet.builder()
                .tieuDe(yeuCau.getTieuDe())
                .anhBia(yeuCau.getAnhBia())
                .noiDung(yeuCau.getNoiDung())
                .trangThai(yeuCau.getTrangThai())
                .tacGia(tacGia)
                .slug(slug)
                .build();

        BaiViet savedBaiViet = baiVietRepository.save(baiViet);
        return convertToPhanHoiDTO(savedBaiViet);
    }

    /**
     * Lấy danh sách các bài viết đã xuất bản, có phân trang.
     * 
     * @param pageable Đối tượng phân trang.
     * @return Một trang các bài viết DTO.
     */
    public Page<BaiVietPhanHoiDTO> layDanhSachBaiVietDaXuatBan(Pageable pageable) {
        Page<BaiViet> baiVietPage = baiVietRepository.findByTrangThaiOrderByNgayTaoDesc("XUAT_BAN", pageable);
        return baiVietPage.map(this::convertToPhanHoiDTO);
    }

    public List<BaiVietPhanHoiDTO> layDanhSachBaiVietQuanTri() {
        return baiVietRepository.findAllByOrderByNgayTaoDesc().stream()
                .map(this::convertToPhanHoiDTO)
                .toList();
    }

    /**
     * Lấy chi tiết một bài viết và tăng lượt xem.
     * 
     * @param slug Slug của bài viết.
     * @return DTO chi tiết của bài viết.
     */
    @Transactional
    public BaiVietPhanHoiDTO layChiTietBaiViet(String slug) {
        BaiViet baiViet = baiVietRepository.findBySlugAndTrangThai(slug, "XUAT_BAN")
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy bài viết với slug: " + slug));

        // Tăng lượt xem
        baiViet.setLuotXem(baiViet.getLuotXem() + 1);
        // @Transactional sẽ tự động lưu thay đổi

        return convertToPhanHoiDTO(baiViet);
    }

    /**
     * Cập nhật một bài viết đã có.
     * 
     * @param id     ID của bài viết cần sửa.
     * @param yeuCau DTO chứa thông tin cập nhật.
     * @return DTO của bài viết sau khi đã cập nhật.
     */
    @Transactional
    public BaiVietPhanHoiDTO suaBaiViet(Long id, BaiVietYeuCauDTO yeuCau) {
        BaiViet baiViet = baiVietRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy bài viết với ID: " + id));

        // Kiểm tra xem tiêu đề có thay đổi không
        if (!Objects.equals(yeuCau.getTieuDe(), baiViet.getTieuDe())) {
            String newSlug = taoSlug(yeuCau.getTieuDe());
            if (baiVietRepository.existsBySlug(newSlug)) {
                newSlug = newSlug + "-" + System.currentTimeMillis();
            }
            baiViet.setSlug(newSlug);
        }

        baiViet.setTieuDe(yeuCau.getTieuDe());
        baiViet.setAnhBia(yeuCau.getAnhBia());
        baiViet.setNoiDung(yeuCau.getNoiDung());
        baiViet.setTrangThai(yeuCau.getTrangThai());

        BaiViet updatedBaiViet = baiVietRepository.save(baiViet);
        return convertToPhanHoiDTO(updatedBaiViet);
    }

    /**
     * Xóa một bài viết theo ID.
     * 
     * @param id ID của bài viết cần xóa.
     */
    @Transactional
    public void xoaBaiViet(Long id) {
        if (!baiVietRepository.existsById(id)) {
            throw new TaiNguyenKhongTonTaiException("Không tìm thấy bài viết với ID: " + id);
        }
        baiVietRepository.deleteById(id);
    }

    private String taoSlug(String input) {
        if (input == null)
            return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    @Transactional
    public BinhLuanPhanHoiDTO themBinhLuan(Long baiVietId, BinhLuanYeuCauDTO yeuCau) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng với email: " + email));
        
        BaiViet baiViet = baiVietRepository.findById(baiVietId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy bài viết với ID: " + baiVietId));

        BinhLuanBaiViet binhLuan = BinhLuanBaiViet.builder()
                .baiViet(baiViet)
                .nguoiDung(nguoiDung)
                .noiDung(yeuCau.getNoiDung())
                .build();

        BinhLuanBaiViet saved = binhLuanBaiVietRepository.save(binhLuan);
        return convertToBinhLuanDTO(saved);
    }

    public List<BinhLuanPhanHoiDTO> layDanhSachBinhLuan(Long baiVietId) {
        return binhLuanBaiVietRepository.findByBaiVietIdOrderByNgayTaoDesc(baiVietId).stream()
                .map(this::convertToBinhLuanDTO)
                .toList();
    }

    private BinhLuanPhanHoiDTO convertToBinhLuanDTO(BinhLuanBaiViet binhLuan) {
        return BinhLuanPhanHoiDTO.builder()
                .id(binhLuan.getId())
                .nguoiDungId(binhLuan.getNguoiDung().getId())
                .tenNguoiDung(binhLuan.getNguoiDung().getHoTen())
                .noiDung(binhLuan.getNoiDung())
                .ngayTao(binhLuan.getNgayTao())
                .build();
    }

    private BaiVietPhanHoiDTO convertToPhanHoiDTO(BaiViet baiViet) {
        BaiVietPhanHoiDTO dto = new BaiVietPhanHoiDTO();
        dto.setId(baiViet.getId());
        dto.setTieuDe(baiViet.getTieuDe());
        dto.setSlug(baiViet.getSlug());
        dto.setAnhBia(baiViet.getAnhBia());
        dto.setNoiDung(baiViet.getNoiDung());
        dto.setTrangThai(baiViet.getTrangThai());
        dto.setLuotXem(baiViet.getLuotXem());
        dto.setNgayTao(baiViet.getNgayTao());
        if (baiViet.getTacGia() != null) {
            dto.setTenTacGia(baiViet.getTacGia().getHoTen());
        }
        return dto;
    }
}
