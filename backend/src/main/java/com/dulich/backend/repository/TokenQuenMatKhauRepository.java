package com.dulich.backend.repository;

import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.TokenQuenMatKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenQuenMatKhauRepository extends JpaRepository<TokenQuenMatKhau, Long> {
    Optional<TokenQuenMatKhau> findByToken(String token);

    Optional<TokenQuenMatKhau> findByNguoiDung(NguoiDung nguoiDung);

    Optional<TokenQuenMatKhau> findByNguoiDung_Id(Long nguoiDungId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM TokenQuenMatKhau t WHERE t.nguoiDung.id = :nguoiDungId")
    void xoaTatCaTokenCuaNguoiDung(@org.springframework.data.repository.query.Param("nguoiDungId") Long nguoiDungId);

    void deleteByNguoiDung(NguoiDung nguoiDung);
}