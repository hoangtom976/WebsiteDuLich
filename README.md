
# 🌏 Hệ Thống Đặt Tour Du Lịch & Hỗ Trợ Khách Hàng Với AI (RAG Chatbot)

> **Đồ án 2 — Nguyễn Vỹ Khang — MSSV: 220825**
> Đường link vào website: website-du-lich.vercel.app
> Một nền tảng đặt tour du lịch hiện đại tích hợp trí tuệ nhân tạo, tối ưu hóa trải nghiệm người dùng từ tìm kiếm, đặt chỗ đến thanh toán trực tuyến.

> 🚨 **LƯU Ý QUAN TRỌNG KHI MUỐN VÀO TRANG WEB:**
> - Máy chủ (Backend) của hệ thống đang được triển khai trên nền tảng **Render (Gói Miễn Phí)**.
> - Nếu trang web không có ai truy cập trong vòng 15 phút, máy chủ sẽ tự động chạy chế độ "Ngủ đông". 
> - Do đó, **ở lần truy cập đầu tiên, trang web có thể xoay RẤT LÂU (mất từ 2 - 3 phút) để khởi động lại máy chủ**. Kính mong thầy kiên nhẫn chờ đợi, KHÔNG ĐÓNG TAB trình duyệt. 
> - Nếu quá 3 phút trình duyệt văng lỗi 504 Timeout, chỉ cần bấm **Tải lại trang (F5)** là hệ thống sẽ tải bình thường, các thao tác sau đó sẽ báo thành công ngay lập tức với tốc độ cực nhanh mượt mà.

---

## 📑 Mục Lục

- [📖 Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
- [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [🛠️ Công Nghệ Sử Dụng](#️-công-nghệ-sử-dụng)
- [📐 Kiến Trúc RAG Chatbot](#-kiến-trúc-rag-chatbot)
- [📁 Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [🚀 Hướng Dẫn Cài Đặt (Localhost)](#-hướng-dẫn-cài-đặt-localhost)
- [☁️ Hướng Dẫn Triển Khai (Deploy)](#️-hướng-dẫn-triển-khai-deploy)
- [📊 Cổng Mặc Định](#-cổng-mặc-định)
- [🔑 Tài Khoản Dùng Thử](#-tài-khoản-dùng-thử)
- [📝 Thông Tin Liên Hệ](#-thông-tin-liên-hệ)

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
- **Quản lý Chatbot AI**: Đồng bộ dữ liệu tour vào Vector Database, upload tài liệu bổ sung (.txt) và giám sát lịch sử hội thoại.
- **Xuất báo cáo**: Hỗ trợ xuất dữ liệu tour và đơn hàng ra định dạng Excel (Apache POI).

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| **Backend Framework** | Java 21, Spring Boot 3.2.3 |
| **Frontend Framework** | Next.js 16 (React 19) |
| **Cơ sở dữ liệu** | MySQL 8.0 |
| **Vector Database** | Qdrant |
| **Bảo mật** | Spring Security, JSON Web Token (JWT) |
| **AI / LLM** | Groq API (Llama 3.3 70B) |
| **Embedding Model** | HuggingFace (`paraphrase-multilingual-MiniLM-L12-v2`) |
| **Thanh toán** | VNPAY |
| **Lưu trữ hình ảnh** | Cloudinary |
| **Gửi Email** | Spring Mail (Gmail SMTP) |
| **Thời tiết** | OpenWeatherMap API |
| **Giao diện** | Tailwind CSS 4, Shadcn UI, Recharts, Lucide Icons |
| **Xuất Excel** | Apache POI |

---

## 📐 Kiến Trúc RAG Chatbot

Hệ thống sử dụng mô hình **Retrieval-Augmented Generation (RAG)** để đảm bảo chatbot không bị "ảo giác" (hallucination):

```
Người dùng đặt câu hỏi
        │
        ▼
┌─────────────────────┐
│  HuggingFace API    │ ──► Chuyển câu hỏi thành Vector
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Qdrant Vector DB   │ ──► Tìm kiếm tour tương đồng (Hybrid Search)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Groq LLM API       │ ──► Biên soạn câu trả lời dựa trên dữ liệu tour thực tế
└─────────────────────┘
        │
        ▼
  Trả lời khách hàng
```

1. **Embedding**: Dữ liệu tour được chuyển đổi sang dạng Vector 384 chiều thông qua model `paraphrase-multilingual-MiniLM-L12-v2` của HuggingFace.
2. **Storage**: Vector được lưu trữ tại Qdrant Vector DB.
3. **Retrieval**: Khi người dùng hỏi, hệ thống thực hiện **Hybrid Search** (kết hợp tương đồng vector và keyword matching) để tìm ra tour phù hợp nhất.
4. **Augmentation**: Dữ liệu tour tìm được được đưa vào context để Groq (LLM Llama 3.3 70B) biên soạn câu trả lời cuối cùng cho khách hàng.

---

## 📁 Cấu Trúc Thư Mục

```
WebsiteDuLich/
├── backend/                        # Spring Boot Backend
│   ├── src/main/java/com/dulich/backend/
│   │   ├── config/                 # Cấu hình (CORS, Security, Cloudinary, VNPAY...)
│   │   ├── controller/             # REST API Controllers
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── entity/                 # JPA Entities
│   │   ├── repository/             # Spring Data Repositories
│   │   ├── service/                # Business Logic & AI Services
│   │   └── util/                   # Tiện ích (Xử lý tiếng Việt, ...)
│   ├── src/main/resources/
│   │   └── application.properties  # Cấu hình ứng dụng
│   ├── Dockerfile                  # Docker build cho Backend
│   └── pom.xml                     # Maven dependencies
│
├── frontend/                       # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # App Router Pages
│   │   ├── components/             # React Components
│   │   ├── lib/                    # API Client (Axios)
│   │   └── services/               # Service Layers
│   ├── package.json
│   └── next.config.mjs
│
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt (Localhost)

### 1. Yêu Cầu Hệ Thống
- **Java**: JDK 21 trở lên
- **Node.js**: Phiên bản 18.x hoặc 20.x
- **MySQL**: Phiên bản 8.0
- **Docker**: Để chạy Qdrant Vector Database
- **Maven**: Để build Backend

### 2. Thiết Lập Cơ Sở Dữ Liệu

Tạo database MySQL:
```sql
CREATE DATABASE dat_tour_du_lich CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chạy Qdrant bằng Docker:
```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

### 3. Cấu Hình & Chạy Backend

```bash
cd backend
```

Cập nhật thông tin trong `src/main/resources/application.properties`:
- Tài khoản MySQL (`spring.datasource.username`, `spring.datasource.password`)
- API Keys: Groq, HuggingFace, OpenWeatherMap
- Cấu hình Cloudinary (lưu trữ hình ảnh)

Chạy ứng dụng:
```bash
mvn spring-boot:run
```
Backend sẽ khởi chạy tại: `http://localhost:8081`

### 4. Cấu Hình & Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ khởi chạy tại: `http://localhost:3000`

### 5. Đồng Bộ Dữ Liệu AI

Sau khi Backend và Qdrant đã chạy, truy cập trang **Dashboard Admin → Chatbot AI → Đồng bộ Tour** để nạp dữ liệu tour vào Vector Database cho Chatbot hoạt động.

---

## ☁️ Hướng Dẫn Triển Khai (Deploy)

### Nền tảng triển khai

| Thành phần | Nền tảng | Mô tả |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Hosting Next.js, tự động deploy từ GitHub |
| **Backend** | [Render](https://render.com) | Docker-based Web Service cho Spring Boot |
| **MySQL** | [Aiven](https://aiven.io) | Managed MySQL trên Cloud |
| **Vector DB** | [Qdrant Cloud](https://cloud.qdrant.io) | Managed Qdrant cho AI Chatbot |

### Biến Môi Trường trên Render (Backend)

| Biến | Mô tả |
|---|---|
| `SERVER_PORT` | Cổng chạy ứng dụng (mặc định: `8080`) |
| `SPRING_DATASOURCE_URL` | JDBC URL kết nối MySQL Aiven |
| `SPRING_DATASOURCE_USERNAME` | Tài khoản MySQL |
| `SPRING_DATASOURCE_PASSWORD` | Mật khẩu MySQL |
| `QDRANT_HOST` | Hostname của Qdrant Cloud (không có `https://`) |
| `QDRANT_PORT` | Cổng gRPC Qdrant Cloud (`6334`) |
| `QDRANT_API_KEY` | API Key của Qdrant Cloud |
| `HUGGINGFACE_API_TOKEN` | Access Token của HuggingFace |

### Biến Môi Trường trên Vercel (Frontend)

| Biến | Mô tả |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL API Backend trên Render (ví dụ: `https://xxx.onrender.com/api`) |

---

## 📊 Cổng Mặc Định

| Dịch vụ | Cổng |
|---|---|
| Backend (Spring Boot) | `8081` (localhost) / `8080` (Render) |
| Frontend (Next.js) | `3000` (localhost) |
| Qdrant REST API | `6333` |
| Qdrant gRPC | `6334` |
| MySQL | `3306` (localhost) |

---

## 🔑 Tài Khoản Dùng Thử

| Vai trò | Tên hiển thị | Email | Mật khẩu |
|---|---|---|---|
| **Quản trị viên (Admin)** | admintest | `admin@example.com` | `123456` |
| **Khách hàng** | Nguyễn Vỹ Khang | `hoangtom976@gmail.com` | `654321` |

> **Lưu ý**: Tài khoản Admin có quyền truy cập toàn bộ Dashboard quản trị bao gồm: Quản lý Tour, Đơn hàng, Chatbot AI, Flash Sale, Voucher, Blog và Hệ thống người dùng.

---

## 📝 Thông Tin Liên Hệ

| Thông tin | Chi tiết |
|---|---|
| **Sinh viên thực hiện** | Nguyễn Vỹ Khang |
| **Mã số sinh viên** | 220825 |
| **Email** | hoangtom976@gmail.com |
| **Lớp** | DH22KPM01 |

---

*Dự án này được phát triển với mục đích học tập và nghiên cứu công nghệ mới trong khuôn khổ Đồ án 2.*
