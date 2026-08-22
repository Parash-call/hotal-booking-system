import api from "./api";

const assistantService = {
  chat: (message, token) => api.post("/assistant/chat", { message }, token),
};

export default assistantService;
