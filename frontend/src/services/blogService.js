import api from "@/lib/api";
import { mockPosts } from "@/lib/mock-data";

const normalizePost = (post = {}) => {
  if (!post) return null;
  return {
    id: post.id || 0,
    tieuDe: post.tieu_de || post.tieuDe || "Tiêu đề đang cập nhật",
    slug: post.slug || "",
    anhBia: post.anh_bia || post.anhBia || "",
    noiDung: post.noi_dung || post.noiDung || "",
    content: post.noi_dung || post.noiDung || post.content || "",
    trangThai: post.trang_thai || post.trangThai || "XUAT_BAN",
    luotXem: Number(post.luot_xem ?? post.luotXem ?? 0),
    ngayTao: post.ngay_tao || post.ngayTao || new Date().toISOString(),
    tenTacGia: post.ten_tac_gia || post.tenTacGia || "Ẩn danh",
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8081/api";

async function serverFetchJson(path) {
  const url = `${API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 204) return null;
      throw new Error(`Request failed: ${response.status}`);
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error(`Server fetch error for ${url}:`, error);
    throw error; // Re-throw so callers can handle fallback
  }
}

export const getRecentPosts = async (limit = 3) => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson(`/cong-khai/bai-viet?page=0&size=${limit}`)
        : (await api.get(`/cong-khai/bai-viet?page=0&size=${limit}`)).data;

    const content = Array.isArray(data?.content) ? data.content : [];
    return content.map(normalizePost).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    return mockPosts.slice(0, limit);
  }
};

export const getAllPosts = async () => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson("/cong-khai/bai-viet")
        : (await api.get("/cong-khai/bai-viet")).data;

    const content = Array.isArray(data?.content) ? data.content : [];
    return content.map(normalizePost).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return mockPosts;
  }
};

export const getPostBySlug = async (slug) => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson(`/cong-khai/bai-viet/${slug}`)
        : (await api.get(`/cong-khai/bai-viet/${slug}`)).data;

    return normalizePost(data);
  } catch (error) {
    console.error("Failed to fetch post detail:", error);
    return mockPosts.find((p) => p.slug === slug) || null;
  }
};
export const getPostComments = async (postId) => {
  try {
    const data = await api.get(`/cong-khai/bai-viet/${postId}/binh-luan`);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
};

export const postBlogComment = async (postId, noiDung) => {
  try {
    const data = await api.post(`/bai-viet/${postId}/binh-luan`, { noiDung });
    return data.data;
  } catch (error) {
    console.error("Failed to post comment:", error);
    throw error;
  }
};
