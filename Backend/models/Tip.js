// models/Tip.js
const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Tip", tipSchema);
