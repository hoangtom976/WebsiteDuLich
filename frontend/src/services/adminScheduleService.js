import api from "@/lib/api";

const normalizeSchedule = (item = {}) => ({
  id: item.id,
  ngayKhoiHanh: item.ngay_khoi_hanh || item.ngayKhoiHanh || "",
  tongSoCho: Number(item.tong_so_cho ?? item.tongSoCho ?? 0),
  soChoConLai: Number(item.so_cho_con_lai ?? item.soChoConLai ?? 0),
  tourId: item.tour_id ?? item.tourId ?? null,
  tenTour: item.ten_tour || item.tenTour || "",
});

export const getAdminSchedulesByTour = async (tourId) => {
  const response = await api.get(`/lich-khoi-hanh/tour/${tourId}`);
  return Array.isArray(response.data) ? response.data.map(normalizeSchedule) : [];
};

export const createAdminSchedule = async (payload) => {
  const response = await api.post("/lich-khoi-hanh", payload);
  return normalizeSchedule(response.data);
};

export const updateAdminScheduleSeats = async (scheduleId, tongSoCho) => {
  const response = await api.patch(`/lich-khoi-hanh/${scheduleId}/so-cho`, { tongSoCho });
  return normalizeSchedule(response.data);
};

export const updateAdminScheduleDate = async (scheduleId, ngayKhoiHanh) => {
  const response = await api.patch(`/lich-khoi-hanh/${scheduleId}/ngay-khoi-hanh`, { ngayKhoiHanh });
  return normalizeSchedule(response.data);
};

export const deleteAdminSchedule = async (scheduleId) => {
  await api.delete(`/lich-khoi-hanh/${scheduleId}`);
};
