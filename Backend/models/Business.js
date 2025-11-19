// models/Business.js
const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  industry: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Business admin
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Business", businessSchema);
