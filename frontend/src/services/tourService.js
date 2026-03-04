import api from "@/lib/api";
import { mockTours } from "@/lib/mock-data";

export const getPopularTours = async () => {
  // try {
  //   // API này không cần xác thực
  //   const response = await api.get("/tour/pho-bien");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch popular tours:", error);
  //   return []; // Trả về mảng rỗng nếu có lỗi
  // }
  return mockTours; // Sử dụng dữ liệu giả
};

export const getAllTours = async () => {
  // try {
  //   // Trong tương lai, đây sẽ là nơi gọi API lấy tất cả tour
  //   const response = await api.get("/tour");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch all tours:", error);
  //   return [];
  // }
  return mockTours; // Sử dụng dữ liệu giả
};

export const getTourById = async (id) => {
  // try {
  //   const response = await api.get(`/tour/${id}`);
  //   return response.data;
  // } catch (error) {
  //   console.error(`Failed to fetch tour with id ${id}:`, error);
  //   return null;
  // }
  return mockTours.find((tour) => tour.id === parseInt(id)) || null;
};

export const getFavoriteTours = async () => {
  // Trong tương lai, đây sẽ là nơi gọi API /api/yeu-thich
  // try {
  //   const response = await api.get("/yeu-thich");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch favorite tours:", error);
  //   return [];
  // }

  // Tạm thời dùng mock data, sẽ thay bằng API thật
  return new Promise((resolve) => {
    // Giả lập gọi API và trả về các tour có id là 2 và 3
    const favoriteTourIds = [2, 3];
    const favoriteTours = mockTours.filter((tour) =>
      favoriteTourIds.includes(tour.id),
    );
    setTimeout(() => resolve(favoriteTours), 500);
  });
};
