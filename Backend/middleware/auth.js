// middleware/auth.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const User = require("../models/User");

if (!JWT_SECRET) {
  // Keep this guard to alert if .env isn't configured
  console.warn("WARNING: JWT_SECRET not set in environment");
}

async function authenticateToken(req, res, next) {
  // token expected in Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user minimal info to request; optionally fetch fresh user from DB
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isBlocked) return res.status(403).json({ message: "User is blocked" });
    req.user = user;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authenticateToken;
