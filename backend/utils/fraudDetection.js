const Booking = require("../models/Booking");

const RULES = {
  MAX_BOOKINGS_PER_EMAIL_HOUR: 3,
  MAX_BOOKINGS_PER_MOBILE_HOUR: 3,
  OVERLAP_WINDOW_HOURS: 2,
  MAX_NIGHTS_SINGLE_BOOKING: 30
};

const getScore = (data, score) => (score > 0 ? Math.min(100, score) : 0);

const detectFraud = async (req, bookingData) => {
  const { email, mobile, checkin, checkout, guests } = bookingData;
  let score = 0;
  const reasons = [];

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentByEmail = await Booking.countDocuments({
    email,
    createdAt: { $gte: hourAgo }
  });
  if (recentByEmail >= RULES.MAX_BOOKINGS_PER_EMAIL_HOUR) {
    score += 30;
    reasons.push("Too many bookings from same email in one hour");
  }

  if (mobile) {
    const recentByMobile = await Booking.countDocuments({
      mobile,
      createdAt: { $gte: hourAgo }
    });
    if (recentByMobile >= RULES.MAX_BOOKINGS_PER_MOBILE_HOUR) {
      score += 30;
      reasons.push("Too many bookings from same mobile in one hour");
    }
  }

  if (checkin && checkout) {
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000);
    if (nights > RULES.MAX_NIGHTS_SINGLE_BOOKING) {
      score += 20;
      reasons.push("Suspiciously long stay duration");
    }

    const overlapping = await Booking.findOne({
      email,
      $or: [
        { checkin: { $lt: checkout }, checkout: { $gt: checkin } },
        { checkin: { $lte: checkout }, checkout: { $gte: checkin } }
      ]
    });
    if (overlapping) {
      score += 25;
      reasons.push("Overlapping booking with existing reservation");
    }
  }

  const validEmails = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
  if (!validEmails) {
    score += 40;
    reasons.push("Invalid email format");
  }

  if (guests && Number(guests) > 6 && !mobile) {
    score += 10;
    reasons.push("Large group without contact number");
  }

  if (req.headers["user-agent"] && /(curl|python-requests|postman)/i.test(req.headers["user-agent"])) {
    score += 25;
    reasons.push("Automated client detected");
  }

  const clientIp = req.ip || req.socket?.remoteAddress || "";
  if (clientIp) {
    const ipRecent = await Booking.countDocuments({
      clientIp,
      createdAt: { $gte: hourAgo }
    });
    if (ipRecent >= 5) {
      score += 20;
      reasons.push("High request volume from same IP");
    }
  }

  const riskScore = Math.min(100, score);
  return {
    riskScore,
    fraudFlag: riskScore >= 50,
    fraudReasons: reasons
  };
};

module.exports = { detectFraud, getScore };
