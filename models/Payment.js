const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["Online", "Cash"], required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    razorpayOrderId: { type: String }, // Razorpay Order ID
    razorpayPaymentId: { type: String }, // Razorpay Payment ID
    razorpaySignature: { type: String }, // Razorpay Signature
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
