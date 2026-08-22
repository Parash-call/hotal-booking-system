const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendMail } = require("../utils/email");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "Registered successfully",
      user: publicUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = jwt.sign({ id: user._id, purpose: "reset" }, process.env.JWT_SECRET || "hotel-secret-key", {
        expiresIn: "30m"
      });
      const resetLink = `${process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5000}`}/reset-password?token=${resetToken}`;

      try {
        await sendMail({
          to: email,
          subject: "Password Reset - Grand Hotel",
          html: `<div style="font-family:Arial,sans-serif"><h2>Reset your password</h2><p>Click the link below to set a new password (valid 30 minutes):</p><p><a href="${resetLink}" style="background:#0b1e3a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset Password</a></p></div>`
        });
      } catch (mailErr) {
        console.log("DEV RESET LINK:", resetLink);
      }
    }

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "hotel-secret-key");
    } catch {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    if (payload.purpose !== "reset") return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };
