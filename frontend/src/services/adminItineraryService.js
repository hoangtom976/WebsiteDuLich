import api from "@/lib/api";

const normalizeItinerary = (item = {}) => ({
  id: item.id,
  ngayThu: Number(item.ngay_thu ?? item.ngayThu ?? 0),
  tieuDe: item.tieu_de || item.tieuDe || "",
  moTa: item.mo_ta || item.moTa || "",
  tourId: item.tour_id ?? item.tourId ?? null,
});

export const getAdminItinerariesByTour = async (tourId) => {
  const response = await api.get(`/lich-trinh/tour/${tourId}`);
  return Array.isArray(response.data) ? response.data.map(normalizeItinerary) : [];
};

export const createAdminItinerary = async (payload) => {
  const response = await api.post("/lich-trinh", payload);
  return normalizeItinerary(response.data);
};

export const updateAdminItinerary = async (id, payload) => {
  const response = await api.put(`/lich-trinh/${id}`, payload);
  return normalizeItinerary(response.data);
};

export const deleteAdminItinerary = async (id) => {
  await api.delete(`/lich-trinh/${id}`);
};
