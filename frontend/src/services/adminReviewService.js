import api from "@/lib/api";

const normalizeReview = (item = {}) => ({
  id: item.id,
  tenNguoiDung: item.ten_nguoi_dung || item.tenNguoiDung || "Người dùng",
  avatarNguoiDung: item.avatar_nguoi_dung || item.avatarNguoiDung || "",
  soSao: Number(item.so_sao ?? item.soSao ?? 0),
  binhLuan: item.binh_luan || item.binhLuan || "",
  ngayDanhGia: item.ngay_danh_gia || item.ngayDanhGia || "",
  noiDungPhanHoi: item.noi_dung_phan_hoi || item.noiDungPhanHoi || "",
  tenNhanVienPhanHoi: item.ten_nhan_vien_phan_hoi || item.tenNhanVienPhanHoi || "",
  ngayPhanHoi: item.ngay_phan_hoi || item.ngayPhanHoi || "",
});

export const getAdminReviewsByTour = async (tourId) => {
  const response = await api.get(`/danh-gia/tour/${tourId}`);
  return Array.isArray(response.data) ? response.data.map(normalizeReview) : [];
};

export const getAllAdminReviews = async () => {
  const response = await api.get("/danh-gia/tat-ca");
  return Array.isArray(response.data) ? response.data.map(normalizeReview) : [];
};

export const replyAdminReview = async ({ danhGiaId, noiDung }) => {
  const response = await api.post("/danh-gia/phan-hoi", {
    danhGiaId,
    noiDung,
  });
  return response.data;
};
