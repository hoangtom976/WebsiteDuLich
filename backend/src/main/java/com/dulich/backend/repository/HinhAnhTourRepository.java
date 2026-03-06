package com.dulich.backend.repository;

import com.dulich.backend.entity.HinhAnhTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhTourRepository extends JpaRepository<HinhAnhTour, Long> {
    List<HinhAnhTour> findByTourId(Long tourId);

    boolean existsByTourId(Long tourId);
}
