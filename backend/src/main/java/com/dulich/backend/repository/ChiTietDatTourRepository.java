package com.dulich.backend.repository;

import com.dulich.backend.entity.ChiTietDatTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietDatTourRepository extends JpaRepository<ChiTietDatTour, Long> {
}