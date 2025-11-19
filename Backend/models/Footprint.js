// models/Footprint.js
const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  distanceKm: { type: Number, default: 0 },
  vehicleType: { type: String, enum: ["car","bike","bus","ev"], default: "car" },
  fuelUsed: { type: Number, default: 0 }, // optional
  co2: { type: Number, default: 0 }
}, { _id: false });

const energySchema = new mongoose.Schema({
  electricityKwh: { type: Number, default: 0 },
  co2: { type: Number, default: 0 }
}, { _id: false });

const wasteSchema = new mongoose.Schema({
  wasteKg: { type: Number, default: 0 },
  category: { type: String, enum: ["plastic","organic","metal","other"], default: "other" },
  co2: { type: Number, default: 0 }
}, { _id: false });

const footprintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transport: transportSchema,
  energy: energySchema,
  waste: wasteSchema,
  totalCO2: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Footprint", footprintSchema);
