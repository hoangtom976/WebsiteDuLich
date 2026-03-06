import api from "@/lib/api";

const normalizeSettings = (settings = {}) => ({
  tenHeThong: settings.ten_he_thong || settings.tenHeThong || "",
  hotline: settings.hotline || "",
  emailLienHe: settings.email_lien_he || settings.emailLienHe || "",
  diaChi: settings.dia_chi || settings.diaChi || "",
  gioLamViec: settings.gio_lam_viec || settings.gioLamViec || "",
  batEmailThongBao:
    typeof settings.bat_email_thong_bao === "boolean"
      ? settings.bat_email_thong_bao
      : settings.batEmailThongBao !== false,
  batChatbot:
    typeof settings.bat_chatbot === "boolean"
      ? settings.bat_chatbot
      : settings.batChatbot !== false,
  batThoiTiet:
    typeof settings.bat_thoi_tiet === "boolean"
      ? settings.bat_thoi_tiet
      : settings.batThoiTiet !== false,
});

export const getAdminSystemSettings = async () => {
  const response = await api.get("/quan-tri/he-thong/cai-dat");
  return normalizeSettings(response.data);
};

export const getPublicSystemSettings = async () => {
  const response = await api.get("/cong-khai/he-thong/cai-dat");
  return normalizeSettings(response.data);
};

export const updateAdminSystemSettings = async (payload) => {
  const response = await api.put("/quan-tri/he-thong/cai-dat", payload);
  return normalizeSettings(response.data);
};
