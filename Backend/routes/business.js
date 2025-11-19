// routes/business.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/roles");
const { body, validationResult } = require("express-validator");
const Business = require("../models/Business");
const User = require("../models/User");
const { ROLES } = require("../utils/roles");

/**
 * POST /api/business
 * Create a business (only business owner or admin should do so).
 * For demo: authenticated user can create a business and gets BUSINESS role.
 */
router.post(
  "/",
  authenticate,
  [body("name").isLength({ min: 2 }).withMessage("Business name required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // create business, make current user the owner and give them BUSINESS role
      const business = new Business({ name: req.body.name.trim(), industry: req.body.industry || "", owner: req.user._id, employees: [req.user._id] });
      await business.save();

      // add business id to user and give BUSINESS role if not present
      const user = await User.findById(req.user._id);
      user.business = business._id;
      if (!user.roles.includes(ROLES.BUSINESS)) {
        user.roles.push(ROLES.BUSINESS);
      }
      await user.save();

      res.status(201).json(business);
    } catch (err) {
      console.error("create business", err);
      res.status(500).json({ message: "Failed to create business" });
    }
  }
);

/**
 * POST /api/business/:id/add-employee
 * body: { email }
 * Only BUSINESS owner or ADMIN can invite/add employees (for simplicity we directly attach user to business if they exist)
 */
router.post("/:id/add-employee", authenticate, authorize([ROLES.BUSINESS, ROLES.ADMIN]), [body("email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    // Only owner or admin can add
    if (!req.user._id.equals(business.owner) && !req.user.roles.includes(ROLES.ADMIN)) {
      return res.status(403).json({ message: "Only business owner or admin can add employees" });
    }

    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User with that email not found" });

    // attach to business
    if (!business.employees.includes(user._id)) business.employees.push(user._id);
    user.business = business._id;

    // ensure EMPLOYEE role is present
    if (!user.roles.includes(ROLES.EMPLOYEE)) user.roles.push(ROLES.EMPLOYEE);
    await business.save();
    await user.save();

    res.json({ message: "Employee added", business });
  } catch (err) {
    console.error("add employee", err);
    res.status(500).json({ message: "Failed to add employee" });
  }
});

/**
 * GET /api/business/:id/employees
 * Only owner or admin
 */
router.get("/:id/employees", authenticate, authorize([ROLES.BUSINESS, ROLES.ADMIN]), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("employees", "name email roles").lean();
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (!req.user._id.equals(business.owner) && !req.user.roles.includes(ROLES.ADMIN)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ employees: business.employees });
  } catch (err) {
    console.error("get employees", err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

/**
 * GET /api/business/:id/metrics
 * Basic placeholder metrics: number of employees for now. Expand with real footprint aggregations stored separately.
 */
router.get("/:id/metrics", authenticate, authorize([ROLES.BUSINESS, ROLES.ADMIN]), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("employees").lean();
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (!req.user._id.equals(business.owner) && !req.user.roles.includes(ROLES.ADMIN)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Placeholder metrics - extend with actual footprint data when available
    const metrics = {
      totalEmployees: business.employees.length,
      // e.g., aggregate footprints if you store them in separate collection
    };

    res.json({ metrics });
  } catch (err) {
    console.error("get metrics", err);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

module.exports = router;
