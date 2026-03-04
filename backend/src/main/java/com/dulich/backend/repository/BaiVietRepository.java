package com.dulich.backend.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dulich.backend.entity.BaiViet;

@Repository
public interface BaiVietRepository extends JpaRepository<BaiViet, Long> {

    /**
     * Tìm kiếm danh sách bài viết theo trạng thái, có phân trang và sắp xếp theo ngày tạo mới nhất.
     * @param trangThai Trạng thái của bài viết (ví dụ: "XUAT_BAN", "NHAP").
     * @param pageable Đối tượng Pageable để phân trang và sắp xếp.
     * @return Một trang (Page) các bài viết phù hợp.
     */
    Page<BaiViet> findByTrangThaiOrderByNgayTaoDesc(String trangThai, Pageable pageable);

    /**
     * Tìm một bài viết cụ thể dựa vào slug và trạng thái.
     * @param slug Chuỗi slug duy nhất của bài viết.
     * @param trangThai Trạng thái của bài viết.
     * @return Optional chứa bài viết nếu tìm thấy.
     */
    Optional<BaiViet> findBySlugAndTrangThai(String slug, String trangThai);

    /**
     * Kiểm tra xem một slug đã tồn tại trong database hay chưa.
     * @param slug Chuỗi slug cần kiểm tra.
     * @return true nếu slug đã tồn tại, ngược lại trả về false.
     */
    boolean existsBySlug(String slug);

    List<BaiViet> findAllByOrderByNgayTaoDesc();
}
