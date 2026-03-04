package com.dulich.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CauHinhCloudinary {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "ddpreqmwn",
                "api_key", "936396337116263",
                "api_secret", "KZ0K0vkNKPtv8sjBX-I3pQIXrz0"
        ));
    }
}