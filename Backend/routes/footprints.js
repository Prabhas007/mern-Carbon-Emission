// // routes/footprints.js
// const express = require("express");
// const router = express.Router();
// const { body, validationResult } = require("express-validator");
// const authenticate = require("../middleware/auth");
// const Footprint = require("../models/Footprint");
// const { ROLES } = require("../utils/roles");

// /**
//  * Emission factors (kg CO2 per unit)
//  * - Transportation uses per-km factors (kg CO2 / km)
//  * - Energy: per kWh
//  * - Waste: per kg
//  *
//  * These are example values; tune for accuracy / region.
//  */
// const EMISSION_FACTORS = {
//   transport: {
//     car: 0.192, // kg CO2 per km
//     bike: 0.065,
//     bus: 0.105,
//     ev: 0.02
//   },
//   energy: {
//     electricity_kwh: 0.82 // kg CO2 per kWh (example: India grid)
//   },
//   waste: {
//     plastic: 1.84, // kg CO2 per kg
//     organic: 0.25,
//     metal: 2.1,
//     other: 0.5
//   }
// };

// /**
//  * POST /api/footprints
//  * Body:
//  * {
//  *   transport: { distanceKm, vehicleType, fuelUsed? },
//  *   energy: { electricityKwh },
//  *   waste: { wasteKg, category }
//  * }
//  *
//  * Returns saved footprint with calculated CO2 per source and total.
//  */
// router.post("/",
//   authenticate,
//   // Validate numbers and non-negative
//   body("transport.distanceKm").optional().isFloat({ min: 0 }).withMessage("distanceKm must be >= 0"),
//   body("transport.vehicleType").optional().isIn(["car","bike","bus","ev"]).withMessage("invalid vehicleType"),
//   body("transport.fuelUsed").optional().isFloat({ min: 0 }).withMessage("fuelUsed must be >= 0"),
//   body("energy.electricityKwh").optional().isFloat({ min: 0 }).withMessage("electricityKwh must be >= 0"),
//   body("waste.wasteKg").optional().isFloat({ min: 0 }).withMessage("wasteKg must be >= 0"),
//   body("waste.category").optional().isIn(["plastic","organic","metal","other"]).withMessage("invalid waste category"),
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     try {
//       const { transport = {}, energy = {}, waste = {} } = req.body;

//       // compute transport CO2
//       const vehicleType = (transport.vehicleType || "car");
//       const distanceKm = Number(transport.distanceKm || 0);
//       const transportFactor = EMISSION_FACTORS.transport[vehicleType] ?? EMISSION_FACTORS.transport.car;
//       const transportCO2 = +(distanceKm * transportFactor).toFixed(3);

//       // compute energy CO2
//       const electricityKwh = Number(energy.electricityKwh || 0);
//       const energyCO2 = +(electricityKwh * EMISSION_FACTORS.energy.electricity_kwh).toFixed(3);

//       // compute waste CO2
//       const wasteKg = Number(waste.wasteKg || 0);
//       const wasteCategory = (waste.category || "other");
//       const wasteFactor = EMISSION_FACTORS.waste[wasteCategory] ?? EMISSION_FACTORS.waste.other;
//       const wasteCO2 = +(wasteKg * wasteFactor).toFixed(3);

//       const totalCO2 = +(transportCO2 + energyCO2 + wasteCO2).toFixed(3);

//       const footprint = new Footprint({
//         user: req.user._id,
//         transport: {
//           distanceKm,
//           vehicleType,
//           fuelUsed: Number(transport.fuelUsed || 0),
//           co2: transportCO2
//         },
//         energy: {
//           electricityKwh,
//           co2: energyCO2
//         },
//         waste: {
//           wasteKg,
//           category: wasteCategory,
//           co2: wasteCO2
//         },
//         totalCO2
//       });

//       await footprint.save();

//       return res.status(201).json(footprint);
//     } catch (err) {
//       console.error("save footprint error", err);
//       return res.status(500).json({ message: "Failed to save footprint" });
//     }
//   });

// /**
//  * GET /api/footprints/latest
//  * Returns the latest footprint for the authenticated user
//  */
// router.get("/latest", authenticate, async (req, res) => {
//   try {
//     const latest = await Footprint.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
//     if (!latest) return res.status(404).json({ message: "No footprint data found" });
//     return res.json(latest);
//   } catch (err) {
//     console.error("fetch latest footprint", err);
//     return res.status(500).json({ message: "Failed to fetch latest footprint" });
//   }
// });

// /**
//  * (Optional) GET /api/footprints
//  * Returns paginated footprints for a user (history)
//  */
// router.get("/", authenticate, async (req, res) => {
//   try {
//     const page = Math.max(0, parseInt(req.query.page || "0"));
//     const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "10")));
//     const footprints = await Footprint.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(page * limit).limit(limit).lean();
//     return res.json({ footprints, page, limit });
//   } catch (err) {
//     console.error("fetch footprints", err);
//     return res.status(500).json({ message: "Failed to fetch footprints" });
//   }
// });

// module.exports = router;

// routes/footprints.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authenticate = require("../middleware/auth");
const Footprint = require("../models/Footprint");

// Emission Factors
const EMISSION_FACTORS = {
  transport: { car: 0.192, bike: 0.065, bus: 0.105, ev: 0.02 },
  energy: { electricity_kwh: 0.82 },
  waste: { plastic: 1.84, organic: 0.25, metal: 2.1, other: 0.5 }
};

router.post(
  "/",
  authenticate,

  // Validation
  body("transport.distanceKm").optional().isFloat({ min: 0 }),
  body("transport.vehicleType").optional().isIn(["car", "bike", "bus", "ev"]),
  body("energy.electricityKwh").optional().isFloat({ min: 0 }),
  body("waste.wasteKg").optional().isFloat({ min: 0 }),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      // Defaults applied
      const transport = req.body.transport || {};
      const energy = req.body.energy || {};
      const waste = req.body.waste || {};

      // Transport
      const distanceKm = Number(transport.distanceKm || 0);
      const vehicleType = transport.vehicleType || "car";
      const transportFactor =
        EMISSION_FACTORS.transport[vehicleType] ||
        EMISSION_FACTORS.transport.car;
      const transportCO2 = +(distanceKm * transportFactor).toFixed(3);

      // Energy
      const electricityKwh = Number(energy.electricityKwh || 0);
      const energyCO2 = +(
        electricityKwh * EMISSION_FACTORS.energy.electricity_kwh
      ).toFixed(3);

      // Waste
      const wasteKg = Number(waste.wasteKg || 0);
      const wasteCategory = waste.category || "other";
      const wasteFactor =
        EMISSION_FACTORS.waste[wasteCategory] ||
        EMISSION_FACTORS.waste.other;
      const wasteCO2 = +(wasteKg * wasteFactor).toFixed(3);

      // Total
      const totalCO2 = +(transportCO2 + energyCO2 + wasteCO2).toFixed(3);

      const payload = {
        user: req.user._id,
        transport: {
          distanceKm,
          vehicleType,
          co2: transportCO2
        },
        energy: {
          electricityKwh,
          co2: energyCO2
        },
        waste: {
          wasteKg,
          category: wasteCategory,
          co2: wasteCO2
        },
        totalCO2
      };

      const saved = await Footprint.create(payload);

      return res.status(201).json(saved);
    } catch (err) {
      console.error("save footprint error:", err);
      return res.status(500).json({ message: "Failed to save footprint" });
    }
  }
);

router.get("/latest", authenticate, async (req, res) => {
  try {
    const fp = await Footprint.findOne({ user: req.user._id }).sort({
      createdAt: -1
    });
    if (!fp)
      return res.status(404).json({ message: "No footprint found" });
    res.json(fp);
  } catch (err) {
    console.error("fetch latest error:", err);
    res.status(500).json({ message: "Failed to fetch latest footprint" });
  }
});

module.exports = router;
