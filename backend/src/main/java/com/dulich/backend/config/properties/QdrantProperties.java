package com.dulich.backend.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "qdrant")
public class QdrantProperties {
    private String host = "localhost";
    private int port = 6334;
    private String collectionName = "tours";
}
