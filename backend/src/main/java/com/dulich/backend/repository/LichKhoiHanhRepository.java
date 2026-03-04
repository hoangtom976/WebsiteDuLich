package com.dulich.backend.repository;

import com.dulich.backend.entity.LichKhoiHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichKhoiHanhRepository extends JpaRepository<LichKhoiHanh, Long> {
    List<LichKhoiHanh> findByTourId(Long tourId);
    boolean existsByTour_Id(Long tourId);
}
