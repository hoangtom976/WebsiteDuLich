package com.dulich.backend.repository;

import com.dulich.backend.entity.PhienChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhienChatRepository extends JpaRepository<PhienChat, Long> {
    List<PhienChat> findByNguoiDungId(Long nguoiDungId);
}