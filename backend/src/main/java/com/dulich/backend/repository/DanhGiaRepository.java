package com.dulich.backend.repository;

import com.dulich.backend.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findByTourIdOrderByNgayDanhGiaDesc(Long tourId);
    boolean existsByNguoiDungIdAndTourId(Long userId, Long tourId);
    boolean existsByTourId(Long tourId);
    void deleteByTourId(Long tourId);
}
