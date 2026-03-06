import { mockVouchers } from "@/lib/mock-data";
import api from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

export const getAllVouchers = async () => {
  try {
    if (typeof window === "undefined") {
      const resp = await fetch(`${API_BASE_URL}/voucher`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!resp.ok) {
        console.error("Lỗi khi fetch voucher server-side:", resp.status);
        return [];
      }
      return resp.json();
    }
    const response = await api.get('/voucher');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách voucher:", error?.message || error);
    return [];
  }
};

export const checkVoucher = async (maVoucher) => {
  const response = await api.get(`/voucher/kiem-tra/${encodeURIComponent(maVoucher)}`);
  return response.data;
};
