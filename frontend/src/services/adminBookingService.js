import api from "@/lib/api";

const STATUS_LABELS = {
  CHO_THANH_TOAN: "Chờ thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
  DA_XAC_NHAN: "Đã xác nhận",
  DA_HUY: "Đã hủy",
};

const normalizeBooking = (item = {}) => ({
  id: item.id,
  nguoiDungId: item.nguoi_dung_id ?? item.nguoiDungId ?? null,
  hoTenNguoiDat: item.ho_ten_nguoi_dat || item.hoTenNguoiDat || "",
  emailNguoiDat: item.email_nguoi_dat || item.emailNguoiDat || "",
  soDienThoaiNguoiDat: item.so_dien_thoai_nguoi_dat || item.soDienThoaiNguoiDat || "",
  tourId: item.tour_id ?? item.tourId ?? null,
  tenTour: item.ten_tour || item.tenTour || "",
  lichKhoiHanhId: item.lich_khoi_hanh_id ?? item.lichKhoiHanhId ?? null,
  ngayKhoiHanh: item.ngay_khoi_hanh || item.ngayKhoiHanh || "",
  ngayDat: item.ngay_dat || item.ngayDat || "",
  soLuongKhach: Number(item.so_luong_khach ?? item.soLuongKhach ?? 0),
  tongTien: Number(item.tong_tien ?? item.tongTien ?? 0),
  trangThai: item.trang_thai || item.trangThai || "CHO_THANH_TOAN",
});

export const getBookingStatusLabel = (status) => STATUS_LABELS[status] || status || "";

export const getAdminBookings = async ({ tuKhoa, trangThai } = {}) => {
  const response = await api.get("/dat-tour/quan-ly", {
    params: {
      ...(tuKhoa ? { tuKhoa } : {}),
      ...(trangThai ? { trangThai } : {}),
    },
  });
  return Array.isArray(response.data) ? response.data.map(normalizeBooking) : [];
};

export const confirmAdminBookingPayment = async (bookingId) => {
  const response = await api.put(`/dat-tour/xac-nhan-thanh-toan/${bookingId}`);
  return response.data;
};

export const approveAdminBooking = async (bookingId) => {
  const response = await api.put(`/dat-tour/duyet/${bookingId}`, {
    trangThai: "DA_XAC_NHAN",
  });
  return response.data;
};

export const cancelAdminBooking = async (bookingId) => {
  const response = await api.put(`/dat-tour/duyet/${bookingId}`, {
    trangThai: "DA_HUY",
  });
  return response.data;
};

export const exportAdminBookingPassengers = async (lichKhoiHanhId) => {
  const response = await api.get(`/dat-tour/xuat-excel/${lichKhoiHanhId}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `danh_sach_khach_lich_${lichKhoiHanhId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
