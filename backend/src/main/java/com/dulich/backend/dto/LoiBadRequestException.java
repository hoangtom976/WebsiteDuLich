package com.dulich.backend.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // 400 Bad Request
public class LoiBadRequestException extends RuntimeException {
    public LoiBadRequestException(String message) {
        super(message);
    }
}