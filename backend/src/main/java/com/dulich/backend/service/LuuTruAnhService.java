package com.dulich.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dulich.backend.dto.LoiBadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LuuTruAnhService {

    private final Cloudinary cloudinary;

    @SuppressWarnings("unchecked")
    public String uploadAnh(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new LoiBadRequestException("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }
}