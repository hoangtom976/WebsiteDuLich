import api from "@/lib/api";
import { getAllVouchers } from "./voucherService";
import { getPopularTours } from "./tourService";

const API_URL = "/flash-sales";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8081/api";

async function serverFetchJson(path) {
  const url = `${API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Server fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * Lấy thông tin về chương trình Flash Deal hiện tại từ backend.
 */
export const getFlashDeal = async () => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson(`${API_URL}/active`)
        : (await api.get(`${API_URL}/active`)).data;

    if (!data) {
      return null;
    }

    const deal = data;
    return {
      id: deal.id,
      tourId: deal.tourId,
      tenTour: deal.tenTour,
      moTa: `Ưu đãi Flash Sale cực sốc! Giảm ngay ${deal.phanTramGiam}% cho tour ${deal.tenTour}. Số lượng có hạn!`,
      giaGoc: deal.giaGoc,
      giaKhuyenMai: deal.giaKhuyenMai,
      phanTramGiam: deal.phanTramGiam,
      ngayKetThuc: deal.tgKetThuc,
      hinhAnh: deal.hinhAnh || "https://images.unsplash.com/photo-1599708149101-01748aeb896b?q=80&w=1920&auto=format&fit=crop",
      soLuong: deal.soLuong,
      daBan: deal.daBan
    };
  } catch (error) {
    console.error("Lỗi khi lấy Flash Deal từ server:", error);
    return null;
  }
};

/**
 * Lấy Flash Sale đang hoạt động cho một tour cụ thể.
 */
export const getActiveFlashSaleForTour = async (tourId) => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson(`${API_URL}/tour/${tourId}`)
        : (await api.get(`${API_URL}/tour/${tourId}`)).data;

    return data || null;
  } catch (error) {
    console.error(`Lỗi khi lấy Flash Sale cho tour ${tourId}:`, error);
    return null;
  }
};

/**
 * Các hàm quản lý Flash Sale cho Admin
 */
export const getAllFlashSales = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách Flash Sale:", error);
    return [];
  }
};

export const createFlashSale = async (data) => {
  const response = await api.post(API_URL, data);
  return response.data;
};

export const updateFlashSale = async (id, data) => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteFlashSale = async (id) => {
  await api.delete(`${API_URL}/${id}`);
};

/**
 * Lấy danh sách tất cả các voucher hợp lệ.
 */
export const getVouchers = async () => {
  try {
    const vouchers = await getAllVouchers();
    return vouchers.filter((v) => v.trangThai);
  } catch (error) {
    console.error("Lỗi khi tải voucher hợp lệ:", error);
    return [];
  }
};
