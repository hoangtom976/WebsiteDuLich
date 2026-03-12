package com.dulich.backend.repository;

import com.dulich.backend.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findByTourIdOrderByNgayDanhGiaDesc(Long tourId);

    List<DanhGia> findByNguoiDungIdOrderByNgayDanhGiaDesc(Long nguoiDungId);

    List<DanhGia> findAllByOrderByNgayDanhGiaDesc();

    boolean existsByNguoiDungIdAndTourId(Long userId, Long tourId);

    boolean existsByTourId(Long tourId);

    void deleteByTourId(Long tourId);

    @Query("SELECT AVG(d.soSao), COUNT(d) FROM DanhGia d WHERE d.tour.id = :tourId")
    List<Object[]> getAverageRatingAndCountByTourId(@Param("tourId") Long tourId);
}
