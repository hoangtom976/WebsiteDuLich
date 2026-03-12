package com.dulich.backend.service;

import com.dulich.backend.config.properties.GroqProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service gọi trực tiếp Groq Cloud API (OpenAI Compatible)
 */
@Service
public class GroqApiService {

    private static final Logger logger = LoggerFactory.getLogger(GroqApiService.class);

    private final GroqProperties groqProperties;

    public GroqApiService(GroqProperties groqProperties) {
        this.groqProperties = groqProperties;
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gọi Groq API với system instruction và user prompt
     */
    public String generateContentWithSystem(String systemInstruction, String userPrompt) {
        String currentApiKey = groqProperties.getKey();
        String currentApiUrl = groqProperties.getUrl();

        if (currentApiKey == null || currentApiKey.isEmpty() || currentApiKey.equals("YOUR_GROQ_API_KEY_HERE")) {
            return "Lỗi: Vui lòng cung cấp Groq API Key trong application.properties";
        }
        if (currentApiUrl == null || currentApiUrl.isEmpty()) {
            return "Lỗi: Vui lòng cung cấp Groq API URL trong application.properties";
        }

        try {
            // Build request body (OpenAI Format)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqProperties.getModel());

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemInstruction);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);

            requestBody.put("messages", List.of(systemMessage, userMessage));
            requestBody.put("temperature", 0.5);

            // Build headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(currentApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            logger.debug("Calling Groq API with model: {}", groqProperties.getModel());
            ResponseEntity<String> response = restTemplate.exchange(
                    currentApiUrl,
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    String.class);

            // Parse response
            if (response.getBody() == null) {
                return "Lỗi: Phản hồi từ Groq API trống.";
            }

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode choices = rootNode.path("choices");

            if (choices.isArray() && choices.size() > 0) {
                return choices.get(0).path("message").path("content").asText();
            }

            return "Xin lỗi, Groq Cloud không trả về kết quả.";

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("Lỗi HTTP từ Groq API: Status {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "Lỗi gọi Groq API: " + e.getResponseBodyAsString();
        } catch (Exception e) {
            logger.error("Error calling Groq API: ", e);
            return "Lỗi kết nối Groq Cloud: " + e.getMessage();
        }
    }

    /**
     * Gọi Groq API với system instruction và danh sách messages (hỗ trợ lịch sử hội thoại)
     */
    public String generateContentWithMessages(String systemInstruction, List<Map<String, String>> conversationMessages) {
        String currentApiKey = groqProperties.getKey();
        String currentApiUrl = groqProperties.getUrl();

        if (currentApiKey == null || currentApiKey.isEmpty() || currentApiKey.equals("YOUR_GROQ_API_KEY_HERE")) {
            return "Lỗi: Vui lòng cung cấp Groq API Key trong application.properties";
        }
        if (currentApiUrl == null || currentApiUrl.isEmpty()) {
            return "Lỗi: Vui lòng cung cấp Groq API URL trong application.properties";
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqProperties.getModel());

            // Tạo danh sách messages: system + lịch sử hội thoại
            List<Map<String, String>> allMessages = new java.util.ArrayList<>();

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemInstruction);
            allMessages.add(systemMessage);

            allMessages.addAll(conversationMessages);

            requestBody.put("messages", allMessages);
            requestBody.put("temperature", 0.5);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(currentApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            logger.debug("Calling Groq API with model: {}, messages count: {}", groqProperties.getModel(), allMessages.size());
            ResponseEntity<String> response = restTemplate.exchange(
                    currentApiUrl,
                    Objects.requireNonNull(HttpMethod.POST),
                    entity,
                    String.class);

            if (response.getBody() == null) {
                return "Lỗi: Phản hồi từ Groq API trống.";
            }

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode choices = rootNode.path("choices");

            if (choices.isArray() && choices.size() > 0) {
                return choices.get(0).path("message").path("content").asText();
            }

            return "Xin lỗi, Groq Cloud không trả về kết quả.";

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("Lỗi HTTP từ Groq API: Status {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "Lỗi gọi Groq API: " + e.getResponseBodyAsString();
        } catch (Exception e) {
            logger.error("Error calling Groq API: ", e);
            return "Lỗi kết nối Groq Cloud: " + e.getMessage();
        }
    }
}
