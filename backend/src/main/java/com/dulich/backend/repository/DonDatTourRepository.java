package com.dulich.backend.repository;

import com.dulich.backend.entity.DonDatTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonDatTourRepository extends JpaRepository<DonDatTour, Long> {
    List<DonDatTour> findByNguoiDungId(Long nguoiDungId);
    List<DonDatTour> findByNguoiDungIdOrderByNgayDatDesc(Long nguoiDungId);
    List<DonDatTour> findAllByOrderByNgayDatDesc();
    List<DonDatTour> findByLichKhoiHanh_Id(Long lichKhoiHanhId);
    boolean existsByLichKhoiHanh_Id(Long lichKhoiHanhId);
    boolean existsByNguoiDungIdAndLichKhoiHanh_Tour_IdAndTrangThai(Long userId, Long tourId, String trangThai);
}
