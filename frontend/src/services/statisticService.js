import api from "@/lib/api";

const normalizeStats = (stats = {}) => ({
  tongTour: Number(stats.tong_tour ?? stats.tongTour ?? 0),
  tourDangHoatDong: Number(stats.tour_dang_hoat_dong ?? stats.tourDangHoatDong ?? 0),
  tongDanhMuc: Number(stats.tong_danh_muc ?? stats.tongDanhMuc ?? 0),
  tongDiaDiem: Number(stats.tong_dia_diem ?? stats.tongDiaDiem ?? 0),
  tongLichKhoiHanh: Number(stats.tong_lich_khoi_hanh ?? stats.tongLichKhoiHanh ?? 0),
  tongDonDatTour: Number(stats.tong_don_dat_tour ?? stats.tongDonDatTour ?? 0),
  tongBaiViet: Number(stats.tong_bai_viet ?? stats.tongBaiViet ?? 0),
  tongVoucher: Number(stats.tong_voucher ?? stats.tongVoucher ?? 0),
  voucherDangHoatDong: Number(stats.voucher_dang_hoat_dong ?? stats.voucherDangHoatDong ?? 0),
  tongNguoiDung: Number(stats.tong_nguoi_dung ?? stats.tongNguoiDung ?? 0),
  nguoiDungDangHoatDong: Number(stats.nguoi_dung_dang_hoat_dong ?? stats.nguoiDungDangHoatDong ?? 0),
});

export const getDashboardStatistics = async () => {
  const response = await api.get("/thong-ke/dashboard");
  return normalizeStats(response.data);
};

export const getRevenueStatistics = async (loai = "ngay") => {
  const response = await api.get("/thong-ke/doanh-thu", {
    params: { loai }
  });
  return response.data;
};
