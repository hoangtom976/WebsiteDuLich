package com.dulich.backend.service;

import com.dulich.backend.config.properties.HuggingFaceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Gọi HuggingFace Inference API để tạo embedding vector từ text
 */
@Service
public class HuggingFaceEmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(HuggingFaceEmbeddingService.class);

    private final HuggingFaceProperties hfProperties;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HuggingFaceEmbeddingService(HuggingFaceProperties hfProperties) {
        this.hfProperties = hfProperties;
    }

    /**
     * Tạo embedding vector cho một đoạn text
     * 
     * @param text Đoạn text cần embed
     * @return List<Float> vector 384 chiều
     */
    public List<Float> embed(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text không được rỗng");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String apiToken = hfProperties.getApiToken();
            if (apiToken != null && !apiToken.isEmpty() && !apiToken.equals("YOUR_HF_TOKEN_HERE")) {
                headers.setBearerAuth(apiToken);
            }

            // HuggingFace Inference API format: {"inputs": "text..."}
            Map<String, Object> requestBody = Map.of("inputs", text);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    hfProperties.getEmbeddingUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getBody() == null) {
                throw new RuntimeException("HuggingFace API trả về rỗng");
            }

            // Parse response - format: [[0.1, 0.2, ...]] (mảng 2 chiều)
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            List<Float> embedding = new ArrayList<>();

            // Response có thể là [[...]] hoặc [...]
            JsonNode vectorNode = rootNode;
            if (vectorNode.isArray() && vectorNode.size() > 0 && vectorNode.get(0).isArray()) {
                vectorNode = vectorNode.get(0); // Lấy mảng bên trong
            }

            for (JsonNode val : vectorNode) {
                embedding.add(val.floatValue());
            }

            if (embedding.size() != hfProperties.getEmbeddingDimension()) {
                logger.warn("Embedding dimension mismatch: expected {}, got {}",
                        hfProperties.getEmbeddingDimension(), embedding.size());
            }

            return embedding;

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("Lỗi HTTP từ HuggingFace API: Status {}, Body: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi gọi HuggingFace API: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Lỗi khi gọi HuggingFace Embedding API: ", e);
            throw new RuntimeException("Lỗi tạo embedding: " + e.getMessage(), e);
        }
    }
}
