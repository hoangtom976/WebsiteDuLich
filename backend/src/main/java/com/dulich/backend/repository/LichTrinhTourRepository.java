package com.dulich.backend.repository;

import com.dulich.backend.entity.LichTrinhTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichTrinhTourRepository extends JpaRepository<LichTrinhTour, Long> {
    List<LichTrinhTour> findByTourId(Long tourId);

    List<LichTrinhTour> findByTourIdOrderByNgayThuAsc(Long tourId);

    void deleteByTourId(Long tourId);

    boolean existsByTourIdAndNgayThu(Long tourId, Integer ngayThu);

    boolean existsByTourIdAndNgayThuAndIdNot(Long tourId, Integer ngayThu, Long id);

    boolean existsByTourId(Long tourId);
}
