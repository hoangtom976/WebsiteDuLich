package com.dulich.backend.repository;

import com.dulich.backend.entity.TinNhanChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinNhanChatRepository extends JpaRepository<TinNhanChat, Long> {
    List<TinNhanChat> findByPhienChatIdOrderByThoiGianGuiAsc(Long phienChatId);
}