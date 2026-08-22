const express = require("express");
const {
  book,
  getMyBookings,
  getAllBookings,
  updateBooking,
  cancelBooking
} = require("../controllers/bookingController");
const { auth, optionalAuth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/book", optionalAuth, book);
router.get("/my", auth, getMyBookings);
router.get("/", auth, requireAdmin, getAllBookings);
router.put("/:id", auth, requireAdmin, updateBooking);
router.delete("/:id", auth, cancelBooking);

module.exports = router;
