package com.dulich.backend.repository;

import com.dulich.backend.entity.PhanHoiDanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhanHoiDanhGiaRepository extends JpaRepository<PhanHoiDanhGia, Long> {
    void deleteByDanhGia_Tour_Id(Long tourId);
}
