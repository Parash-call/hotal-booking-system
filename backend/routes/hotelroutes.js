const express = require("express");
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} = require("../controllers/hotelController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getHotels);
router.get("/:id", getHotelById);
router.post("/", auth, requireAdmin, createHotel);
router.put("/:id", auth, requireAdmin, updateHotel);
router.delete("/:id", auth, requireAdmin, deleteHotel);

module.exports = router;
