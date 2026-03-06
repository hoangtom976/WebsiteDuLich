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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

async function serverFetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const getRecentPosts = async (limit = 3) => {
  try {
    const data =
      typeof window === "undefined"
        ? await serverFetchJson(`/cong-khai/bai-viet?page=0&size=${limit}`)
        : (await api.get(`/cong-khai/bai-viet?page=0&size=${limit}`)).data;

    const content = Array.isArray(data?.content) ? data.content : [];
    return content.map(normalizePost);
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
    return content.map(normalizePost);
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
