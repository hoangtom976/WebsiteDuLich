import api from "@/lib/api";

export const getAllChatSessions = async () => {
    const response = await api.get("/quan-tri/chat");
    return response.data;
};
