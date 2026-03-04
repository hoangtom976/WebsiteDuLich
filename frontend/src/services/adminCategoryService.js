import api from "@/lib/api";

const normalizeCategory = (item = {}) => ({
  id: item.id,
  tenDanhMuc: item.ten_danh_muc || item.tenDanhMuc || "",
  moTa: item.mo_ta || item.moTa || "",
});

export const getAdminCategories = async () => {
  const response = await api.get("/danh-muc");
  return Array.isArray(response.data) ? response.data.map(normalizeCategory) : [];
};

export const createAdminCategory = async (payload) => {
  const response = await api.post("/danh-muc", payload);
  return normalizeCategory(response.data);
};

export const updateAdminCategory = async (id, payload) => {
  const response = await api.put(`/danh-muc/${id}`, payload);
  return normalizeCategory(response.data);
};

export const deleteAdminCategory = async (id) => {
  await api.delete(`/danh-muc/${id}`);
};
