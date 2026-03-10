package com.dulich.backend.repository;

import com.dulich.backend.entity.BinhLuanBaiViet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BinhLuanBaiVietRepository extends JpaRepository<BinhLuanBaiViet, Long> {
    List<BinhLuanBaiViet> findByBaiVietIdOrderByNgayTaoDesc(Long baiVietId);
}
