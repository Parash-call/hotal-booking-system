const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://pparas07783_db_user:Parash%4012345@cluster0.uxdhciw.mongodb.net/hotelBooking?appName=Cluster0";

const OPTIONS = { serverSelectionTimeoutMS: 10000 };

let retryTimer = null;

const scheduleRetry = () => {
  if (retryTimer || mongoose.connection.readyState === 1) return;
  console.log("Retrying MongoDB connection in 10 seconds...");
  retryTimer = setTimeout(async () => {
    retryTimer = null;
    try {
      await mongoose.connect(MONGO_URI, OPTIONS);
      console.log("MongoDB connected (after retry)");
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
      scheduleRetry();
    }
  }, 10000);
};

mongoose.connection.on("disconnected", scheduleRetry);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, OPTIONS);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB initial connection failed:", err.message);
    scheduleRetry();
  }
};

module.exports = connectDB;
