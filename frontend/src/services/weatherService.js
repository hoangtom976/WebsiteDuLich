import api from "@/lib/api";

const normalizeWeather = (item = {}) => ({
  thoiGian: item.thoiGian || "",
  nhietDo: Number(item.nhietDo ?? 0),
  camGiacNhu: Number(item.camGiacNhu ?? 0),
  doAm: Number(item.doAm ?? 0),
  moTa: item.moTa || "",
  icon: item.icon || "",
  thanhPho: item.thanhPho || "",
});

export const getCurrentWeather = async (lat, lon) => {
  const response = await api.get("/thoi-tiet/hien-tai", {
    params: { lat, lon },
  });
  return normalizeWeather(response.data);
};

// Backward compatibility for pages currently importing getWeather/getForecast.
export const getWeather = getCurrentWeather;

export const getForecast = async (lat, lon) => {
  const response = await api.get("/thoi-tiet/du-bao", {
    params: { lat, lon },
  });
  return response.data;
};
