import api from "./api";

const reviewService = {
  getHotelReviews: (hotelId) => api.get(`/reviews/hotel/${hotelId}`),
  addReview: (reviewData, token) => api.post("/reviews", reviewData, token),
  getAllReviews: (token) => api.get("/reviews", token),
  updateStatus: (id, status, token) => api.put(`/reviews/${id}`, { status }, token),
  deleteReview: (id, token) => api.delete(`/reviews/${id}`, token),
};

export default reviewService;
