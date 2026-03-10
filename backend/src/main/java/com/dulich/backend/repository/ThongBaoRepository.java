package com.dulich.backend.repository;

import com.dulich.backend.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    List<ThongBao> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId);

    long countByNguoiDungIdAndDaDocFalse(Long nguoiDungId);
}
