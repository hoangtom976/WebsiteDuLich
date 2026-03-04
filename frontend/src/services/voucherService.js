import { mockVouchers } from "@/lib/mock-data";

export const getAllVouchers = async () => {
  // Trong tương lai, đây sẽ là nơi gọi API backend
  // try {
  //   const response = await api.get('/voucher');
  //   return response.data;
  // } catch (error) { ... }

  return mockVouchers.filter((v) => v.trangThai === true); // Chỉ hiển thị các voucher đang hoạt động
};
