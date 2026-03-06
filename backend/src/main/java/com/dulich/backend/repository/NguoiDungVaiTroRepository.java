package com.dulich.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.NguoiDungVaiTro;
import com.dulich.backend.entity.NguoiDungVaiTroId;

@Repository
public interface NguoiDungVaiTroRepository extends JpaRepository<NguoiDungVaiTro, NguoiDungVaiTroId> {
    List<NguoiDungVaiTro> findByNguoiDung(NguoiDung nguoiDung);
}