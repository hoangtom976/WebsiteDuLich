package com.dulich.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

import static io.qdrant.client.ValueFactory.value;

/**
 * Upload file .txt (chính sách, FAQ...) → chunk → embed → Qdrant
 */
@Service
public class TaiLieuRagService {

    private static final Logger logger = LoggerFactory.getLogger(TaiLieuRagService.class);
    private static final int CHUNK_SIZE = 500; // ~500 ký tự mỗi chunk
    private static final long BASE_DOCUMENT_ID = 1_000_000L; // ID bắt đầu cho tài liệu (tránh trùng tour ID)

    private final HuggingFaceEmbeddingService embeddingService;
    private final QdrantService qdrantService;

    public TaiLieuRagService(HuggingFaceEmbeddingService embeddingService,
            QdrantService qdrantService) {
        this.embeddingService = embeddingService;
        this.qdrantService = qdrantService;
    }

    /**
     * Upload file .txt, chunk nội dung, embed và lưu vào Qdrant
     * 
     * @param file File .txt từ admin upload
     * @return Số chunks đã lưu
     */
    public int uploadVaEmbedFile(MultipartFile file) {
        if (!qdrantService.isAvailable()) {
            throw new RuntimeException("Qdrant không khả dụng. Hãy đảm bảo Qdrant đang chạy.");
        }

        String tenFile = file.getOriginalFilename();
        if (tenFile == null || !tenFile.toLowerCase().endsWith(".txt")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file .txt");
        }

        try {
            // 1. Đọc nội dung file
            String noiDung;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                noiDung = reader.lines().collect(Collectors.joining("\n"));
            }

            if (noiDung.isBlank()) {
                throw new IllegalArgumentException("File rỗng");
            }

            // 2. Xóa chunks cũ của file này (nếu upload lại)
            try {
                qdrantService.xoaTheoFilter("tenFile", tenFile);
                logger.info("Đã xóa chunks cũ của file '{}'", tenFile);
            } catch (Exception e) {
                logger.warn("Không thể xóa chunks cũ (có thể chưa tồn tại): {}", e.getMessage());
            }

            // 3. Chunk text
            List<String> chunks = chunkText(noiDung);
            logger.info("File '{}' được chia thành {} chunks", tenFile, chunks.size());

            // 4. Embed và upsert từng chunk
            int count = 0;
            long idCounter = BASE_DOCUMENT_ID + Math.abs(tenFile.hashCode()); // ID unique theo tên file

            for (int i = 0; i < chunks.size(); i++) {
                String chunk = chunks.get(i);
                try {
                    List<Float> vector = embeddingService.embed(chunk.toLowerCase());

                    Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload = new HashMap<>();
                    payload.put("loai", value("tai_lieu"));
                    payload.put("tenFile", value(tenFile));
                    payload.put("noiDung", value(chunk));
                    payload.put("thuTu", value((long) i));

                    qdrantService.upsertVector(idCounter + i, vector, payload);
                    count++;
                } catch (Exception e) {
                    logger.error("Lỗi embed chunk {} của file '{}': {}", i, tenFile, e.getMessage());
                }
            }

            logger.info("Upload hoàn tất: {}/{} chunks từ file '{}'", count, chunks.size(), tenFile);
            return count;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi upload file '{}': ", tenFile, e);
            throw new RuntimeException("Lỗi xử lý file: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy danh sách tên file tài liệu đã upload
     */
    public List<String> layDanhSachTaiLieu() {
        return qdrantService.layDanhSachGiaTriUnique("tenFile");
    }

    /**
     * Xóa tất cả chunks của một file khỏi Qdrant
     */
    public void xoaTaiLieu(String tenFile) {
        if (!qdrantService.isAvailable()) {
            throw new RuntimeException("Qdrant không khả dụng");
        }
        qdrantService.xoaTheoFilter("tenFile", tenFile);
        logger.info("Đã xóa tài liệu '{}' khỏi Qdrant", tenFile);
    }

    /**
     * Chunk text theo đoạn văn (ưu tiên tách theo \n\n) hoặc theo kích thước
     */
    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();

        // Tách theo đoạn văn trước
        String[] paragraphs = text.split("\n\n");
        StringBuilder currentChunk = new StringBuilder();

        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (trimmed.isEmpty())
                continue;

            // Nếu thêm đoạn này vào chunk hiện tại vẫn dưới giới hạn
            if (currentChunk.length() + trimmed.length() + 2 <= CHUNK_SIZE) {
                if (currentChunk.length() > 0) {
                    currentChunk.append("\n\n");
                }
                currentChunk.append(trimmed);
            } else {
                // Lưu chunk hiện tại
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString());
                    currentChunk = new StringBuilder();
                }

                // Nếu đoạn quá dài, cắt theo kích thước
                if (trimmed.length() > CHUNK_SIZE) {
                    int start = 0;
                    while (start < trimmed.length()) {
                        int end = Math.min(start + CHUNK_SIZE, trimmed.length());
                        // Cố gắng cắt tại dấu chấm hoặc khoảng trắng
                        if (end < trimmed.length()) {
                            int lastPeriod = trimmed.lastIndexOf(". ", end);
                            if (lastPeriod > start + CHUNK_SIZE / 2) {
                                end = lastPeriod + 1;
                            }
                        }
                        chunks.add(trimmed.substring(start, end).trim());
                        start = end;
                    }
                } else {
                    currentChunk.append(trimmed);
                }
            }
        }

        // Lưu chunk cuối cùng
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }

        return chunks;
    }
}
