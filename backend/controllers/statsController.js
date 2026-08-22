const User = require("../models/User");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

const getStats = async (req, res) => {
  try {
    const [users, bookings, rooms, hotels, payments, reviews, revenue, monthly, recentBookings] =
      await Promise.all([
        User.countDocuments(),
        Booking.countDocuments(),
        Room.countDocuments(),
        Hotel.countDocuments(),
        Payment.countDocuments(),
        Review.countDocuments(),
        Booking.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
        Booking.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              total: { $sum: "$totalPrice" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Booking.find().sort({ createdAt: -1 }).limit(6).populate("user", "name")
      ]);

    res.json({
      counts: {
        users,
        bookings,
        rooms,
        hotels,
        payments,
        reviews,
        revenue: revenue.length ? revenue[0].total : 0
      },
      monthly,
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
