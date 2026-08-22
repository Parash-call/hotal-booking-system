const express = require("express");
const {
  getHotelReviews,
  addReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} = require("../controllers/reviewController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/hotel/:hotelId", getHotelReviews);
router.get("/", auth, requireAdmin, getAllReviews);
router.post("/", auth, addReview);
router.put("/:id", auth, requireAdmin, updateReviewStatus);
router.delete("/:id", auth, deleteReview);

module.exports = router;
