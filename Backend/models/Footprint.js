// // models/Footprint.js
// const mongoose = require("mongoose");

// const transportSchema = new mongoose.Schema({
//   distanceKm: { type: Number, default: 0 },
//   vehicleType: { type: String, enum: ["car","bike","bus","ev"], default: "car" },
//   fuelUsed: { type: Number, default: 0 }, // optional
//   co2: { type: Number, default: 0 }
// }, { _id: false });

// const energySchema = new mongoose.Schema({
//   electricityKwh: { type: Number, default: 0 },
//   co2: { type: Number, default: 0 }
// }, { _id: false });

// const wasteSchema = new mongoose.Schema({
//   wasteKg: { type: Number, default: 0 },
//   category: { type: String, enum: ["plastic","organic","metal","other"], default: "other" },
//   co2: { type: Number, default: 0 }
// }, { _id: false });

// const footprintSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   transport: transportSchema,
//   energy: energySchema,
//   waste: wasteSchema,
//   totalCO2: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Footprint", footprintSchema);

// models/Footprint.js
const mongoose = require("mongoose");

const genericPair = { type: Number, default: 0 };

const personalSchema = new mongoose.Schema({
  height: { type: Number, default: 0 }, // cm
  weight: { type: Number, default: 0 }, // kg
  gender: { type: String },
  diet: { type: String },
  socialActivity: { type: String },

  co2: { type: Number, default: 0 }
}, { _id: false });

const transportSchema = new mongoose.Schema({
  transportMode: { type: String },
  monthlyDistanceKm: { type: Number, default: 0 },
  flightFrequency: { type: String },
  co2: { type: Number, default: 0 }
}, { _id: false });

const energySchema = new mongoose.Schema({
  heatingSource: { type: String },
  cookingSystem: { type: String },
  energyAware: { type: Boolean, default: false },
  pcTvDaily: { type: Number, default: 0 },
  internetDaily: { type: Number, default: 0 },
  co2: { type: Number, default: 0 }
}, { _id: false });

const wasteSchema = new mongoose.Schema({
  bagSize: { type: String },
  bagsPerWeek: { type: Number, default: 0 },
  recycling: { type: String },
  co2: { type: Number, default: 0 }
}, { _id: false });

const consumptionSchema = new mongoose.Schema({
  showerFreq: { type: String },
  grocerySpending: { type: Number, default: 0 },
  clothesPerMonth: { type: Number, default: 0 },
  co2: { type: Number, default: 0 }
}, { _id: false });

const footprintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  personal: personalSchema,
  transport: transportSchema,
  energy: energySchema,
  waste: wasteSchema,
  consumption: consumptionSchema,
  totalCO2: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Footprint", footprintSchema);
