const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: "India" },
    description: { type: String },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    image: { type: String },
    amenities: [String],
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
