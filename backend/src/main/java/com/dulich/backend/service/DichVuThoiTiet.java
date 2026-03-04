package com.dulich.backend.service;

import com.dulich.backend.config.properties.OpenWeatherProperties;
import com.dulich.backend.dto.ChiTietThoiTietDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class DichVuThoiTiet {

    private final OpenWeatherProperties openWeatherProperties;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChiTietThoiTietDTO layThoiTietHienTai(Double lat, Double lon) {
        if (lat == null || lon == null) {
            throw new LoiBadRequestException("Tọa độ không được để trống");
        }
        String apiUrl = openWeatherProperties.getBaseUrl();
        if (apiUrl == null || apiUrl.isEmpty()) {
            throw new RuntimeException("Chưa cấu hình URL OpenWeatherMap");
        }

        // Xây dựng URL: url?lat={lat}&lon={lon}&appid={apiKey}&units=metric&lang=vi
        String requestUrl = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", openWeatherProperties.getApiKey())
                .queryParam("units", "metric")
                .queryParam("lang", "vi")
                .toUriString();

        // Gọi API và nhận kết quả dưới dạng JsonNode
        JsonNode root = restTemplate.getForObject(requestUrl, JsonNode.class);

        if (root == null) {
            throw new RuntimeException("Không nhận được phản hồi từ OpenWeatherMap");
        }

        return ChiTietThoiTietDTO.builder()
                .thoiGian(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")))
                .nhietDo(root.path("main").path("temp").asDouble())
                .camGiacNhu(root.path("main").path("feels_like").asDouble())
                .doAm(root.path("main").path("humidity").asInt())
                .moTa(root.path("weather").path(0).path("description").asText())
                .icon(root.path("weather").path(0).path("icon").asText())
                .thanhPho(root.path("name").asText())
                .build();
    }
}