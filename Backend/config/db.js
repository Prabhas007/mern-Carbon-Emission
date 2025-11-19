// config/db.js
const mongoose = require("mongoose");

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      // Mongoose 7 removes many options, defaults are sensible
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
