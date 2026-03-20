package com.dulich.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PhienChatQuanTriDTO {
    private Long id;
    private String tieuDe;
    private Long nguoiDungId; // ID của người dùng đã đăng nhập (nếu có)
    private String tenNguoiDung; // Tên của người dùng
    private LocalDateTime thoiGianBatDau;
}