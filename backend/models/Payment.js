const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "card", enum: ["card", "upi", "netbanking", "wallet"] },
    status: { type: String, default: "completed", enum: ["pending", "completed", "failed", "refunded"] },
    transactionId: { type: String, required: true, unique: true },
    cardLast4: { type: String },
    paymentRef: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
