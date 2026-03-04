import { mockFlashDeal, mockVouchers } from "@/lib/mock-data";

/**
 * Lấy thông tin về chương trình Flash Deal hiện tại.
 */
export const getFlashDeal = async () => {
  // Giả lập gọi API
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockFlashDeal), 300);
  });
};

/**
 * Lấy danh sách tất cả các voucher hợp lệ.
 */
export const getVouchers = async () => {
  // Giả lập gọi API
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVouchers.filter((v) => v.trangThai)), 500);
  });
};
