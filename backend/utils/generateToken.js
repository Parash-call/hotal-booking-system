const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const generateToken = (user, expiresIn = "7d") =>
  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn });

module.exports = generateToken;
