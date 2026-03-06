package com.dulich.backend.repository;

import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.TokenQuenMatKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenQuenMatKhauRepository extends JpaRepository<TokenQuenMatKhau, Long> {
    Optional<TokenQuenMatKhau> findByToken(String token);

    void deleteByNguoiDung(NguoiDung nguoiDung);
}