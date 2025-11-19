// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { ROLES } = require("../utils/roles");

/**
 * POST /api/auth/register
 * body: { name, email, password, role? }
 * NOTE: For production, restrict self-assignable roles (e.g., Business)
 */
router.post(
  "/register",
  [
    body("name").isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      // For safety, allow only certain roles at registration:
      const allowedSelfRoles = [ROLES.USER, ROLES.EMPLOYEE]; // don't allow public to register BUSINESS or ADMIN
      const assignedRoles = role && allowedSelfRoles.includes(role) ? [role] : [ROLES.USER];

      const user = new User({ name, email, password: hashed, roles: assignedRoles });
      await user.save();

      // Optionally: send confirmation email here.

      return res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
      console.error("register error", err);
      return res.status(500).json({ message: "Server error during registration" });
    }
  }
);

/**
 * POST /api/auth/login
 * body: { email, password }
 * returns: { token }
 */
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      if (user.isBlocked) return res.status(403).json({ message: "User blocked" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const payload = { id: user._id, email: user.email, name: user.name, roles: user.roles };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

      return res.json({ token });
    } catch (err) {
      console.error("login error", err);
      return res.status(500).json({ message: "Server error during login" });
    }
  }
);

/**
 * GET /api/auth/me
 * returns logged-in user details
 */
const authenticate = require("../middleware/auth");

router.get("/me", authenticate, async (req, res) => {
  // req.user is populated by middleware
  res.json(req.user);
});

module.exports = router;
