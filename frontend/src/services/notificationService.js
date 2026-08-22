import api from "./api";

const notificationService = {
  getMyNotifications: (token) => api.get("/notifications", token),
  markAllRead: (token) => api.put("/notifications/read-all", {}, token),
  markRead: (id, token) => api.put(`/notifications/${id}/read`, {}, token),
};

export default notificationService;
