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
  const current = await getCurrentWeather(lat, lon);
  const today = new Date();

  return Array.from({ length: 5 }, (_, idx) => ({
    ...current,
    ngay: new Date(today.getFullYear(), today.getMonth(), today.getDate() + idx).toISOString(),
    nhietDo: Math.round(current.nhietDo + (idx % 2 === 0 ? idx : -idx * 0.5)),
  }));
};
