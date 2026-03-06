package com.dulich.backend.repository;

import com.dulich.backend.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<NguoiDung> findByVaiTros_TenVaiTro(String tenVaiTro);

    @Query("SELECT u FROM NguoiDung u JOIN u.vaiTros v WHERE v.tenVaiTro = :tenVaiTro AND " +
            "(:tuKhoa IS NULL OR u.hoTen LIKE CONCAT('%', :tuKhoa, '%') OR u.email LIKE CONCAT('%', :tuKhoa, '%') OR u.soDienThoai LIKE CONCAT('%', :tuKhoa, '%'))")
    List<NguoiDung> timKiemKhachHang(@Param("tenVaiTro") String tenVaiTro, @Param("tuKhoa") String tuKhoa);

    long countByTrangThaiTrue();
}
