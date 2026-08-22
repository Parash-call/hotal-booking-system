import api from "./api";

const dealService = {
  getDeals: () => api.get("/deals"),
  getAllDeals: (token) => api.get("/deals/all", token),
  createDeal: (dealData, token) => api.post("/deals", dealData, token),
  updateDeal: (id, dealData, token) => api.put(`/deals/${id}`, dealData, token),
  deleteDeal: (id, token) => api.delete(`/deals/${id}`, token),
};

export default dealService;
