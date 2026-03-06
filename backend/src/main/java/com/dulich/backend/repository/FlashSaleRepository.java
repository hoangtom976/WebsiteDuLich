package com.dulich.backend.repository;

import com.dulich.backend.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

        @Query("SELECT fs FROM FlashSale fs WHERE fs.trangThai = true " +
                        "AND fs.tgBatDau <= :now AND fs.tgKetThuc >= :now")
        List<FlashSale> findActiveFlashSales(LocalDateTime now);

        @Query("SELECT fs FROM FlashSale fs WHERE fs.trangThai = true " +
                        "AND fs.tgBatDau <= :now AND fs.tgKetThuc >= :now " +
                        "ORDER BY fs.tgKetThuc ASC")
        Optional<FlashSale> findCurrentFlashSale(LocalDateTime now);

        @Query("SELECT fs FROM FlashSale fs WHERE fs.tour.id = :tourId AND fs.trangThai = true " +
                        "AND fs.tgBatDau <= :now AND fs.tgKetThuc >= :now")
        Optional<FlashSale> findActiveFlashSaleByTourId(Long tourId, LocalDateTime now);
}
