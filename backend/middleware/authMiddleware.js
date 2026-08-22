const jwt = require("jsonwebtoken");
const User = require("../models/User");

if (!process.env.JWT_SECRET) {
  console.warn(
    `WARNING: JWT_SECRET not set - using insecure fallback${process.env.NODE_ENV === "production" ? " (PRODUCTION)" : " (development only)"}`
  );
}

const JWT_SECRET = process.env.JWT_SECRET || "hotel-secret-key";

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }
  try {
    const payload = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.user = await User.findById(payload.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.split(" ")[1], JWT_SECRET);
      req.user = await User.findById(payload.id);
    } catch (err) {
      // ignore invalid token, treat as guest
    }
  }
  next();
}

module.exports = { auth, optionalAuth, JWT_SECRET };
