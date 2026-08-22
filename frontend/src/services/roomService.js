import api from "./api";

const roomService = {
  getRooms: () => api.get("/rooms"),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData, token) => api.post("/rooms", roomData, token),
  updateRoom: (id, roomData, token) => api.put(`/rooms/${id}`, roomData, token),
  deleteRoom: (id, token) => api.delete(`/rooms/${id}`, token),
};

export default roomService;
