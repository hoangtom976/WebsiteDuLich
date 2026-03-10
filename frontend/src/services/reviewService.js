import api from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

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

export const getReviewsByTourId = async (tourId) => {
  try {
    if (typeof window === "undefined") {
      return await serverFetchJson(`/danh-gia/tour/${tourId}`);
    }
    const response = await api.get(`/danh-gia/tour/${tourId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reviews for tour ${tourId}:`, error);
    return [];
  }
};

export const getMyReviews = async () => {
  try {
    const response = await api.get("/danh-gia/cua-toi");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my reviews:", error);
    return [];
  }
};
