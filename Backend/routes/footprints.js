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
// const express = require("express");
// const router = express.Router();
// const { body, validationResult } = require("express-validator");
// const authenticate = require("../middleware/auth");
// const Footprint = require("../models/Footprint");

// // Emission Factors
// const EMISSION_FACTORS = {
//   transport: { car: 0.192, bike: 0.065, bus: 0.105, ev: 0.02 },
//   energy: { electricity_kwh: 0.82 },
//   waste: { plastic: 1.84, organic: 0.25, metal: 2.1, other: 0.5 }
// };

// router.post(
//   "/",
//   authenticate,

//   // Validation
//   body("transport.distanceKm").optional().isFloat({ min: 0 }),
//   body("transport.vehicleType").optional().isIn(["car", "bike", "bus", "ev"]),
//   body("energy.electricityKwh").optional().isFloat({ min: 0 }),
//   body("waste.wasteKg").optional().isFloat({ min: 0 }),

//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty())
//         return res.status(400).json({ errors: errors.array() });

//       // Defaults applied
//       const transport = req.body.transport || {};
//       const energy = req.body.energy || {};
//       const waste = req.body.waste || {};

//       // Transport
//       const distanceKm = Number(transport.distanceKm || 0);
//       const vehicleType = transport.vehicleType || "car";
//       const transportFactor =
//         EMISSION_FACTORS.transport[vehicleType] ||
//         EMISSION_FACTORS.transport.car;
//       const transportCO2 = +(distanceKm * transportFactor).toFixed(3);

//       // Energy
//       const electricityKwh = Number(energy.electricityKwh || 0);
//       const energyCO2 = +(
//         electricityKwh * EMISSION_FACTORS.energy.electricity_kwh
//       ).toFixed(3);

//       // Waste
//       const wasteKg = Number(waste.wasteKg || 0);
//       const wasteCategory = waste.category || "other";
//       const wasteFactor =
//         EMISSION_FACTORS.waste[wasteCategory] ||
//         EMISSION_FACTORS.waste.other;
//       const wasteCO2 = +(wasteKg * wasteFactor).toFixed(3);

//       // Total
//       const totalCO2 = +(transportCO2 + energyCO2 + wasteCO2).toFixed(3);

//       const payload = {
//         user: req.user._id,
//         transport: {
//           distanceKm,
//           vehicleType,
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
//       };

//       const saved = await Footprint.create(payload);

//       return res.status(201).json(saved);
//     } catch (err) {
//       console.error("save footprint error:", err);
//       return res.status(500).json({ message: "Failed to save footprint" });
//     }
//   }
// );

// router.get("/latest", authenticate, async (req, res) => {
//   try {
//     const fp = await Footprint.findOne({ user: req.user._id }).sort({
//       createdAt: -1
//     });
//     if (!fp)
//       return res.status(404).json({ message: "No footprint found" });
//     res.json(fp);
//   } catch (err) {
//     console.error("fetch latest error:", err);
//     res.status(500).json({ message: "Failed to fetch latest footprint" });
//   }
// });

// module.exports = router;

// routes/footprints.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const Footprint = require("../models/Footprint");
const { body, validationResult } = require("express-validator");

/**
 * Emission assumptions and formulas used (all in kg CO2):
 *
 * Travel:
 *  - per-km emission factors:
 *    car: 0.192, motorbike: 0.11, bike: 0 (negligible), public: 0.105, walking: 0
 *    EV: 0.02
 *  - flights: approximate per-flight monthly contribution:
 *    never: 0, once: 100 kg/month, twice: 200, frequently: 400
 *
 * Waste:
 *  - bag mass estimate by bag size (kg): small 2, medium 4, large 7
 *  - emissions per kg by waste type: plastic 1.84, organic 0.25, metal 2.1, glass 0.5, none (mix) 0.5
 *
 * Energy:
 *  - heating source monthly factor (kg/month): natural gas 150, electricity 200, wood 180, LPG 160
 *  - PC/TV: assume 0.05 kg CO2 per hour (electricity)
 *  - Internet: assume 0.02 kg CO2 per hour
 *
 * Consumption:
 *  - showers: daily heavy (6 kg/month), weekly (1.5), monthly (0.2)
 *  - grocery spending: assume 0.005 kg CO2 per $ spent (example)
 *  - clothes: each clothing purchase ~ 10 kg CO2 (avg); multiply by count
 *
 * Personal:
 *  - diet factor monthly (kg/month): omnivore 50, vegetarian 30, vegan 20, pescetarian 40
 *  - social activity: more social activity slightly increases footprint: never 0, rarely 2, weekly 5, daily 10 (kg/month)
 *
 * These are simplified assumptions for demonstration. Replace them with better region-specific data later.
 */

const FACTORS = {
  travelPerKm: {
    car: 0.192, motorbike: 0.11, bike: 0.01, public: 0.105, walking: 0.0, ev: 0.02
  },
  flightPerMonth: { never: 0, once: 100, twice: 200, frequently: 400 },
  bagMassKg: { small: 2, medium: 4, large: 7 },
  wasteFactor: { plastic: 1.84, organic: 0.25, metal: 2.1, glass: 0.5, none: 0.5 },
  heatingMonthly: { "natural gas": 150, electricity: 200, wood: 180, LPG: 160 },
  pcTvPerHour: 0.05,
  internetPerHour: 0.02,
  showerMonthly: { daily: 6, weekly: 1.5, monthly: 0.2 },
  groceryPerDollar: 0.005,
  clothesPerItem: 10,
  dietMonthly: { omnivore: 50, vegetarian: 30, vegan: 20, pescetarian: 40 },
  socialActivity: { never: 0, rarely: 2, weekly: 5, daily: 10 }
};

// Validator: many fields are optional; we enforce numeric >= 0 where applicable
router.post("/", authenticate, async (req, res) => {
  try {
    // Basic defensive assignment
    const personal = req.body.personal || {};
    const travel = req.body.travel || {};
    const waste = req.body.waste || {};
    const energy = req.body.energy || {};
    const consumption = req.body.consumption || {};

    // safe numeric conversions
    const monthlyDistanceKm = Math.max(0, Number(travel.monthlyDistanceKm || 0));
    const flightFrequency = travel.flightFrequency || "never";
    const transportMode = travel.transportMode || "car";

    // Travel CO2
    const perKm = FACTORS.travelPerKm[transportMode] ?? FACTORS.travelPerKm.car;
    const travelCO2_fromDistance = +(monthlyDistanceKm * perKm).toFixed(3);
    const travelCO2_fromFlights = +(FACTORS.flightPerMonth[flightFrequency] ?? 0).toFixed(3);
    const travelCO2 = +(travelCO2_fromDistance + travelCO2_fromFlights).toFixed(3);

    // Waste CO2
    const bagSize = waste.bagSize || "medium";
    const bagsPerWeek = Math.max(0, Number(waste.bagsPerWeek || 0));
    const bagMass = FACTORS.bagMassKg[bagSize] ?? FACTORS.bagMassKg.medium;
    const wasteKgPerMonth = +(bagMass * bagsPerWeek * 4).toFixed(3); // 4 weeks
    const wasteType = waste.recycling || "none";
    const wasteFactor = FACTORS.wasteFactor[wasteType] ?? FACTORS.wasteFactor.none;
    const wasteCO2 = +(wasteKgPerMonth * wasteFactor).toFixed(3);

    // Energy CO2
    const heatingSource = energy.heatingSource || "electricity";
    const heatingCO2 = +(FACTORS.heatingMonthly[heatingSource] ?? 0).toFixed(3);
    const pcTvHours = Math.max(0, Number(energy.pcTvDaily || 0));
    const internetHours = Math.max(0, Number(energy.internetDaily || 0));
    const pcTvCO2 = +((pcTvHours * 30) * FACTORS.pcTvPerHour).toFixed(3); // assume monthly = daily * 30
    const internetCO2 = +((internetHours * 30) * FACTORS.internetPerHour).toFixed(3);
    const energyCO2 = +(heatingCO2 + pcTvCO2 + internetCO2).toFixed(3);

    // Consumption CO2
    const showerFreq = consumption.showerFreq || "daily";
    const showerCO2 = +(FACTORS.showerMonthly[showerFreq] ?? 0).toFixed(3);
    const grocery = Math.max(0, Number(consumption.grocerySpending || 0));
    const groceryCO2 = +(grocery * FACTORS.groceryPerDollar).toFixed(3);
    const clothes = Math.max(0, Number(consumption.clothesPerMonth || 0));
    const clothesCO2 = +(clothes * FACTORS.clothesPerItem).toFixed(3);
    const consumptionCO2 = +(showerCO2 + groceryCO2 + clothesCO2).toFixed(3);

    // Personal CO2 (diet + social activity)
    const diet = (personal.diet || "omnivore");
    const dietCO2 = +(FACTORS.dietMonthly[diet] ?? FACTORS.dietMonthly.omnivore).toFixed(3);
    const social = (personal.socialActivity || "weekly");
    const socialCO2 = +(FACTORS.socialActivity[social] ?? 0).toFixed(3);
    const personalCO2 = +(dietCO2 + socialCO2).toFixed(3);

    // total
    const totalCO2 = +(
      travelCO2 + wasteCO2 + energyCO2 + consumptionCO2 + personalCO2
    ).toFixed(3);

    // Build document
    const doc = {
      user: req.user._id,
      personal: {
        ...personal,
        co2: personalCO2
      },
      transport: {
        transportMode,
        monthlyDistanceKm,
        flightFrequency,
        co2: travelCO2
      },
      waste: {
        bagSize,
        bagsPerWeek,
        recycling: wasteType,
        co2: wasteCO2
      },
      energy: {
        heatingSource,
        cookingSystem: energy.cookingSystem || null,
        energyAware: !!energy.energyAware,
        pcTvDaily: pcTvHours,
        internetDaily: internetHours,
        co2: energyCO2
      },
      consumption: {
        showerFreq,
        grocerySpending: grocery,
        clothesPerMonth: clothes,
        co2: consumptionCO2
      },
      totalCO2
    };

    const saved = await Footprint.create(doc);
    return res.status(201).json(saved);
  } catch (err) {
    console.error("save footprint error:", err);
    return res.status(500).json({ message: "Failed to save footprint" });
  }
});

// GET latest (unchanged)
router.get("/latest", authenticate, async (req, res) => {
  try {
    const latest = await Footprint.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    if (!latest) return res.status(404).json({ message: "No footprint data found" });
    return res.json(latest);
  } catch (err) {
    console.error("fetch latest footprint", err);
    return res.status(500).json({ message: "Failed to fetch latest footprint" });
  }
});

module.exports = router;
