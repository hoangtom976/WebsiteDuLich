import api from "@/lib/api";

const normalizeImage = (item = {}) => ({
  id: item.id,
  urlHinhAnh: item.url_hinh_anh || item.urlHinhAnh || "",
  tourId: item.tour_id || item.tourId || item?.tour?.id || null,
});

export const getAdminTourImages = async (tourId) => {
  const response = await api.get(`/hinh-anh/tour/${tourId}`);
  return Array.isArray(response.data) ? response.data.map(normalizeImage) : [];
};

export const uploadAdminTourImage = async (tourId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/hinh-anh/tour/${tourId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeImage(response.data);
};

export const deleteAdminTourImage = async (imageId) => {
  await api.delete(`/hinh-anh/${imageId}`);
};
