const DAY_MS = 1000 * 60 * 60 * 24;

const calculateNights = (checkin, checkout) =>
  Math.ceil((new Date(checkout) - new Date(checkin)) / DAY_MS);

const calculatePrice = (checkin, checkout, pricePerNight) =>
  Math.max(0, calculateNights(checkin, checkout)) * pricePerNight;

module.exports = { calculateNights, calculatePrice };
