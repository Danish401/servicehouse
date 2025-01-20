const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;


const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;  // Ensure you're getting the token from the request

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this is your client ID
    });
    const payload = ticket.getPayload();
    // Proceed with login logic here
    res.status(200).json(payload); // Example response
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
});

router.get("/logout", (req, res) => {
  // Destroy the user session
  req.logout((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Clear session and cookies
    req.session.destroy((err) => {
      if (err) {
        console.error("Session Destruction Error:", err);
        return res.status(500).json({ success: false, message: "Session destruction failed" });
      }
      res.clearCookie("connect.sid"); // Clear session cookie

      // Optionally redirect to Google Logout URL
      const googleLogoutURL =
        "https://accounts.google.com/logout"; // This URL logs the user out of Google
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        googleLogoutURL,
      });
    });
  });
});


module.exports = router;
