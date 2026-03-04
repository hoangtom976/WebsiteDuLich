package com.dulich.backend.dto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
public class TaiNguyenTrungLapException extends RuntimeException {
    public TaiNguyenTrungLapException(String message) {
        super(message);
    }
}