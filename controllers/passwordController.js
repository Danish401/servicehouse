const User = require("../models/User");  // Make sure to import the User model
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const bcrypt = require('bcrypt');  // Ensure bcrypt is imported
let otps = {};  // Temporary store for OTPs, can be changed to a more persistent store

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otps[email] = otp;

    // Send OTP to the user's email
    await sendMail(email, otp);

    // Respond with success
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Error processing request" });
  }
};


exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    if (otps[email] && otps[email] === otp) {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
  
        // Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);  // Adjust the salt rounds as necessary
        const hashedPassword = await bcrypt.hash(newPassword, salt);
  
        user.password = hashedPassword;  // Save the hashed password
        await user.save();
  
        delete otps[email];  // Delete the OTP after successful reset
  
        res.status(200).json({ message: "Password updated successfully" });
      } catch (err) {
        // Log the actual error for debugging
        console.error("Error updating password:", err);
        res.status(500).json({ message: "Error updating password", error: err.message });
      }
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  };
