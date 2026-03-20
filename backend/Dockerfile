# Sử dụng ảnh Maven với Java 21 để build mã nguồn (Dự án bạn đang dùng Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file cấu hình maven và mã nguồn
COPY pom.xml .
COPY src ./src

# Build project (bỏ qua bước chạy test để tiết kiệm thời gian)
RUN mvn clean package -DskipTests

# Sử dụng ảnh Java 21 JRE siêu nhẹ để chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file .jar đã build từ bước trên
COPY --from=build /app/target/*.jar app.jar

# Backend của bạn đang chạy ở cổng 8081 theo file application.properties
EXPOSE 8081

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
