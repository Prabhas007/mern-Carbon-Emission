// routes/tips.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Tip = require("../models/Tip");
const authorize = require("../middleware/roles");
const { ROLES } = require("../utils/roles");

/**
 * GET /api/tips
 * public or protected? We'll allow authenticated users (frontend ProtectedRoute)
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const tips = await Tip.find({ isDeleted: false }).populate("author", "name email").sort({ createdAt: -1 }).lean();
    res.json(tips);
  } catch (err) {
    console.error("fetch tips", err);
    res.status(500).json({ message: "Failed to fetch tips" });
  }
});

/**
 * POST /api/tips
 * body: { text }
 */
router.post(
  "/",
  authenticate,
  [body("text").isLength({ min: 3 }).withMessage("Tip should be at least 3 characters")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const tip = new Tip({ text: req.body.text.trim(), author: req.user._id });
      await tip.save();
      res.status(201).json(tip);
    } catch (err) {
      console.error("post tip", err);
      res.status(500).json({ message: "Failed to post tip" });
    }
  }
);

/**
 * POST /api/tips/:id/like
 */
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip || tip.isDeleted) return res.status(404).json({ message: "Tip not found" });

    // Prevent double-like by same user
    const already = tip.likedBy.some((id) => id.equals(req.user._id));
    if (already) {
      // Optionally allow unlike: here we ignore
      return res.json({ message: "Already liked" });
    }
    tip.likedBy.push(req.user._id);
    tip.likes = tip.likedBy.length;
    await tip.save();
    res.json({ message: "Liked", likes: tip.likes });
  } catch (err) {
    console.error("like tip", err);
    res.status(500).json({ message: "Failed to like tip" });
  }
});

/**
 * DELETE /api/tips/:id  (admin only)
 */
router.delete("/:id", authenticate, authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ message: "Tip not found" });
    tip.isDeleted = true;
    await tip.save();
    res.json({ message: "Tip deleted" });
  } catch (err) {
    console.error("delete tip", err);
    res.status(500).json({ message: "Failed to delete tip" });
  }
});

module.exports = router;
