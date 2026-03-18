# 🌏 Hệ Thống Đặt Tour Du Lịch & Hỗ Trợ Khách Hàng Với AI (RAG Chatbot)

> **Báo cáo đồ án nội bộ / Hướng dẫn dự án chuyên sâu**
> 
> Một nền tảng đặt tour hiện đại tích hợp trí tuệ nhân tạo, tối ưu hóa trải nghiệm người dùng từ tìm kiếm, đặt chỗ đến thanh toán trực tuyến.

---

## 📖 Giới Thiệu Dự Án

Dự án **WebsiteDuLich** là hệ thống quản lý và đặt tour trực tuyến toàn diện, được thiết kế để giải quyết nhu cầu du lịch ngày càng tăng cao. Hệ thống không chỉ cung cấp các tính năng truyền thống mà còn tích hợp **AI Chatbot dựa trên kiến trúc RAG (Retrieval-Augmented Generation)** để tư vấn lộ trình và giải đáp thắc mắc của khách hàng một cách thông minh và chính xác dựa trên dữ liệu thực tế của hệ thống.

---

## ✨ Tính Năng Nổi Bật

### 🧑‍💻 Dành Cho Khách Hàng
- **Tìm kiếm thông minh**: Tìm kiếm tour theo địa điểm, danh mục, giá cả và thời gian khởi hành.
- **Hệ thống đặt tour**: Quy trình đặt tour tinh gọn, hỗ trợ chọn lịch khởi hành, số lượng khách và quản lý thông tin hành khách.
- **Thanh toán trực tuyến**: Tích hợp cổng thanh toán **VNPAY** an toàn, nhanh chóng.
- **AI Tư vấn viên (RAG Chatbot)**: Chatbot thông minh hỗ trợ tìm kiếm tour thông qua ngôn ngữ tự nhiên, tư vấn lịch trình chi tiết và giải đáp các câu hỏi dựa trên kho dữ liệu tour có sẵn.
- **Quản lý tài khoản**: Theo dõi lịch sử đơn hàng, quản lý danh sách yêu thích và nhận thông báo cá nhân hóa.
- **Tiện ích giá trị gia tăng**: Xem thông tin thời tiết thời gian thực tại điểm đến, lấy mã giảm giá (Voucher), và đánh giá tour sau chuyến đi.

### 🛡️ Dành Cho Quản Trị Viên (Admin)
- **Bảng điều khiển (Dashboard)**: Thống kê doanh thu, số lượng đơn hàng và người dùng mới thông qua các biểu đồ trực quan.
- **Quản lý nội dung**: Quản lý kho tour, bài viết blog, danh mục và địa điểm.
- **Quản lý kinh doanh**: Cấu hình Flash Sale, quản lý Voucher và duyệt lịch khởi hành.
- **Chăm sóc khách hàng**: Quản lý đánh giá và giám sát tương tác của Chatbot.
- **Xuất báo cáo**: Hỗ trợ xuất dữ liệu tour và đơn hàng ra định dạng Excel (Apache POI).

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Java 21 & Spring Boot 3.2.3
- **Database**: MySQL 8.0 (Relational Data) & **Qdrant** (Vector Database cho AI)
- **Security**: Spring Security & JSON Web Token (JWT)
- **AI Stack**: Groq API (Llama 3.3 70B), HuggingFace (Embedding Model), RAG Architecture
- **Infrastucture**: Cloudinary (Lưu trữ hình ảnh), Spring Mail (Hệ thống thông báo), Apache POI (Xử lý Excel)

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4 & Shadcn UI
- **State Management**: React Hook Form & Axios
- **Data Visualization**: Recharts
- **Components**: Lucide Icons, Sonner (Toasts), Swiper (Carousel)

---

## 📐 Kiến Trúc RAG Chatbot

Hệ thống sử dụng mô hình **Retrieval-Augmented Generation (RAG)** để đảm bảo chatbot không bị "ảo giác" (hallucination):
1. **Embedding**: Dữ liệu tour được chuyển đổi sang dạng Vector thông qua model của HuggingFace.
2. **Storage**: Vector được lưu trữ tại Qdrant Vector DB.
3. **Retrieval**: Khi người dùng hỏi, hệ thống thực hiện **Hybrid Search** (kết hợp tương đồng vector và keyword) để tìm ra tour phù hợp nhất.
4. **Augmentation**: Dữ liệu tour tìm được được đưa vào context để Groq (LLM) biên soạn câu trả lời cuối cùng cho khách hàng.

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

### 1. Yêu Cầu Hệ Thống
- **Java**: JDK 21 trở lên.
- **Node.js**: Phiên bản 18.x hoặc 20.x (khuyên dùng).
- **Cơ sở dữ liệu**: MySQL 8 và Docker (để chạy Qdrant).
- **Cổng mặc định**: 
  - Backend: `8081`
  - Frontend: `3000`
  - Qdrant: `6333`, `6334`

### 2. Thiết Lập Cơ Sở Dữ Liệu
1. Tạo một database mới trong MySQL:
   ```sql
   CREATE DATABASE dat_tour_du_lich CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Chạy Qdrant bằng Docker (nếu chưa có):
   ```bash
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```

### 3. Cấu Hình & Chạy Backend
1. Di chuyển vào thư mục backend: `cd backend`
2. Cập nhật các thông tin trong `src/main/resources/application.properties`:
   - MySQL config (Username/Password)
   - API Keys (Groq, HuggingFace, OpenWeatherMap, Cloudinary)
3. Chạy ứng dụng:
   ```bash
   mvn spring-boot:run
   ```

### 4. Cấu Hình & Chạy Frontend
1. Di chuyển vào thư mục frontend: `cd frontend`
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy chế độ phát triển:
   ```bash
   npm run dev
   ```


## 📝 Thông Tin Liên Hệ

- **Sinh viên thực hiện**: Nguyễn Vy Khang
- **Mã số sinh viên**: 220825
- **Email**: hoangtom976@gmail.com
- **Lớp**: DH22KPM01

---

*Dự án này được phát triển với mục đích học tập và nghiên cứu công nghệ mới.*
