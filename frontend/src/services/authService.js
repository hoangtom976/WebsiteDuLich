import api from "@/lib/api";

export const login = async (credentials) => {
  try {
    // credentials sẽ là { email, matKhau }
    const response = await api.post("/auth/dang-nhap", credentials);
    // API backend trả về { accessToken: "..." }
    return response.data;
  } catch (error) {
    // Ném lỗi để component có thể bắt và xử lý
    throw error.response.data || new Error("Đã có lỗi xảy ra");
  }
};

export const sendRegistrationOtp = async (email) => {
  try {
    const response = await api.post("/auth/gui-otp-dang-ky", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Đã có lỗi xảy ra khi gửi OTP.");
  }
};

export const verifyRegistrationOtp = async (otp, thongTinDangKy) => {
  try {
    const response = await api.post("/auth/xac-nhan-dang-ky", { otp, thongTinDangKy });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Đã có lỗi xảy ra khi xác thực đăng ký.");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/quen-mat-khau", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Đã có lỗi xảy ra.");
  }
};

export const resetPassword = async (token, matKhauMoi) => {
  try {
    const response = await api.post("/auth/dat-lai-mat-khau", { token, matKhauMoi });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Đã có lỗi xảy ra.");
  }
};
