import api from "./api";

const paymentService = {
  createPayment: (paymentData, token) => api.post("/payments", paymentData, token),
  getMyPayments: (token) => api.get("/payments/my", token),
  getAllPayments: (token) => api.get("/payments", token),
  refund: (id, token) => api.post(`/payments/${id}/refund`, {}, token),
};

export default paymentService;
