import api from "@/lib/api";
import { mockTours } from "@/lib/mock-data";

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
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`Malformed JSON from ${url}:`, text);
      return null;
    }
  } catch (error) {
    console.error(`Server fetch error for ${url}:`, error);
    throw error;
  }
}

export const getPopularTours = async () => {
  try {
    if (typeof window === "undefined") {
      const data = await serverFetchJson("/tour/pho-bien");
      return data || [];
    }
    const response = await api.get("/tour/pho-bien");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch popular tours:", error);
    return [];
  }
};

export const getAllTours = async () => {
  try {
    if (typeof window === "undefined") {
      const data = await serverFetchJson("/tour");
      return data || [];
    }
    const response = await api.get("/tour");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch all tours:", error);
    return [];
  }
};

export const getTourById = async (id) => {
  try {
    if (typeof window === "undefined") {
      return await serverFetchJson(`/tour/${id}`);
    }
    const response = await api.get(`/tour/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tour with id ${id}:`, error);
    return null;
  }
};

export const getTourItinerary = async (id) => {
  try {
    if (typeof window === "undefined") {
      return await serverFetchJson(`/lich-trinh/tour/${id}`);
    }
    const response = await api.get(`/lich-trinh/tour/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch itinerary for tour with id ${id}:`, error);
    return [];
  }
};

export const getFavoriteTours = async () => {
  // Trong tương lai, đây sẽ là nơi gọi API /api/yeu-thich
  // try {
  //   const response = await api.get("/yeu-thich");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch favorite tours:", error);
  //   return [];
  // }

  // Tạm thời dùng mock data, sẽ thay bằng API thật
  return new Promise((resolve) => {
    // Giả lập gọi API và trả về các tour có id là 2 và 3
    const favoriteTourIds = [2, 3];
    const favoriteTours = mockTours.filter((tour) =>
      favoriteTourIds.includes(tour.id),
    );
    setTimeout(() => resolve(favoriteTours), 500);
  });
};
