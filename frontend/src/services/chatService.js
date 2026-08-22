import api from "./api";

const chatService = {
  getMessages: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/chat?${query}` : "/chat", token);
  },
  getConversations: (token) => api.get("/chat/conversations", token),
};

export default chatService;
