# Cập nhật Dọn dẹp Backend
Ngày thực hiện: 10/02/2026

Đã thực hiện các công việc dọn dẹp sau để tối ưu hóa dự án:

1. **Xóa các file rác và tài liệu tạm**:
   - `models.json`, `models_list.txt` (Dữ liệu tạm từ quá trình nghiên cứu AI).
   - `FIX_CHATBOT_ERRORS.md`, `README_POSTMAN_TEST.md`, etc. (Đã xóa trước đó).

2. **Làm sạch Code**:
   - Xóa `GeminiApiService.java`: Không còn sử dụng (đã chuyển sang dùng Groq AI).
   - Xóa cấu hình Gemini trong `application.properties`.

3. **Làm sạch `application.properties`**:
   - Loại bỏ hoàn toàn các placeholder không sử dụng (`gemini.api.key`, `gemini.api.model`).

Dự án hiện tại đã được tối ưu, chỉ chứa các Service và Controller cần thiết cho hoạt động thực tế.
