import api from "./api";

const bookingService = {
  createBooking: (bookingData, token) => api.post("/bookings/book", bookingData, token),
  getMyBookings: (token) => api.get("/bookings/my", token),
  getBookings: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/bookings?${query}` : "/bookings", token);
  },
  updateBooking: (id, bookingData, token) => api.put(`/bookings/${id}`, bookingData, token),
  cancelBooking: (id, token) => api.delete(`/bookings/${id}`, token),
};

export default bookingService;
