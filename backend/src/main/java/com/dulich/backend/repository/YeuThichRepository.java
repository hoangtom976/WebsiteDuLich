package com.dulich.backend.repository;

import com.dulich.backend.entity.YeuThich;
import com.dulich.backend.entity.YeuThichId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YeuThichRepository extends JpaRepository<YeuThich, YeuThichId> {
    boolean existsByTour_Id(Long tourId);
    void deleteByTour_Id(Long tourId);
}
