import api from "@/lib/api";

const normalizeBlog = (blog = {}) => ({
  id: blog.id,
  tieuDe: blog.tieu_de || blog.tieuDe || "",
  slug: blog.slug || "",
  anhBia: blog.anh_bia || blog.anhBia || "",
  noiDung: blog.noi_dung || blog.noiDung || "",
  trangThai: blog.trang_thai || blog.trangThai || "BAN_NHAP",
  luotXem: Number(blog.luot_xem ?? blog.luotXem ?? 0),
  ngayTao: blog.ngay_tao || blog.ngayTao || "",
  tenTacGia: blog.ten_tac_gia || blog.tenTacGia || "",
});

export const getAdminBlogs = async () => {
  try {
    const response = await api.get("/nhan-vien/bai-viet");
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeBlog);
    }
    if (Array.isArray(response.data?.content)) {
      return response.data.content.map(normalizeBlog);
    }
    return [];
  } catch (error) {
    // Fallback khi backend chưa cập nhật endpoint quản trị.
    const fallback = await api.get("/cong-khai/bai-viet?page=0&size=200");
    const content = Array.isArray(fallback.data?.content)
      ? fallback.data.content
      : Array.isArray(fallback.data)
        ? fallback.data
        : [];
    return content.map(normalizeBlog);
  }
};

export const createAdminBlog = async (payload) => {
  const response = await api.post("/nhan-vien/bai-viet", payload);
  return normalizeBlog(response.data);
};

export const updateAdminBlog = async (id, payload) => {
  const response = await api.put(`/nhan-vien/bai-viet/${id}`, payload);
  return normalizeBlog(response.data);
};

export const deleteAdminBlog = async (id) => {
  await api.delete(`/nhan-vien/bai-viet/${id}`);
};
