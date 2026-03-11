package com.dulich.backend.repository;

import com.dulich.backend.entity.XacThucOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface XacThucOtpRepository extends JpaRepository<XacThucOtp, Long> {
    Optional<XacThucOtp> findByEmailAndOtp(String email, String otp);

    void deleteByEmail(String email);
}
