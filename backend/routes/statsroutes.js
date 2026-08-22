const express = require("express");
const { getStats } = require("../controllers/statsController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", auth, requireAdmin, getStats);

module.exports = router;
