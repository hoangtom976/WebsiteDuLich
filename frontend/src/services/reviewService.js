import { mockTours } from "@/lib/mock-data";

export const getReviewsByTourId = async (tourId) => {
  // Trong tương lai, đây sẽ là nơi gọi API backend
  // try {
  //   const response = await api.get(`/danh-gia/tour/${tourId}`);
  //   return response.data;
  // } catch (error) { ... }
  const tour = mockTours.find((t) => t.id === parseInt(tourId));
  return tour ? tour.danhGia || [] : [];
};
