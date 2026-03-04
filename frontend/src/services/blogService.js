import api from "@/lib/api";
import { mockPosts } from "@/lib/mock-data";

const normalizePost = (post = {}) => ({
  id: post.id,
  tieuDe: post.tieu_de || post.tieuDe || "",
  slug: post.slug || "",
  anhBia: post.anh_bia || post.anhBia || "",
  noiDung: post.noi_dung || post.noiDung || "",
  content: post.noi_dung || post.noiDung || post.content || "",
  trangThai: post.trang_thai || post.trangThai || "XUAT_BAN",
  luotXem: Number(post.luot_xem ?? post.luotXem ?? 0),
  ngayTao: post.ngay_tao || post.ngayTao || "",
  tenTacGia: post.ten_tac_gia || post.tenTacGia || "",
});

export const getRecentPosts = async (limit = 3) => {
  try {
    const response = await api.get(`/cong-khai/bai-viet?page=0&size=${limit}`);
    const content = Array.isArray(response.data?.content) ? response.data.content : [];
    return content.map(normalizePost);
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    return mockPosts.slice(0, limit);
  }
};

export const getAllPosts = async () => {
  try {
    const response = await api.get("/cong-khai/bai-viet");
    const content = Array.isArray(response.data?.content) ? response.data.content : [];
    return content.map(normalizePost);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return mockPosts;
  }
};

export const getPostBySlug = async (slug) => {
  try {
    const response = await api.get(`/cong-khai/bai-viet/${slug}`);
    return normalizePost(response.data);
  } catch (error) {
    console.error("Failed to fetch post detail:", error);
    return mockPosts.find((p) => p.slug === slug) || null;
  }
};
