require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const crypto = require("crypto");

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authroutes");
const hotelRoutes = require("./routes/hotelroutes");
const roomRoutes = require("./routes/roomroutes");
const bookingRoutes = require("./routes/bookingroutes");
const userRoutes = require("./routes/userroutes");
const reviewRoutes = require("./routes/reviewroutes");
const paymentRoutes = require("./routes/paymentroutes");
const statsRoutes = require("./routes/statsroutes");
const assistantRoutes = require("./routes/assistantroutes");
const dealRoutes = require("./routes/dealroutes");
const notificationRoutes = require("./routes/notificationroutes");
const chatRoutes = require("./routes/chatroutes");

const Room = require("./models/Room");
const User = require("./models/User");
const Hotel = require("./models/Hotel");

const app = express();

app.use(
  cors(
    process.env.CLIENT_URL
      ? { origin: process.env.CLIENT_URL.split(",").map((u) => u.trim()) }
      : {}
  )
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

const HOTELS = [
  {
    name: "Grand Palace Hotel",
    location: "MG Road",
    city: "Mumbai",
    country: "India",
    description:
      "A 5-star landmark in the heart of Mumbai with sea-view rooms, rooftop pool and award-winning fine dining.",
    price: 3500,
    rating: 4.6,
    image: "/images/hotel.jpg",
    amenities: ["Swimming Pool", "Free Wi-Fi", "Restaurant", "Spa", "Gym", "Airport Transfer"],
    coordinates: { lat: 19.076, lng: 72.8777 },
    rooms: []
  },
  {
    name: "Royal Heritage Resort",
    location: "Lal Bagh",
    city: "Jaipur",
    country: "India",
    description:
      "A heritage palace resort with traditional courtyards, royal suites and lush gardens.",
    price: 4200,
    rating: 4.8,
    image: "/images/hotel.jpg",
    amenities: ["Garden", "Pool", "Restaurant", "Free Parking", "24x7 Front Desk"],
    coordinates: { lat: 26.9124, lng: 75.7873 },
    rooms: []
  },
  {
    name: "Lakeside Grand Hotel",
    location: "Lake View Road",
    city: "Udaipur",
    country: "India",
    description:
      "Overlooking the iconic lake with boat rides, candle-lit dinners and stunning sunset views.",
    price: 3000,
    rating: 4.4,
    image: "/images/hotel.jpg",
    amenities: ["Lake View", "Free Wi-Fi", "Restaurant", "Boating"],
    coordinates: { lat: 24.5778, lng: 73.6893 },
    rooms: []
  }
];

async function seedRooms() {
  const count = await Room.countDocuments();
  if (count === 0) {
    await Room.insertMany([
      {
        type: "Deluxe Room",
        price: 2500,
        description: "King size bed, AC, free Wi-Fi",
        features: ["King Size Bed", "Free Wi-Fi", "Air Conditioner"]
      },
      {
        type: "Suite Room",
        price: 4500,
        description: "Luxury bed, smart TV, free breakfast",
        features: ["Luxury Bed", "Smart TV", "Free Breakfast"]
      },
      {
        type: "Family Room",
        price: 6000,
        description: "Two double beds, balcony view",
        features: ["Two Double Beds", "Free Wi-Fi", "Balcony View"]
      }
    ]);
    console.log("Rooms seeded");
  }
}

async function seedHotels() {
  const count = await Hotel.countDocuments();
  if (count === 0) {
    const rooms = await Room.find();
    await Hotel.insertMany(
      HOTELS.map((hotel, i) => ({
        ...hotel,
        rooms: rooms.map((r) => r._id).slice(i % 3)
      }))
    );
    console.log("Hotels seeded");
  }
}

async function seedAdmin() {
  const admin = await User.findOne({ email: "admin@hotel.com" });
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
    await User.create({ name: "Admin", email: "admin@hotel.com", password, role: "admin" });
    console.log(`Admin created: admin@hotel.com / ${password}`);
  } else if (process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production") {
    admin.password = process.env.ADMIN_PASSWORD;
    await admin.save();
    console.log(`Admin password reset to ADMIN_PASSWORD (development mode)`);
  }
}

async function seedDeals() {
  const Deal = require("./models/Deal");
  const count = await Deal.countDocuments();
  if (count === 0) {
    const now = new Date();
    await Deal.insertMany([
      {
        title: "Weekend Getaway 20% Off",
        description: "Save 20% on Deluxe Room stays booked for Friday to Sunday.",
        discount: 20,
        roomTypes: ["Deluxe Room"],
        code: "WEEKEND20",
        active: true,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Suite Luxury Deal",
        description: "Upgrade to the Suite Room and enjoy free breakfast for two.",
        discount: 15,
        roomTypes: ["Suite Room"],
        code: "SUITE15",
        active: true,
        expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Family & Group Savings",
        description: "Book 2+ rooms and get 10% off every room. Perfect for group trips.",
        discount: 10,
        roomTypes: ["Family Room", "Deluxe Room"],
        code: "GROUP10",
        active: true,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Deals seeded");
  }
}

connectDB()
  .then(async () => {
    await seedRooms();
    await seedHotels();
    await seedAdmin();
    await seedDeals();
  })
  .catch((err) => console.error("Startup seeding failed:", err.message));

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
    return res.sendFile(path.join(distPath, "index.html"));
  }
  next();
});

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
