const Razorpay = require("razorpay");
require("dotenv").config(); // Load environment variables

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Ensure this is defined
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Ensure this is defined
});

module.exports = razorpay;
