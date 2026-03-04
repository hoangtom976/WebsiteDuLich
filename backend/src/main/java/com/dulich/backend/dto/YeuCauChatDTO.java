package com.dulich.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YeuCauChatDTO {
    private Long phienChatId;
    private Long nguoiDungId;
    private String cauHoi;
}