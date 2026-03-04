package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tin_nhan_chat")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TinNhanChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phien_chat_id")
    private PhienChat phienChat;

    @Column(name = "nguoi_gui")
    private String nguoiGui; // 'USER' hoặc 'AI'

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "thoi_gian_gui")
    private LocalDateTime thoiGianGui;
}