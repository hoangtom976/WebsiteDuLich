import api from "@/lib/api";

export const layThongBaoCuaToi = async () => {
    const response = await api.get("/thong-bao");
    return response.data;
};

export const danhDauDaDoc = async (id) => {
    const response = await api.put(`/thong-bao/doc/${id}`);
    return response.data;
};

export const demThongBaoChuaDoc = async () => {
    const response = await api.get("/thong-bao/chua-doc/count");
    return response.data;
};
