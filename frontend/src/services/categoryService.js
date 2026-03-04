import api from "@/lib/api";
import { mockCategories } from "@/lib/mock-data";

export const getAllCategories = async () => {
  // try {
  //   // API này không cần xác thực
  //   const response = await api.get("/danh-muc");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch categories:", error);
  //   return []; // Trả về mảng rỗng nếu có lỗi
  // }
  return mockCategories; // Sử dụng dữ liệu giả
};
