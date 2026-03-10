package com.dulich.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dulich.backend.dto.BaiVietPhanHoiDTO;
import com.dulich.backend.dto.BaiVietYeuCauDTO;
import com.dulich.backend.dto.BinhLuanYeuCauDTO;
import com.dulich.backend.dto.BinhLuanPhanHoiDTO;
import com.dulich.backend.service.BaiVietService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BaiVietController {

    private final BaiVietService baiVietService;

    // =================================
    // == API cho NHÂN VIÊN (STAFF) ==
    // =================================

    /**
     * Endpoint cho nhân viên tạo bài viết mới.
     * 
     * @param yeuCau DTO chứa thông tin bài viết.
     * @return ResponseEntity chứa DTO của bài viết đã tạo và mã trạng thái 201
     *         (Created).
     */
    @PostMapping("/nhan-vien/bai-viet")
    public ResponseEntity<BaiVietPhanHoiDTO> taoBaiViet(@Valid @RequestBody BaiVietYeuCauDTO yeuCau) {
        // Giả lập ID nhân viên lấy từ JWT token sau khi đăng nhập
        Long nhanVienId = 1L;
        BaiVietPhanHoiDTO dto = baiVietService.taoBaiViet(yeuCau, nhanVienId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/nhan-vien/bai-viet")
    public ResponseEntity<List<BaiVietPhanHoiDTO>> layDanhSachBaiVietQuanTri() {
        List<BaiVietPhanHoiDTO> danhSach = baiVietService.layDanhSachBaiVietQuanTri();
        return ResponseEntity.ok(danhSach);
    }

    /**
     * Endpoint cho nhân viên cập nhật bài viết.
     * 
     * @param id     ID của bài viết cần cập nhật.
     * @param yeuCau DTO chứa thông tin cập nhật.
     * @return ResponseEntity chứa DTO của bài viết đã cập nhật.
     */
    @PutMapping("/nhan-vien/bai-viet/{id}")
    public ResponseEntity<BaiVietPhanHoiDTO> suaBaiViet(
            @PathVariable Long id,
            @Valid @RequestBody BaiVietYeuCauDTO yeuCau) {
        BaiVietPhanHoiDTO dto = baiVietService.suaBaiViet(id, yeuCau);
        return ResponseEntity.ok(dto);
    }

    /**
     * Endpoint cho nhân viên xóa bài viết.
     * 
     * @param id ID của bài viết cần xóa.
     * @return ResponseEntity chứa thông báo thành công.
     */
    @DeleteMapping("/nhan-vien/bai-viet/{id}")
    public ResponseEntity<String> xoaBaiViet(@PathVariable Long id) {
        baiVietService.xoaBaiViet(id);
        return ResponseEntity.ok("Xoá bài viết thành công!");
    }

    // =================================
    // == API cho KHÁCH (PUBLIC) ==
    // =================================

    /**
     * Endpoint công khai để lấy danh sách bài viết đã xuất bản có phân trang.
     * 
     * @param page Trang hiện tại (mặc định là 0).
     * @param size Số lượng bài viết trên mỗi trang (mặc định là 10).
     * @return ResponseEntity chứa một trang (Page) các bài viết.
     */
    @GetMapping("/cong-khai/bai-viet")
    public ResponseEntity<Page<BaiVietPhanHoiDTO>> layDanhSachBaiViet(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BaiVietPhanHoiDTO> pageDto = baiVietService.layDanhSachBaiVietDaXuatBan(pageable);
        return ResponseEntity.ok(pageDto);
    }

    /**
     * Endpoint công khai để xem chi tiết một bài viết theo slug.
     * 
     * @param slug Slug của bài viết.
     * @return ResponseEntity chứa DTO chi tiết của bài viết.
     */
    @GetMapping("/cong-khai/bai-viet/{slug}")
    public ResponseEntity<BaiVietPhanHoiDTO> layChiTietBaiViet(@PathVariable String slug) {
        BaiVietPhanHoiDTO dto = baiVietService.layChiTietBaiViet(slug);
        return ResponseEntity.ok(dto);
    }

    // =================================
    // == API BÌNH LUẬN (COMMENTS) ==
    // =================================

    /**
     * Lấy danh sách bình luận của một bài viết.
     */
    @GetMapping("/cong-khai/bai-viet/{id}/binh-luan")
    public ResponseEntity<List<BinhLuanPhanHoiDTO>> layDanhSachBinhLuan(@PathVariable Long id) {
        List<BinhLuanPhanHoiDTO> danhSach = baiVietService.layDanhSachBinhLuan(id);
        return ResponseEntity.ok(danhSach);
    }

    /**
     * Thêm bình luận mới vào bài viết (Yêu cầu đăng nhập).
     */
    @PostMapping("/bai-viet/{id}/binh-luan")
    public ResponseEntity<BinhLuanPhanHoiDTO> themBinhLuan(
            @PathVariable Long id,
            @Valid @RequestBody BinhLuanYeuCauDTO yeuCau) {
        // Giả lập ID người dùng lấy từ JWT token (trong thực tế lấy từ
        // SecurityContextHolder)
        Long nguoiDungId = 1L;
        BinhLuanPhanHoiDTO dto = baiVietService.themBinhLuan(id, yeuCau, nguoiDungId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
