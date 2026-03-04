import api from "@/lib/api";

const roleToShort = (role = "") => {
  const text = String(role).toUpperCase();
  if (text.endsWith("ADMIN")) return "ADMIN";
  if (text.endsWith("STAFF")) return "STAFF";
  return "USER";
};

const normalizeUser = (u = {}) => ({
  id: u.id,
  hoTen: u.ho_ten || u.hoTen || "",
  email: u.email || "",
  soDienThoai: u.so_dien_thoai || u.soDienThoai || "",
  vaiTro: roleToShort(u.vai_tro || u.vaiTro || ""),
  trangThai: typeof u.trang_thai === "boolean" ? u.trang_thai : u.trangThai !== false,
  ngayTao: u.ngay_tao || u.ngayTao || null,
});

export const getAdminUsers = async (tuKhoa = "") => {
  const params = tuKhoa ? { tuKhoa } : undefined;
  try {
    const response = await api.get("/quan-tri/nguoi-dung", { params });
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
  } catch (error) {
    // Fallback cho backend cũ chưa có endpoint GET /api/quan-tri/nguoi-dung
    if (error?.response?.status === 404) {
      const response = await api.get("/quan-tri/nguoi-dung/khach-hang", { params });
      return Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
    }
    throw error;
  }
};

export const assignUserRole = async ({ email, tenVaiTro }) => {
  const response = await api.post("/quan-tri/nguoi-dung/phan-quyen", {
    email,
    tenVaiTro,
  });
  return response.data;
};

export const changeUserStatus = async ({ email, trangThai }) => {
  const response = await api.post("/quan-tri/nguoi-dung/thay-doi-trang-thai", {
    email,
    trangThai,
  });
  return response.data;
};

export const createAdminUser = async (payload) => {
  const response = await api.post("/quan-tri/nguoi-dung", payload);
  return normalizeUser(response.data);
};

export const updateAdminUser = async (id, payload) => {
  const response = await api.put(`/quan-tri/nguoi-dung/${id}`, payload);
  return normalizeUser(response.data);
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/quan-tri/nguoi-dung/${id}`);
  return response.data;
};
