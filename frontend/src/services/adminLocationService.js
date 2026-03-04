import api from "@/lib/api";

const normalizeLocation = (item = {}) => ({
  id: item.id,
  tenDiaDiem: item.ten_dia_diem || item.tenDiaDiem || "",
  moTa: item.mo_ta || item.moTa || "",
});

export const getAdminLocations = async () => {
  const response = await api.get("/dia-diem");
  return Array.isArray(response.data) ? response.data.map(normalizeLocation) : [];
};

export const createAdminLocation = async (payload) => {
  const response = await api.post("/dia-diem", payload);
  return normalizeLocation(response.data);
};

export const updateAdminLocation = async (id, payload) => {
  const response = await api.put(`/dia-diem/${id}`, payload);
  return normalizeLocation(response.data);
};

export const deleteAdminLocation = async (id) => {
  await api.delete(`/dia-diem/${id}`);
};
