import api from "@/lib/api";

/**
 * Đặt tour - POST /api/dat-tour
 * Requires authentication (accessToken in localStorage)
 *
 * @param {Object} payload
 * @param {number} payload.lichKhoiHanhId - ID lịch khởi hành
 * @param {Array<{tenKhach: string, soDienThoai: string}>} payload.danhSachKhach - Danh sách khách
 * @param {string} [payload.maVoucher] - Mã voucher (tuỳ chọn)
 * @returns {Promise<Object>} Đơn đặt tour đã tạo
 */
export const datTour = async (payload) => {
    const response = await api.post("/dat-tour", payload);
    return response.data;
};

/**
 * Lấy lịch sử đặt tour của người dùng hiện tại - GET /api/dat-tour/lich-su
 * @returns {Promise<Array>}
 */
export const layLichSuDatTour = async () => {
    const response = await api.get("/dat-tour/lich-su");
    return response.data;
};

/**
 * Hủy đơn đặt tour - PUT /api/dat-tour/huy/{id}
 * @param {number} id - ID đơn đặt tour
 * @returns {Promise<string>}
 */
export const huyDonDatTour = async (id) => {
    const response = await api.put(`/dat-tour/huy/${id}`);
    return response.data;
};

/**
 * Gọi API để tạo URL thanh toán VNPay
 * @param {Object} payload 
 * @param {number} payload.soTien
 * @param {string} payload.noiDung
 * @param {string} payload.maDonHang
 * @returns {Promise<string>} VNPay URL
 */
export const taoThanhToanVnPay = async (payload) => {
    const response = await api.post("/thanh-toan/tao-url", payload);
    return response.data; // Url is returned as string
};

/**
 * Lấy chi tiết đơn đặt tour - GET /api/dat-tour/{id}
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export const layChiTietDonHang = async (id) => {
    const response = await api.get(`/dat-tour/${id}`);
    return response.data;
};
