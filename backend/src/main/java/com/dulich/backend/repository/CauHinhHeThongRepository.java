package com.dulich.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dulich.backend.entity.CauHinhHeThong;

@Repository
public interface CauHinhHeThongRepository extends JpaRepository<CauHinhHeThong, Long> {
}
