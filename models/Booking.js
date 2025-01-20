const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
    {
      employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      date: { type: Date, required: true },
      time: { type: String, required: true }, // e.g., "10:30 AM"
      status: { 
        type: String, 
        enum: ["Pending", "Accepted", "Rejected", "Completed"], 
        default: "Pending" 
      },
      address: { type: String, },
      notes: { type: String },
      rating: {
        value: { type: Number, min: 1, max: 5 }, // Ratings between 1 and 5
        comment: { type: String }, // Optional customer comment for the rating
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Booking", bookingSchema);
  