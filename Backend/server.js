// server.js (entry)
require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const footprintsRoutes = require("./routes/footprints");
const authRoutes = require("./routes/auth");
const tipsRoutes = require("./routes/tips");
const businessRoutes = require("./routes/business");
const adminRoutes = require("./routes/admin");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecotrackify";

connectDB(MONGO_URI)

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*", // restrict in production
  credentials: true
}));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/footprints", footprintsRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/admin", adminRoutes);

// simple health
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));

// global error handler (fallback)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Ecotrackify API listening on port ${PORT}`);
});
