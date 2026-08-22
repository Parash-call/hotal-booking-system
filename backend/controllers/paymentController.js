const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const { sendMail, paymentReceiptEmail } = require("../utils/email");
const { createNotification } = require("../controllers/notificationController");
const { emitToUser, emitToAdmins } = require("../config/socket");

const createTransactionId = () =>
  "TXN" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method = "card", cardNumber, paymentRef } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (Number(amount) !== Number(booking.totalPrice)) {
      return res.status(400).json({ message: "Amount does not match booking total" });
    }

    const cardLast4 = cardNumber ? String(cardNumber).replace(/\D/g, "").slice(-4) : null;

    const payment = await Payment.create({
      user: req.user ? req.user._id : undefined,
      booking: booking._id,
      name: booking.name,
      email: booking.email,
      amount,
      method,
      status: "completed",
      transactionId: createTransactionId(),
      cardLast4,
      paymentRef
    });

    await Booking.findByIdAndUpdate(booking._id, { paymentId: payment._id }, { new: true });

    try {
      const { subject, html } = paymentReceiptEmail(payment, booking);
      await sendMail({ to: booking.email, subject, html });
    } catch (mailErr) {
      console.error("Receipt email skipped:", mailErr.message);
    }

    if (req.user) {
      await createNotification(req.user._id, {
        title: "Payment successful",
        body: `₹${amount} paid for booking ${booking.bookingRef}.`,
        type: "payment",
        target: "/my-bookings"
      });
      emitToUser(req.user._id, "payment:completed", { payment, booking });
    }

    emitToAdmins("payment:completed", { payment, booking });

    res.status(201).json({
      message: "Payment successful",
      payment,
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("booking")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status === "refunded") {
      return res.status(400).json({ message: "Payment already refunded" });
    }

    payment.status = "refunded";
    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, { status: "cancelled", paymentStatus: "refunded" });

    res.json({ message: "Payment refunded", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, getMyPayments, getAllPayments, refundPayment };
