// // const express = require("express");
// // const Razorpay = require("razorpay");
// // const crypto = require("crypto");
// // const User = require("../models/User");
// // const router = express.Router();

// // const razorpay = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_SECRET,
// // });

// // // Prices in paise (₹49 → 4900)
// // const PLAN_PRICES = {
// //   "Silver Plan": 4900,
// //   "Golden Plan": 9900,
// //   "Platinum Plan": 14900,
// // };

// // router.post("/create-order", async (req, res) => {
// //   const { plan, userEmail } = req.body;

// //   if (!PLAN_PRICES[plan]) return res.status(400).json({ error: "Invalid plan" });

// //   const options = {
// //     amount: PLAN_PRICES[plan],
// //     currency: "INR",
// //     receipt: `receipt_${Date.now()}`,
// //   };

// //   try {
// //     const order = await razorpay.orders.create(options);
// //     res.json({ orderId: order.id });
// //   } catch (err) {
// //     res.status(500).json({ error: "Error creating order" });
// //   }
// // });

// // router.post("/verify", async (req, res) => {
// //   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, email } = req.body;

// //   const hmac = crypto
// //     .createHmac("sha256", process.env.RAZORPAY_SECRET)
// //     .update(razorpay_order_id + "|" + razorpay_payment_id)
// //     .digest("hex");

// //   if (hmac === razorpay_signature) {
// //     const expiryDate = new Date();
// //     expiryDate.setDate(expiryDate.getDate() + 30);

// //     await User.findOneAndUpdate(
// //       { email },
// //       {
// //         isPremium: true,
// //         premiumPlan: plan,
// //         premiumExpiry: expiryDate,
// //       },
// //       { upsert: true }
// //     );

// //     res.json({ success: true });
// //   } else {
// //     res.status(400).json({ success: false, message: "Invalid Signature" });
// //   }
// // });

// // module.exports = router;

// const express = require('express');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const router = express.Router();
// const User = require('../models/User');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// router.post('/orders', async (req, res) => {
//   const { amount } = req.body;
//   try {
//     const options = {
//       amount: amount * 100,
//       currency: 'INR',
//       receipt: `receipt_order_${Date.now()}`,
//     };
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: 'Order creation failed' });
//   }
// });

// router.post('/verify', async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

//   const body = razorpay_order_id + '|' + razorpay_payment_id;
//   const expectedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_SECRET)
//     .update(body.toString())
//     .digest('hex');

//   if (expectedSignature === razorpay_signature) {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + 30);

//     await User.findByIdAndUpdate(userId, {
//       isPremium: true,
//       premiumPlan: plan,
//       premiumExpiry: expiryDate,
//     });

//     res.json({ success: true });
//   } else {
//     res.status(400).json({ error: 'Invalid payment signature' });
//   }
// });

// module.exports = router;

// routes/payment.js

// const express = require('express');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const router = express.Router();
// const User = require('../models/User');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// // Create order route
// router.post('/orders', async (req, res) => {
//   const { amount } = req.body;

//   try {
//     const options = {
//       amount, // ✅ already in paise
//       currency: 'INR',
//       receipt: `receipt_order_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Order creation failed' });
//   }
// });

// // Verify payment and update user
// router.post('/verify', async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     userId,
//     plan,
//   } = req.body;

//   const body = `${razorpay_order_id}|${razorpay_payment_id}`;

//   const expectedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_SECRET)
//     .update(body.toString())
//     .digest('hex');

//   if (expectedSignature === razorpay_signature) {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + 30);

//     await User.findByIdAndUpdate(userId, {
//       isPremium: true,
//       premiumPlan: plan,
//       premiumExpiry: expiryDate,
//     });

//     res.json({ success: true });
//   } else {
//     res.status(400).json({ error: 'Invalid payment signature' });
//   }
// });

// module.exports = router;

// const express = require("express");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const router = express.Router();
// const User = require("../models/User");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// // CREATE ORDER
// router.post("/orders", async (req, res) => {
//   const { amount } = req.body;

//   if (!amount) return res.status(400).json({ error: "Amount is required" });

//   try {
//     const options = {
//       amount: amount * 100, // 👈 convert ₹ to paise
//       currency: "INR",
//       receipt: `receipt_order_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (err) {
//     console.error("Order creation error:", err);
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// // VERIFY PAYMENT
// router.post("/verify", async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     userId,
//     plan,
//   } = req.body;

//   const body = `${razorpay_order_id}|${razorpay_payment_id}`;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(body)
//     .digest("hex");

//   if (expectedSignature !== razorpay_signature) {
//     return res.status(400).json({ error: "Invalid payment signature" });
//   }

//   const expiryDate = new Date();
//   expiryDate.setDate(expiryDate.getDate() + 30);

//   await User.findByIdAndUpdate(userId, {
//     isPremium: true,
//     premiumPlan: plan,
//     premiumExpiry: expiryDate,
//   });

//   res
//     .status(200)
//     .json({ success: true, message: "Payment verified and user upgraded" });
// });

// module.exports = router;

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ CREATE ORDER
router.post("/orders", async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  try {
    const options = {
      amount: parseInt(amount) * 100, // ₹ to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error("🔴 Razorpay order creation failed:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ✅ VERIFY PAYMENT & UPGRADE USER
router.post("/verify", async (req, res) => {
  try {
    let {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      id,
    } = req.body;

    userId = userId || id; // Fallback if frontend sends `id` not `userId`

    console.log("🔍 Incoming payload:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !plan
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isPremium: true,
        premiumPlan: plan,
        premiumExpiry: expiryDate,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and user upgraded",
      user: updatedUser,
    });
  } catch (err) {
    console.error("🔴 Payment verification error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
