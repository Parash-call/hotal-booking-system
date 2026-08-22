import api from "./api";

const hotelService = {
  getHotels: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/hotels?${query}` : "/hotels");
  },
  getHotel: (id) => api.get(`/hotels/${id}`),
  createHotel: (hotelData, token) => api.post("/hotels", hotelData, token),
  updateHotel: (id, hotelData, token) => api.put(`/hotels/${id}`, hotelData, token),
  deleteHotel: (id, token) => api.delete(`/hotels/${id}`, token),
};

export default hotelService;
