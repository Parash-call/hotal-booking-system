const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotelBooking";

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }
  console.error(
    "MongoDB connection failed. Server running WITHOUT database. Check MONGO_URI in environment variables."
  );
};

module.exports = connectDB;
