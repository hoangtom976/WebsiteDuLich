import api from "@/lib/api";

const normalizeVoucher = (v = {}) => ({
  id: v.id,
  maVoucher: v.ma_voucher || v.maVoucher || "",
  phanTramGiam: Number(v.phan_tram_giam ?? v.phanTramGiam ?? 0),
  ngayHetHan: v.ngay_het_han || v.ngayHetHan || "",
  trangThai: typeof v.trang_thai === "boolean" ? v.trang_thai : v.trangThai !== false,
});

export const getAdminVouchers = async () => {
  const response = await api.get("/voucher");
  return Array.isArray(response.data) ? response.data.map(normalizeVoucher) : [];
};

export const createAdminVoucher = async (payload) => {
  const response = await api.post("/voucher", payload);
  return normalizeVoucher(response.data);
};

export const updateAdminVoucher = async (id, payload) => {
  const response = await api.put(`/voucher/${id}`, payload);
  return normalizeVoucher(response.data);
};

export const deleteAdminVoucher = async (id) => {
  await api.delete(`/voucher/${id}`);
};
