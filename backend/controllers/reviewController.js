const Review = require("../models/Review");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const { emitToAdmins } = require("../config/socket");

const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { hotel, rating, title, comment } = req.body;

    if (!hotel || !rating || !comment) {
      return res.status(400).json({ message: "Hotel, rating and comment are required" });
    }

    const hotelDoc = await Hotel.findById(hotel);
    if (!hotelDoc) return res.status(404).json({ message: "Hotel not found" });

    const existing = await Review.findOne({ hotel, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this hotel" });
    }

    const hasBooking = await Booking.exists({
      user: req.user._id,
      status: { $ne: "cancelled" }
    });

    const review = await Review.create({
      user: req.user._id,
      hotel,
      rating,
      title,
      comment,
      status: hasBooking ? "approved" : "pending"
    });

    const populated = await review.populate("user", "name");

    const stats = await Review.aggregate([
      { $match: { hotel, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      hotelDoc.rating = Math.round(stats[0].avg * 10) / 10;
      await hotelDoc.save();
    }

    emitToAdmins("review:created", { review: populated, hotelName: hotelDoc.name });

    res.status(201).json({
      message: "Review submitted successfully",
      review: populated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("hotel", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const hotelDoc = await Hotel.findById(review.hotel);
    if (hotelDoc && status === "approved") {
      const stats = await Review.aggregate([
        { $match: { hotel: review.hotel, status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
      ]);
      if (stats.length > 0) {
        hotelDoc.rating = Math.round(stats[0].avg * 10) / 10;
        await hotelDoc.save();
      }
    }

    res.json({ message: "Review updated", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to delete this review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHotelReviews, addReview, getAllReviews, updateReviewStatus, deleteReview };
