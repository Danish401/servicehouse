const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const jwtSecret = process.env.JWT_SECRET || "default_secret";

exports.signup = async (req, res) => {
  const { name, email, password, phone, address1, address2 ,image} = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already in use" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image to Cloudinary
    const file = req.file; // From Multer middleware
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "users", // Folder name in Cloudinary
    });

    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address1,
      address2,
      image: result.secure_url, // Save Cloudinary image URL
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Fetch All Users (GET)
exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find(); // Retrieve all users from the database
    if (!user || user.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      user: user.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


// Fetch User Data (GET)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Assuming the JWT token is used for auth and user id is passed in the token
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


exports.updateUser = async (req, res) => {
  const { name, email, password, phone, address1, address2 } = req.body;
  const userId = req.user.id; // Assuming the JWT token contains the user ID

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If password is provided, hash it
    let hashedPassword = user.password; // Default to current password if not provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Upload new image to Cloudinary if provided
    let image = user.image; // Default to current image if not provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users", // Folder name in Cloudinary
      });
      image = result.secure_url; // Update image URL
    }

    // Update user data
    user = await User.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword,
        phone: phone || user.phone,
        address1: address1 || user.address1,
        address2: address2 || user.address2,
        image: image, // Updated or current image
      },
      { new: true }
    );

    res.status(200).json({
      message: "User data updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};



exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role in token payload
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Return user info and token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        image: user.image,
        role: user.role, // Include role in response
      },
    });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ error: "Server error" });
  }
};

// Login Success Controller
exports.loginSuccess = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      user: req.user,
      message: "Login successful",
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};


exports.logout = (req, res, next) => {
  // Check if the request has a session (for Google login)
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie("connect.sid", { path: "/" }); // Clear session cookie for Google auth
        res.status(200).json({ message: "Logged out successfully (Google)" });
      });
    });
  } else {
    // For manual login (JWT-based), just clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully (Manual)" });
  }
};




