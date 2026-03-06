import api from "@/lib/api";

const normalizeTour = (item = {}) => ({
  id: item.id,
  tenTour: item.ten_tour || item.tenTour || "",
  moTa: item.mo_ta || item.moTa || "",
  gia: Number(item.gia ?? 0),
  soNgay: Number(item.so_ngay ?? item.soNgay ?? 0),
  trangThai: typeof item.trang_thai === "boolean" ? item.trang_thai : item.trangThai !== false,
  danhMucId: item.danh_muc_id ?? item.danhMucId ?? null,
  diaDiemId: item.dia_diem_id ?? item.diaDiemId ?? null,
  tenDanhMuc: item.ten_danh_muc || item.tenDanhMuc || "",
  tenDiaDiem: item.ten_dia_diem || item.tenDiaDiem || "",
  lichTrinhs: item.lichTrinhs || item.lich_trinhs || [],
});

export const getAdminTours = async () => {
  const response = await api.get("/tour");
  return Array.isArray(response.data) ? response.data.map(normalizeTour) : [];
};

export const createAdminTour = async (payload) => {
  const response = await api.post("/tour", payload);
  return normalizeTour(response.data);
};

export const updateAdminTour = async (id, payload) => {
  const response = await api.put(`/tour/${id}`, payload);
  return normalizeTour(response.data);
};

export const deleteAdminTour = async (id) => {
  await api.delete(`/tour/${id}`);
};
