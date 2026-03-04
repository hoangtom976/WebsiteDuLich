package com.dulich.backend.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "openweathermap")
public class OpenWeatherProperties {
    private String apiKey;
    private String baseUrl;
}
