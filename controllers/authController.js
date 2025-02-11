const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_secret";
const axios = require("axios");

// ✅ Store OTPs temporarily (for production, use Redis)
let otps = {};

// ✅ Function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Send OTP via Email (Using Gmail)
const sendEmailOTP = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Secure SMTP port for Gmail
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.EMAIL_USER, // Store in .env
        pass: process.env.EMAIL_PASS, // Store in .env
      },
    });

    // let info = await transporter.sendMail({
    //   from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Your OTP for Password Reset",
    //   text: `Your OTP is: ${otp}`,
    //   html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    // });
    let info = await transporter.sendMail({
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Dear User, 
    
    Your OTP for password reset is: ${otp}. 
    
    This OTP is valid for 10 minutes. 
    
    Please do not share this code with anyone. 
    
    - House Service Support Team`,
      html: `
        <p>Dear User,</p>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p><b>Please do not share this code with anyone.</b></p>
        <p>Best Regards, <br/> House Service Support Team</p>
      `,
    });
    
    console.log("OTP Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
const sendSMSOTP = async (phone, otp) => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY; // Use your API Key
    const templateName = "OTP_Verification"; // Use the exact template name

    // ✅ OTP Message in Standard Format
    const message = `Dear User, 

Your OTP for password reset is: ${otp}. 

This OTP is valid for 10 minutes. 

Please do not share this code with anyone. 

- House Service Support Team`;

    // ✅ 2Factor API URL (Replace XXXX with OTP dynamically)
    const apiUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/${templateName}`;

    const response = await axios.get(apiUrl);

    console.log("SMS sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    throw new Error("Failed to send OTP via SMS");
  }
};


// const sendSMSOTP = async (phone, otp) => {
//   try {
//     const apiKey = process.env.TWO_FACTOR_API_KEY; // Use your API Key
//     const templateName = "OTP_Verification"; // Use the exact template name

//     // ✅ 2Factor API URL (Replace XXXX with OTP dynamically)
//     const apiUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/${templateName}`;

//     const response = await axios.get(apiUrl);

//     console.log("SMS sent successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error sending SMS:", error.response?.data || error.message);
//     throw new Error("Failed to send OTP via SMS");
//   }
// };
// ✅ API to Send OTP via Email or Phone
exports.sendOTP = async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: "Either email or phone is required" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP(); // Generate 6-digit OTP

    if (email) {
      otps[email] = otp; // Store OTP temporarily
      await sendEmailOTP(email, otp);
    } else if (phone) {
      otps[phone] = otp; // Store OTP temporarily
      await sendSMSOTP(phone, otp);
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOTP:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
// exports.resetPassword = async (req, res) => {
//   const { email, otp, phone, newPassword } = req.body;
//   const identifier = email || phone;

//   // Check if OTP is valid
//   if (!otps[identifier] || otps[identifier] !== otp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   try {
//     let user;

//     // Find user by email or phone
//     if (email) {
//       user = await User.findOne({ email }).select("+password");
//     } else if (phone) {
//       user = await User.findOne({ phone }).select("+password");
//     }

//     // If user not found
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("Before Password Update:", user.password);

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password in MongoDB
//     await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });

//     console.log("After Password Update:", hashedPassword);

//     // Delete the OTP after successful password reset
//     delete otps[identifier];

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Error updating password:", err);
//     res.status(500).json({ message: "Error updating password", details: err.message });
//   }
// };
// exports.resetPassword = async (req, res) => {
//   const { email, otp,phone, newPassword } = req.body;
//   const identifier = email || phone;
//   if (!otps[identifier] || otps[identifier] !== otp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   try {
//     let user = await User.findOne({ email }).select("+password"); // Ensure we fetch password

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("Before Password Update:", user.password);

//     // ✅ Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // ✅ Update password in MongoDB
//     await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });

//     console.log("After Password Update:", hashedPassword);

//     delete otps[identifier];

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Error updating password:", err);
//     res.status(500).json({ message: "Error updating password", details: err.message });
//   }
// };




// ✅ 3️⃣ Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Fetch user and explicitly include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Stored Password:", user.password); // Debugging

    // ✅ Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: "1h" });

    // ✅ Store token in a secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

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
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, otp, phone, newPassword } = req.body;

  // Validate input
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  const identifier = email || phone;
  if (!identifier) {
    return res.status(400).json({ message: "Email or phone is required" });
  }

  // Debug: Log the identifier and OTP
  console.log("Identifier:", identifier);
  console.log("Provided OTP:", otp);
  console.log("Stored OTP for identifier:", otps[identifier]);

  // Check if OTP is valid
  if (!otps[identifier] || otps[identifier] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    let user;

    // Find user by email or phone
    if (email) {
      user = await User.findOne({ email }).select("+password");
    } else if (phone) {
      user = await User.findOne({ phone }).select("+password");
    }

    // If user not found
    if (!user) {
      console.log("User not found for identifier:", identifier);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Before Password Update:", user.password);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      console.log("Failed to update user password in MongoDB");
      return res.status(500).json({ message: "Failed to update password" });
    }

    console.log("After Password Update:", updatedUser.password);

    // Delete the OTP after successful password reset
    delete otps[identifier];

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error updating password", details: err.message });
  }
};
exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  const identifier = email || phone;

  // Validate input
  if (!identifier) {
    return res.status(400).json({ message: "Email or phone is required" });
  }

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  console.log("Identifier:", identifier);
  console.log("Provided OTP:", otp);
  console.log("Stored OTP for identifier:", otps[identifier]);

  // Check if OTP is valid
  if (!otps[identifier] || otps[identifier] !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // OTP is valid, delete OTP and allow reset password step
  delete otps[identifier];

  res.status(200).json({ message: "OTP verified successfully" });
};

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


// Delete User by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params; // Get user ID from request params

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user has an image, delete it from Cloudinary
    if (user.image) {
      const imagePublicId = user.image.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(`users/${imagePublicId}`);
    }

    await User.findByIdAndDelete(id); // Delete user from database

    res.status(200).json({ message: "User deleted successfully" });
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




