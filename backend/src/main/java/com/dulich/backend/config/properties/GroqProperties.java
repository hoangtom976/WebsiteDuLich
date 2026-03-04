package com.dulich.backend.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "groq.api")
public class GroqProperties {
    private String key;
    private String model = "llama-3.3-70b-versatile";
    private String url = "https://api.groq.com/openai/v1/chat/completions";
}
