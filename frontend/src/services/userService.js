import api from "@/lib/api";

const normalizeProfile = (data = {}) => ({
  id: data.id,
  email: data.email || "",
  hoTen: data.ho_ten || data.hoTen || "",
  soDienThoai: data.so_dien_thoai || data.soDienThoai || "",
  trangThai: typeof data.trang_thai === "boolean" ? data.trang_thai : data.trangThai,
  vaiTro: data.vai_tro || data.vaiTro || "",
  ngayTao: data.ngay_tao || data.ngayTao || null,
});

export const getCurrentUserProfile = async () => {
  const response = await api.get("/nguoi-dung/thong-tin");
  return normalizeProfile(response.data);
};

export const updateCurrentUserProfile = async (payload) => {
  const response = await api.put("/nguoi-dung/thong-tin", payload);
  return normalizeProfile(response.data);
};

export const changeCurrentUserPassword = async (payload) => {
  const response = await api.put("/nguoi-dung/doi-mat-khau", payload);
  return response.data;
};
