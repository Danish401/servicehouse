const Payment = require("../models/Payment");
const razorpayInstance = require("../razorpay");
const crypto = require("crypto");

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { bookingId, customerId, amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in smallest currency unit (e.g., paise for INR)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    const payment = new Payment({
      booking: bookingId,
      customer: customerId,
      amount: amount,
      method: "Online",
      razorpayOrderId: order.id,
      status: "Pending",
    });

    await payment.save();

    res.status(201).json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating payment order." });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    // Generate the expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // Compare the signatures
    if (generatedSignature === razorpaySignature) {
      // If signature matches, mark the payment as successful
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature,
          status: "Completed",
        },
        { new: true }
      );

      res.status(200).json({ message: "Payment verified successfully.", payment });
    } else {
      res.status(400).json({ message: "Invalid signature." });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment." });
  }
};
