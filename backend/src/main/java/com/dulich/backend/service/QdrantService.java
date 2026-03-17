package com.dulich.backend.service;

import com.dulich.backend.config.properties.QdrantProperties;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.grpc.Collections.Distance;
import io.qdrant.client.grpc.Collections.VectorParams;
import io.qdrant.client.grpc.Points.*;
import io.qdrant.client.grpc.Common.Filter;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

import static io.qdrant.client.PointIdFactory.id;
import static io.qdrant.client.ValueFactory.value;
import static io.qdrant.client.VectorsFactory.vectors;
import static io.qdrant.client.WithPayloadSelectorFactory.enable;
import static io.qdrant.client.ConditionFactory.matchKeyword;

/**
 * Quản lý Qdrant vector database: tạo collection, upsert, tìm kiếm, xóa
 */
@Service
public class QdrantService {

    private static final Logger logger = LoggerFactory.getLogger(QdrantService.class);

    private final QdrantProperties qdrantProperties;
    private QdrantClient client;

    public QdrantService(QdrantProperties qdrantProperties) {
        this.qdrantProperties = qdrantProperties;
    }

    @PostConstruct
    public void init() {
        try {
            client = new QdrantClient(
                    QdrantGrpcClient.newBuilder(
                            qdrantProperties.getHost(),
                            qdrantProperties.getPort(),
                            false // không dùng TLS
                    ).build());
            logger.info("Đã kết nối Qdrant tại {}:{}", qdrantProperties.getHost(), qdrantProperties.getPort());
            khoiTaoCollection();
        } catch (Exception e) {
            logger.warn("Không thể kết nối Qdrant: {}. Chatbot sẽ dùng fallback keyword search.", e.getMessage());
        }
    }

    @PreDestroy
    public void destroy() {
        if (client != null) {
            try {
                client.close();
            } catch (Exception e) {
                logger.warn("Lỗi đóng Qdrant client: {}", e.getMessage());
            }
        }
    }

    /**
     * Kiểm tra Qdrant có sẵn sàng không
     */
    public boolean isAvailable() {
        if (client == null)
            return false;
        try {
            client.listCollectionsAsync().get();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Tạo collection nếu chưa có
     */
    public void khoiTaoCollection() {
        if (client == null)
            return;
        try {
            boolean collectionExists = client.listCollectionsAsync().get()
                    .stream()
                    .anyMatch(c -> c.equals(qdrantProperties.getCollectionName()));

            if (!collectionExists) {
                client.createCollectionAsync(
                        qdrantProperties.getCollectionName(),
                        VectorParams.newBuilder()
                                .setDistance(Distance.Cosine)
                                .setSize(384) // dimension
                                .build())
                        .get();
                logger.info("Đã tạo collection '{}' trên Qdrant", qdrantProperties.getCollectionName());
            } else {
                logger.info("Collection '{}' đã tồn tại", qdrantProperties.getCollectionName());
            }
        } catch (Exception e) {
            logger.error("Lỗi khi khởi tạo collection Qdrant: ", e);
        }
    }

    /**
     * Thêm/cập nhật vector vào Qdrant
     */
    public void upsertVector(long pointId, List<Float> vector,
            Map<String, io.qdrant.client.grpc.JsonWithInt.Value> payload) {
        if (client == null)
            throw new RuntimeException("Qdrant chưa kết nối");

        try {
            PointStruct point = PointStruct.newBuilder()
                    .setId(id(pointId))
                    .setVectors(vectors(vector))
                    .putAllPayload(payload)
                    .build();

            client.upsertAsync(qdrantProperties.getCollectionName(), List.of(point)).get();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Lỗi upsert vector ID {}: ", pointId, e);
            throw new RuntimeException("Lỗi upsert vector: " + e.getMessage(), e);
        }
    }

    /**
     * Tìm kiếm vector tương tự
     */
    public List<ScoredPoint> timKiem(List<Float> queryVector, int topK) {
        if (client == null)
            throw new RuntimeException("Qdrant chưa kết nối");

        try {
            return client.searchAsync(
                    SearchPoints.newBuilder()
                            .setCollectionName(qdrantProperties.getCollectionName())
                            .addAllVector(queryVector)
                            .setLimit(topK)
                            .setWithPayload(enable(true))
                            .setScoreThreshold(0.01f) // Chỉ lấy kết quả có độ tương tự >= 0.1
                            .build())
                    .get();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Lỗi tìm kiếm vector Qdrant: ", e);
            throw new RuntimeException("Lỗi tìm kiếm: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa toàn bộ collection rồi tạo lại
     */
    public void xoaVaTaoLaiCollection() {
        if (client == null)
            throw new RuntimeException("Qdrant chưa kết nối");

        try {
            client.deleteCollectionAsync(qdrantProperties.getCollectionName()).get();
            logger.info("Đã xóa collection '{}'", qdrantProperties.getCollectionName());
            khoiTaoCollection();
        } catch (Exception e) {
            logger.error("Lỗi xóa collection: ", e);
            // Nếu collection không tồn tại => tạo mới
            khoiTaoCollection();
        }
    }

    /**
     * Xóa các point theo filter (dùng để xóa tài liệu theo tên file)
     */
    public void xoaTheoFilter(String key, String value) {
        if (client == null)
            throw new RuntimeException("Qdrant chưa kết nối");

        try {
            client.deleteAsync(
                    qdrantProperties.getCollectionName(),
                    Filter.newBuilder()
                            .addMust(matchKeyword(key, value))
                            .build())
                    .get();
            logger.info("Đã xóa các point với {}={}", key, value);
        } catch (Exception e) {
            logger.error("Lỗi xóa point theo filter: ", e);
            throw new RuntimeException("Lỗi xóa: " + e.getMessage(), e);
        }
    }

    /**
     * Đếm số lượng point trong collection
     */
    public long demSoLuong() {
        if (client == null)
            return 0;

        try {
            return client.countAsync(qdrantProperties.getCollectionName()).get();
        } catch (Exception e) {
            logger.error("Lỗi đếm point Qdrant: ", e);
            return 0;
        }
    }

    /**
     * Lấy tất cả các giá trị unique của một field trong payload
     */
    public List<String> layDanhSachGiaTriUnique(String fieldName) {
        if (client == null)
            return List.of();

        try {
            // Scroll tất cả point và lấy unique values
            List<String> uniqueValues = new ArrayList<>();
            ScrollPoints.Builder scrollBuilder = ScrollPoints.newBuilder()
                    .setCollectionName(qdrantProperties.getCollectionName())
                    .setLimit(1000)
                    .setWithPayload(enable(true));

            // Filter chỉ lấy tài liệu (loai = "tai_lieu")
            scrollBuilder.setFilter(
                    Filter.newBuilder()
                            .addMust(matchKeyword("loai", "tai_lieu"))
                            .build());

            List<RetrievedPoint> points = client.scrollAsync(scrollBuilder.build()).get().getResultList();

            Set<String> seen = new HashSet<>();
            for (RetrievedPoint point : points) {
                io.qdrant.client.grpc.JsonWithInt.Value val = point.getPayloadMap().get(fieldName);
                if (val != null && val.hasStringValue()) {
                    String s = val.getStringValue();
                    if (seen.add(s)) {
                        uniqueValues.add(s);
                    }
                }
            }
            return uniqueValues;
        } catch (Exception e) {
            logger.error("Lỗi lấy danh sách unique values: ", e);
            return List.of();
        }
    }
}
