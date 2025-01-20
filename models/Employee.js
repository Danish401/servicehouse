const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, required: true },
    speciality: { type: String, required: true },
    phone: { type: String,  }, // Added phone field
    education: { type: String },
    address1: { type: String },
    address2: { type: String },
    experience: { type: Number },
    fees: { type: Number },
    about: { type: String },
    image: { type: String },
    availability: [{ date: String, timeSlots: [String] }], // Dates and time slots the employee is available
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
