import api from "@/lib/api";

export const askChatbot = async (data) => {
    const response = await api.post("/chatbot/hoi", data);
    return response.data;
};

export const getSuggestedQuestions = async () => {
    const response = await api.get("/chatbot/goi-y");
    return response.data;
};

export const getChatHistory = async (phienChatId) => {
    const response = await api.get(`/chatbot/lich-su/${phienChatId}`);
    return response.data;
};
