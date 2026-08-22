const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    checkin: { type: Date, required: true },
    checkout: { type: Date, required: true },
    room: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 10 },
    numberOfRooms: { type: Number, default: 1, min: 1, max: 10 },
    groupBooking: { type: Boolean, default: false },
    totalPrice: { type: Number },
    status: { type: String, default: "confirmed" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentStatus: { type: String, default: "pending" },
    bookingRef: { type: String, unique: true, sparse: true },
    riskScore: { type: Number, default: 0 },
    fraudFlag: { type: Boolean, default: false },
    fraudReasons: [String],
    clientIp: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
