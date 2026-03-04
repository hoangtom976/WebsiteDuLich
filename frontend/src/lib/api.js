import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Thêm một interceptor để tự động gắn token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
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
