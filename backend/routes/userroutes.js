const express = require("express");
const {
  getUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser
} = require("../controllers/userController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", auth, requireAdmin, getUsers);
router.put("/profile", auth, updateProfile);
router.get("/:id", auth, getUserById);
router.put("/:id", auth, requireAdmin, updateUser);
router.delete("/:id", auth, requireAdmin, deleteUser);

module.exports = router;
