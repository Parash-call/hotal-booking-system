const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { calculatePrice } = require("../utils/calculatePrice");
const { sendMail, bookingConfirmationEmail } = require("../utils/email");
const { detectFraud } = require("../utils/fraudDetection");
const { createNotification } = require("../controllers/notificationController");
const { emitToUser, emitToAdmins } = require("../config/socket");

const generateRef = () =>
  "GH" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

const GROUP_BOOKING_THRESHOLD = 2;
const GROUP_DISCOUNT_PER_ROOM = 0.1;

const book = async (req, res) => {
  try {
    const { name, email, mobile, checkin, checkout, room, guests, numberOfRooms = 1, discountPercent = 0 } = req.body;

    if (!name || !email || !mobile || !checkin || !checkout || !room || !guests) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    if (checkoutDate <= checkinDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const roomsCount = Math.max(1, Math.min(10, Number(numberOfRooms) || 1));

    const roomDoc = await Room.findOne({ type: room });
    const basePrice = calculatePrice(checkinDate, checkoutDate, roomDoc ? roomDoc.price : 2500);

    const isGroup = roomsCount >= GROUP_BOOKING_THRESHOLD;
    const groupDiscount = isGroup ? GROUP_DISCOUNT_PER_ROOM : 0;
    const dealDiscount = Math.max(0, Math.min(90, Number(discountPercent) || 0)) / 100;
    const totalPrice = Math.round(basePrice * roomsCount * (1 - groupDiscount) * (1 - dealDiscount));

    const fraud = await detectFraud(req, {
      name,
      email,
      mobile,
      checkin,
      checkout,
      guests,
      numberOfRooms: roomsCount
    });

    const booking = await Booking.create({
      user: req.user ? req.user._id : undefined,
      name,
      email,
      mobile,
      checkin,
      checkout,
      room,
      guests,
      numberOfRooms: roomsCount,
      groupBooking: isGroup,
      totalPrice,
      bookingRef: generateRef(),
      riskScore: fraud.riskScore,
      fraudFlag: fraud.fraudFlag,
      fraudReasons: fraud.fraudReasons,
      clientIp: req.ip || req.socket?.remoteAddress
    });

    if (fraud.fraudFlag) {
      await createNotification(req.user ? req.user._id : null, {
        title: "Booking flagged for review",
        body: `Booking ${booking.bookingRef} was flagged by our fraud detection.`,
        type: "fraud"
      });
      emitToAdmins("fraud:flagged", {
        booking,
        reasons: fraud.fraudReasons
      });
    }

    try {
      const { subject, html } = bookingConfirmationEmail(booking);
      await sendMail({ to: email, subject, html });
    } catch (mailErr) {
      console.error("Confirmation email skipped:", mailErr.message);
    }

    if (req.user) {
      await createNotification(req.user._id, {
        title: "Booking confirmed",
        body: `Your booking ${booking.bookingRef} (${room}) is confirmed.`,
        type: "booking",
        target: "/my-bookings"
      });
      emitToUser(req.user._id, "notification:new", { message: "Booking confirmed" });
    }

    emitToAdmins("booking:created", { booking });

    res.status(201).json({
      message: "Room booked successfully",
      booking,
      groupBooking: isGroup,
      discountApplied: isGroup ? basePrice * roomsCount * groupDiscount : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, fraud } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (fraud === "true") filter.fraudFlag = true;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const allowed = ["confirmed", "checked-in", "checked-out", "cancelled"];
    if (req.body.status && !allowed.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (updated.user) {
      await createNotification(updated.user, {
        title: "Booking updated",
        body: `Booking ${updated.bookingRef} is now ${updated.status}.`,
        type: "booking",
        target: "/my-bookings"
      });
      emitToUser(updated.user, "booking:updated", { booking: updated });
    }

    res.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user && booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    if (booking.user && !isOwner) {
      await createNotification(booking.user, {
        title: "Booking cancelled",
        body: `Booking ${booking.bookingRef} was cancelled.`,
        type: "booking",
        target: "/my-bookings"
      });
      emitToUser(booking.user, "booking:cancelled", { booking });
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { book, getMyBookings, getAllBookings, updateBooking, cancelBooking };
