import api from "@/lib/api";

export const toggleYeuThich = async (tourId) => {
    const response = await api.post(`/yeu-thich/${tourId}`);
    return response.data;
};

export const getDanhSachYeuThich = async () => {
    const response = await api.get("/yeu-thich");
    return response.data;
};
