package com.dulich.backend.repository;

import com.dulich.backend.entity.EmailThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailThongBaoRepository extends JpaRepository<EmailThongBao, Long> {
}