const express = require("express");
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", auth, requireAdmin, createRoom);
router.put("/:id", auth, requireAdmin, updateRoom);
router.delete("/:id", auth, requireAdmin, deleteRoom);

module.exports = router;
