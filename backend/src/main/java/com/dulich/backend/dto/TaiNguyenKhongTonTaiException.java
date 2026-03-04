package com.dulich.backend.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // 404 Not Found
public class TaiNguyenKhongTonTaiException extends RuntimeException {
    public TaiNguyenKhongTonTaiException(String message) {
        super(message);
    }
}