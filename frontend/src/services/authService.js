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

export const register = async (userData) => {
  // try {
  //   const response = await api.post("/auth/dang-ky", userData);
  //   return response.data; // Should be "Đăng ký tài khoản thành công!"
  // } catch (error) {
  //   throw error.response.data || new Error("Đã có lỗi xảy ra khi đăng ký.");
  // }
  console.log("Mock register with:", userData);
  return "Đăng ký tài khoản thành công!";
};

export const forgotPassword = async (email) => {
  // try {
  //   const response = await api.post("/auth/quen-mat-khau", { email });
  //   return response.data; // Should be "Yêu cầu... Token (để test): <token>"
  // } catch (error) {
  //   throw error.response.data || new Error("Đã có lỗi xảy ra.");
  // }
  console.log("Mock forgot password for:", email);
  // Giả lập token trả về
  return "Yêu cầu reset mật khẩu thành công. Token (để test): mock-reset-token-12345";
};

export const resetPassword = async (token, matKhauMoi) => {
  // try {
  //   const response = await api.post("/auth/dat-lai-mat-khau", { token, matKhauMoi });
  //   return response.data; // Should be "Mật khẩu đã được đặt lại thành công!"
  // } catch (error) {
  //   throw error.response.data || new Error("Đã có lỗi xảy ra.");
  // }
  console.log("Mock reset password with token:", token);
  return "Mật khẩu đã được đặt lại thành công!";
};
