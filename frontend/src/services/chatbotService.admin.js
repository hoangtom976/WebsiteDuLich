import api from "@/lib/api";

export const getAllChatSessions = async () => {
    const response = await api.get("/quan-tri/chat");
    return response.data;
};

export const syncChatbotData = async () => {
    const response = await api.post("/chatbot/dong-bo");
    return response.data;
};

export const getRAGStats = async () => {
    const response = await api.get("/quan-tri/chat/thong-ke-rag");
    return response.data;
};

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/chatbot/upload-tai-lieu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getDocuments = async () => {
    const response = await api.get("/quan-tri/chat/tai-lieu");
    return response.data;
};

export const deleteDocument = async (tenFile) => {
    const response = await api.delete(`/chatbot/tai-lieu/${encodeURIComponent(tenFile)}`);
    return response.data;
};
