import api from "./api";

const statsService = {
  getStats: (token) => api.get("/stats", token),
};

export default statsService;
