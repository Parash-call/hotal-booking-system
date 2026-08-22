const express = require("express");
const { getDeals, getAllDeals, createDeal, updateDeal, deleteDeal } = require("../controllers/dealController");
const { auth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getDeals);
router.get("/all", auth, requireAdmin, getAllDeals);
router.post("/", auth, requireAdmin, createDeal);
router.put("/:id", auth, requireAdmin, updateDeal);
router.delete("/:id", auth, requireAdmin, deleteDeal);

module.exports = router;
