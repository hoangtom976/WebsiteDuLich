package com.dulich.backend.dto;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class XuLyNgoaiLeChung {

    @ExceptionHandler(EmailDaTonTaiException.class)
    public ResponseEntity<PhanHoiLoi> xuLyEmailDaTonTai(EmailDaTonTaiException ex, HttpServletRequest request) {
        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.CONFLICT);
    }

    // 1. Xử lý lỗi JSON không hợp lệ (Lỗi bạn đang gặp)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<PhanHoiLoi> xuLyLoiDocJson(HttpMessageNotReadableException ex, HttpServletRequest request) {
        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Lỗi định dạng JSON: Vui lòng kiểm tra dấu phẩy thừa hoặc cú pháp.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.BAD_REQUEST);
    }

    // 2. Xử lý lỗi Validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<PhanHoiLoi> xuLyLoiValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));

        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                errors.toString(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.BAD_REQUEST);
    }

    // 3. Xử lý lỗi không tìm thấy (404) - Để Spring tự xử lý annotation @ResponseStatus hoặc bắt thủ công
    @ExceptionHandler(TaiNguyenKhongTonTaiException.class)
    public ResponseEntity<PhanHoiLoi> xuLyKhongTimThay(TaiNguyenKhongTonTaiException ex, HttpServletRequest request) {
        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(LoiBadRequestException.class)
    public ResponseEntity<PhanHoiLoi> xuLyBadRequest(LoiBadRequestException ex, HttpServletRequest request) {
        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.BAD_REQUEST);
    }

    // 4. Xử lý các lỗi còn lại (500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<PhanHoiLoi> xuLyLoiChung(Exception ex, HttpServletRequest request) {
        PhanHoiLoi phanHoiLoi = new PhanHoiLoi(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(phanHoiLoi, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}