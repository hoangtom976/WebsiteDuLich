package com.dulich.backend.dto;

import lombok.Data;

@Data
public class PhanHoiTokenDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private String hoTen;
}
