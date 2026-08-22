import api from "./api";

const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (token) => api.post("/auth/logout", {}, token),
  getMe: (token) => api.get("/auth/me", token),
};

export default authService;
