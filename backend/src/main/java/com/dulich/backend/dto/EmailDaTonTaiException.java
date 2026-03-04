package com.dulich.backend.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // Trả về mã lỗi 409 Conflict
public class EmailDaTonTaiException extends RuntimeException {
    public EmailDaTonTaiException(String message) {
        super(message);
    }
}