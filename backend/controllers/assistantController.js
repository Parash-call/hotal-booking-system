const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

const ROOM_PRICES = { "Deluxe Room": 2500, "Suite Room": 4500, "Family Room": 6000 };

const REPLY = {
  greeting:
    "Hello! I'm the Grand Hotel assistant. I can help you with room pricing, availability, booking steps, hotel features, and more. How can I help?",
  fallback:
    "I can answer questions about room prices, facilities, how to book, check-in times, and payment. Try asking something like 'How much is the Suite Room?' or 'How do I book a room?'",
  payment:
    "We accept payments by credit/debit card, UPI, net banking and wallets. Payments are processed at checkout and you'll get an email receipt immediately.",
  cancel:
    "You can cancel a booking from 'My Bookings' in your account. If you paid, the refund is processed to the same method.",
  contact:
    "You can reach our front desk at +91 98765 43210 or email reservations@grandhotel.com. We're available 24x7."
};

const match = (text, keywords) => keywords.some((k) => text.includes(k));

const buildAnswer = async (text, user) => {
  const lower = text.toLowerCase();

  if (/(^|\\s)(hi|hello|hey|namaste)\\b/.test(lower)) return REPLY.greeting;

  if (match(lower, ["price", "cost", "how much", "rate", "tariff", "charge", "expensive", "cheap"])) {
    const rooms = await Room.find().lean();
    const lines = rooms.length
      ? rooms.map((r) => `• ${r.type}: ₹${r.price} per night`).join("\n")
      : Object.entries(ROOM_PRICES).map(([k, v]) => `• ${k}: ₹${v} per night`).join("\n");
    return `Here are our room prices:\n${lines}`;
  }

  if (match(lower, ["deluxe"])) {
    const room = (await Room.findOne({ type: /deluxe/i }).lean()) || { price: 2500, description: "King size bed, AC, free Wi-Fi", features: ["King Size Bed", "Free Wi-Fi", "Air Conditioner"] };
    return `The Deluxe Room is ₹${room.price} per night. ${room.description}. Features: ${room.features.join(", ")}.`;
  }

  if (match(lower, ["suite"])) {
    const room = (await Room.findOne({ type: /suite/i }).lean()) || { price: 4500, description: "Luxury bed, smart TV, free breakfast", features: ["Luxury Bed", "Smart TV", "Free Breakfast"] };
    return `The Suite Room is ₹${room.price} per night. ${room.description}. Features: ${room.features.join(", ")}.`;
  }

  if (match(lower, ["family"])) {
    const room = (await Room.findOne({ type: /family/i }).lean()) || { price: 6000, description: "Two double beds, balcony view", features: ["Two Double Beds", "Free Wi-Fi", "Balcony View"] };
    return `The Family Room is ₹${room.price} per night. ${room.description}. Features: ${room.features.join(", ")}.`;
  }

  if (match(lower, ["book", "booking", "reserve", "reservation"])) {
    return `Booking is easy:\n1. Pick a hotel or room.\n2. Fill in your dates and guest details on the Booking page.\n3. Complete payment.\n4. You'll get a confirmation + email receipt.\nTip: if you have an account, your bookings appear under 'My Bookings'.`;
  }

  if (match(lower, ["check-in", "check in", "checkin"])) {
    return `Check-in is from 12:00 noon. Early check-in may be available on request. Check-out is by 11:00 AM.`;
  }

  if (match(lower, ["wi-fi", "wifi", "internet"])) {
    return "Yes! Free high-speed Wi-Fi is available in every room and all common areas.";
  }

  if (match(lower, ["breakfast", "food", "restaurant", "dining", "meal"])) {
    return "We have an in-house restaurant open 24x7, plus complimentary breakfast included with Suite rooms. Room service is available around the clock.";
  }

  if (match(lower, ["pool", "gym", "spa", "facility", "amenit"])) {
    const hotels = await Hotel.find().select("amenities").lean();
    const amenities = new Set();
    hotels.forEach((h) => (h.amenities || []).forEach((a) => amenities.add(a)));
    const list = amenities.size
      ? Array.from(amenities).join(", ")
      : "swimming pool, gym, spa, airport transfer, free parking, 24x7 front desk";
    return `Our facilities include: ${list}. You can see full details on each hotel's page.`;
  }

  if (match(lower, ["payment", "pay", "upi", "card", "netbanking", "refund"])) return REPLY.payment;

  if (match(lower, ["cancel", "cancellation"])) return REPLY.cancel;

  if (match(lower, ["contact", "phone", "number", "email", "reach", "call", "address"])) return REPLY.contact;

  if (match(lower, ["location", "where", "city", "address", "near"])) {
    const hotels = await Hotel.find().select("name location city").lean();
    if (hotels.length) {
      return `We currently have hotels in:\n${hotels.map((h) => `• ${h.name} — ${h.location}, ${h.city}`).join("\n")}`;
    }
    return "Our hotels are located in prime city locations. Check the Hotels page for details.";
  }

  if (match(lower, ["available", "availability", "free room"])) {
    const active = await Booking.countDocuments({ status: { $ne: "cancelled" } });
    const rooms = await Room.countDocuments();
    return `We currently manage ${rooms} room types with ${active} active bookings. It's always best to book early to guarantee your dates.`;
  }

  if (match(lower, ["discount", "offer", "deal", "promo"])) {
    return "We regularly run seasonal offers. Long-stay bookings (5+ nights) get a 10% discount on request at the front desk.";
  }

  if (match(lower, ["my booking", "my bookings", "where is my booking"])) {
    if (user) {
      const count = await Booking.countDocuments({ user: user._id });
      return count
        ? `You have ${count} booking${count > 1 ? "s" : ""}. You can view them under 'My Bookings' in your dashboard.`
        : "You don't have any bookings yet. Head to the Booking page to make one!";
    }
    return "Please log in so I can look up your bookings.";
  }

  if (match(lower, ["thank", "thanks"])) return "You're welcome! Anything else I can help with?";

  return REPLY.fallback;
};

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please enter a message" });
    }

    let reply;
    if (process.env.OPENAI_API_KEY) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are the friendly booking assistant for Grand Hotel. Answer concisely about hotel rooms, prices (Deluxe ₹2500, Suite ₹4500, Family ₹6000 per night), booking, payment and facilities."
              },
              { role: "user", content: message }
            ]
          })
        });
        const data = await r.json();
        if (data.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content.trim();
        }
      } catch (err) {
        console.error("LLM fallback to local:", err.message);
      }
    }

    if (!reply) reply = await buildAnswer(message, req.user);

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };
