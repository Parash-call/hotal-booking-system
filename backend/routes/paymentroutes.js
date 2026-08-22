const express = require("express");
const {
  createPayment,
  getMyPayments,
  getAllPayments,
  refundPayment
} = require("../controllers/paymentController");
const { auth, optionalAuth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", optionalAuth, createPayment);
router.get("/my", auth, getMyPayments);
router.get("/", auth, requireAdmin, getAllPayments);
router.post("/:id/refund", auth, requireAdmin, refundPayment);

module.exports = router;
