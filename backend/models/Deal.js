const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    discount: { type: Number, required: true, min: 1, max: 90 },
    roomTypes: [String],
    code: { type: String, unique: true },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
