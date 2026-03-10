package com.dulich.backend.service;

import com.dulich.backend.config.properties.OpenWeatherProperties;
import com.dulich.backend.dto.ChiTietThoiTietDTO;
import com.dulich.backend.dto.DuBaoThoiTietDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;
import java.util.LinkedHashMap;

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

    public DuBaoThoiTietDTO layDuBaoThoiTiet(Double lat, Double lon) {
        if (lat == null || lon == null) {
            throw new LoiBadRequestException("Tọa độ không được để trống");
        }

        // OpenWeatherMap 5 day forecast endpoint uses /forecast instead of /weather
        String baseUrl = openWeatherProperties.getBaseUrl();
        String forecastUrl = baseUrl.replace("/weather", "/forecast");

        String requestUrl = UriComponentsBuilder.fromUriString(forecastUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", openWeatherProperties.getApiKey())
                .queryParam("units", "metric")
                .queryParam("lang", "vi")
                .toUriString();

        JsonNode root = restTemplate.getForObject(requestUrl, JsonNode.class);
        if (root == null) {
            throw new RuntimeException("Không nhận được phản hồi từ OpenWeatherMap");
        }

        JsonNode listNode = root.path("list");

        // Group by day to get one forecast per day (e.g., at 12:00)
        Map<String, DuBaoThoiTietDTO.ChiTietDuBaoDTO> dailyForecasts = new LinkedHashMap<>();

        for (JsonNode node : listNode) {
            long dt = node.path("dt").asLong();
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(dt), ZoneId.systemDefault());
            String dateKey = dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            // Just take the first forecast of the day or ideally around noon
            if (!dailyForecasts.containsKey(dateKey)) {
                dailyForecasts.put(dateKey, DuBaoThoiTietDTO.ChiTietDuBaoDTO.builder()
                        .thoiGian(dateKey)
                        .nhietDoNgay(node.path("main").path("temp_max").asDouble())
                        .nhietDoDem(node.path("main").path("temp_min").asDouble())
                        .doAm(node.path("main").path("humidity").asInt())
                        .moTa(node.path("weather").path(0).path("description").asText())
                        .icon(node.path("weather").path(0).path("icon").asText())
                        .build());
            }
        }

        return DuBaoThoiTietDTO.builder()
                .thanhPho(root.path("city").path("name").asText())
                .danhSachDuBao(new ArrayList<>(dailyForecasts.values()))
                .build();
    }

    public Double[] layToaDoTuTenDiaDiem(String tenDiaDiem) {
        if (tenDiaDiem == null || tenDiaDiem.isEmpty()) {
            return null;
        }

        // Thử tìm với tên gốc
        Double[] result = goiApiGeocoding(tenDiaDiem);
        if (result != null)
            return result;

        // Nếu không thấy, thử xóa các tiền tố tiếng Việt phổ biến
        String cleanName = tenDiaDiem
                .replaceFirst(
                        "(?i)^(Vịnh|Đảo|Cao nguyên|Rừng|Vườn quốc gia|Thành phố|Tỉnh|Huyện|Xã|Phường|Thị trấn|Núi|Sông|Hồ|Bãi biển|Khu du lịch)\\s+",
                        "")
                .trim();

        if (!cleanName.equals(tenDiaDiem)) {
            System.out.println("-> Thử lại với tên đã xóa tiền tố: " + cleanName);
            result = goiApiGeocoding(cleanName);
            if (result != null)
                return result;
        }

        // Cuối cùng, thử xóa dấu tiếng Việt (ví dụ: "Phú Quốc" -> "Phu Quoc")
        String noAccentName = boDauTiengViet(cleanName);
        if (!noAccentName.equals(cleanName)) {
            System.out.println("-> Thử lại với tên không dấu: " + noAccentName);
            return goiApiGeocoding(noAccentName);
        }

        return null;
    }

    private String boDauTiengViet(String s) {
        if (s == null)
            return null;
        String nfdNormalizedString = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfdNormalizedString).replaceAll("").replace('đ', 'd').replace('Đ', 'D');
    }

    private Double[] goiApiGeocoding(String query) {
        String baseUrl = openWeatherProperties.getBaseUrl();
        String geocodingUrl = "http://api.openweathermap.org/geo/1.0/direct";

        if (baseUrl != null && baseUrl.contains("/data/")) {
            geocodingUrl = baseUrl.split("/data/")[0] + "/geo/1.0/direct";
        }

        // Dùng .build().toUri() để Spring tự encoding chuẩn xác
        java.net.URI requestUri = UriComponentsBuilder.fromUriString(geocodingUrl)
                .queryParam("q", query + ",VN")
                .queryParam("limit", 1)
                .queryParam("appid", openWeatherProperties.getApiKey())
                .build()
                .toUri();

        try {
            System.out.println("Đang lấy tọa độ cho: " + query + " qua " + requestUri);
            JsonNode root = restTemplate.getForObject(requestUri, JsonNode.class);
            if (root != null && root.isArray() && !root.isEmpty()) {
                JsonNode firstResult = root.get(0);
                Double lat = firstResult.path("lat").asDouble();
                Double lon = firstResult.path("lon").asDouble();
                System.out.println("-> OK: " + lat + ", " + lon);
                return new Double[] { lat, lon };
            }
        } catch (Exception e) {
            System.err.println("Lỗi Geocoding cho " + query + ": " + e.getMessage());
        }
        return null;
    }
}