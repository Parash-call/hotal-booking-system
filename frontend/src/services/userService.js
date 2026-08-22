import api from "./api";

const userService = {
  getUsers: (token) => api.get("/users", token),
  getUser: (id, token) => api.get(`/users/${id}`, token),
  updateProfile: (data, token) => api.put("/users/profile", data, token),
  updateUser: (id, data, token) => api.put(`/users/${id}`, data, token),
  deleteUser: (id, token) => api.delete(`/users/${id}`, token),
};

export default userService;
