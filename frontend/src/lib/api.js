import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api",
});

// Thêm một interceptor để tự động gắn token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
