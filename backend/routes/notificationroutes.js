const express = require("express");
const { getMyNotifications, markAllRead, markRead } = require("../controllers/notificationController");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.put("/read-all", auth, markAllRead);
router.put("/:id/read", auth, markRead);

module.exports = router;
