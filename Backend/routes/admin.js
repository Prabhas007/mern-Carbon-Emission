// routes/admin.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/roles");
const { ROLES } = require("../utils/roles");
const User = require("../models/User");

/**
 * Admin-only user list
 */
router.get("/users", authenticate, authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error("admin list users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * POST /api/admin/users/:id/block
 */
router.post("/users/:id/block", authenticate, authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    u.isBlocked = true;
    await u.save();
    res.json({ message: "User blocked" });
  } catch (err) {
    console.error("block user", err);
    res.status(500).json({ message: "Failed to block user" });
  }
});

/**
 * POST /api/admin/users/:id/unblock
 */
router.post("/users/:id/unblock", authenticate, authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    u.isBlocked = false;
    await u.save();
    res.json({ message: "User unblocked" });
  } catch (err) {
    console.error("unblock user", err);
    res.status(500).json({ message: "Failed to unblock user" });
  }
});

module.exports = router;
