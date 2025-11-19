// models/User.js
const mongoose = require("mongoose");
const { ROLES } = require("../utils/roles");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  roles: { type: [String], default: [ROLES.USER] }, // array of roles
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", default: null },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// don't return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
