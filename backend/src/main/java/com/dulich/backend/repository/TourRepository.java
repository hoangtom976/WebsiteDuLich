package com.dulich.backend.repository;

import com.dulich.backend.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    boolean existsByTenTour(String tenTour);
    boolean existsByDanhMuc_Id(Long danhMucId);
    boolean existsByDiaDiem_Id(Long diaDiemId);

    List<Tour> findByTenTourContaining(String tuKhoa);

    @Query("SELECT t FROM Tour t WHERE " +
            "(:tuKhoa IS NULL OR t.tenTour LIKE %:tuKhoa%) AND " +
            "(:giaMin IS NULL OR t.gia >= :giaMin) AND " +
            "(:giaMax IS NULL OR t.gia <= :giaMax)")
    List<Tour> timKiemTour(@Param("tuKhoa") String tuKhoa,
            @Param("giaMin") BigDecimal giaMin,
            @Param("giaMax") BigDecimal giaMax);

    @Query(value = "SELECT t.* FROM tour t " +
            "LEFT JOIN lich_khoi_hanh lkh ON t.id = lkh.tour_id " +
            "LEFT JOIN don_dat_tour ddt ON lkh.id = ddt.lich_khoi_hanh_id " +
            "WHERE t.trang_thai = true " +
            "GROUP BY t.id " +
            "ORDER BY COUNT(ddt.id) DESC, t.id DESC " +
            "LIMIT 3", nativeQuery = true)
    List<Tour> timTourPhoBien();
}
