const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z][a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, "Invalid email format"],
  },

  password: { 
    type: String, 
    required: function () { return !this.googleId; } // Password required if not using Google login
  },

  googleId: { type: String }, // Google Login ID

  phone: {
    type: String,
    unique: true,
    required: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
  },

  address1: { type: String },
  address2: { type: String },

  image: { type: String }, // Optional: No validation required

  role: { type: String, enum: ["user", "admin"], default: "user" }, // Default role = user
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, default: null },
  premiumExpiry: { type: Date, default: null },
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
