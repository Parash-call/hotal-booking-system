const Deal = require("../models/Deal");

const getDeals = async (req, res) => {
  try {
    const now = new Date();
    const deals = await Deal.find({
      active: true,
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }]
    }).sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDeal = async (req, res) => {
  try {
    const { title, description, discount, roomTypes, code, active, expiresAt } = req.body;
    if (!title || !discount) {
      return res.status(400).json({ message: "Title and discount are required" });
    }
    const deal = await Deal.create({ title, description, discount, roomTypes, code, active, expiresAt });
    res.status(201).json({ message: "Deal created", deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json({ message: "Deal updated", deal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json({ message: "Deal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDeals, getAllDeals, createDeal, updateDeal, deleteDeal };
