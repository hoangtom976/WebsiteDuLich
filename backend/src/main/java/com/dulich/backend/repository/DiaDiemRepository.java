package com.dulich.backend.repository;

import com.dulich.backend.entity.DiaDiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaDiemRepository extends JpaRepository<DiaDiem, Long> {
    boolean existsByTenDiaDiem(String tenDiaDiem);
}