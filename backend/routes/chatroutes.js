const express = require("express");
const { getMessages, getConversations } = require("../controllers/chatController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", auth, getMessages);
router.get("/conversations", auth, requireAdmin, getConversations);

module.exports = router;
