const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String },
  features: [String]
});

module.exports = mongoose.model("Room", roomSchema);
