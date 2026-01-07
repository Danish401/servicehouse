// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
// const multer = require("multer");
// const employeeRoutes = require("./routes/employeeRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const cloudinary = require("cloudinary").v2; // Import Cloudinary
// const paymentRoutes = require("./routes/paymentRoutes");
// const MongoStore = require("connect-mongo");
// require("dotenv").config();

// const authRoutes = require("./routes/auth");
// const passwordRoutes = require("./routes/password");
// const googleRoutes = require("./routes/google");
// const passport = require("passport");
// const OAuth2Strategy = require("passport-google-oauth2").Strategy;
// const User = require("./models/User");
// const app = express();
// mongoose
//   .connect(process.env.MONGO_URI, {})
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });
// const FRONTEND_URL = process.env.FRONTEND_URL;
// // Middleware
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://scintillating-strudel-82b877.netlify.app",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: "GET,POST,PUT,DELETE,PATCH",
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["Content-Disposition"],
//   })
// );

// app.use(express.json());
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "default_secret",
//     resave: false,
//     saveUninitialized: true,

//     cookie: {
//       secure: false, // Set true if using HTTPS
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     },
//   })
// );
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "uploads/pdfs")); // Save PDFs here
//   },
//   filename: (req, file, cb) => {
//     cb(null, ` ${Date.now()}-${file.originalname}`); // Save with a unique name
//   },
// });
// const upload = multer({ storage });

// app.use(passport.initialize());
// app.use(passport.session());
// const clientid = process.env.GOOGLE_CLIENT_ID;
// const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

// passport.use(
//   new OAuth2Strategy(
//     {
//       clientID: clientid,
//       clientSecret: clientsecret,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           user = new User({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email: profile.emails[0].value,
//             image: profile.photos[0].value,
//           });

//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// // initial google ouath login
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: `${FRONTEND_URL}/`, // Use FRONTEND_URL for redirection
//     failureRedirect: `${FRONTEND_URL}/login`, // Use FRONTEND_URL for redirection
//   })
// );

// app.get("/login/success", (req, res) => {
//   console.log("Is user authenticated?", req.isAuthenticated());
//   console.log("User data:", req.user);

//   if (req.isAuthenticated()) {
//     // Generate JWT token if user is authenticated
//     const token = jwt.sign(
//       { id: req.user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "2h" } // Adjust expiration as needed
//     );

//     return res.status(200).json({
//       success: true,
//       user: req.user, // This will return the user data from the session
//       token, // Return the token as part of the response
//     });
//   } else {
//     return res.status(401).json({
//       success: false,
//       message: "User not logged in",
//     });
//   }
// });
// app.post("/auth/logout/google", (req, res) => {
//   // Ensure the user is logged in via Google
//   if (req.user && req.user.googleId) {
//     // Log out from Google (using Passport or the authentication library you're using)
//     req.logout((err) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Failed to log out from Google" });
//       }
//       res.json({ message: "Logged out from Google" });
//     });
//   } else {
//     res.status(400).json({ message: "No Google session found" });
//   }
// });

// // Routes
// app.use("/api/google", googleRoutes);
// app.use("/auth", authRoutes);
// app.use("/api", passwordRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/payment", paymentRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
// const multer = require("multer");
// const employeeRoutes = require("./routes/employeeRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const cloudinary = require("cloudinary").v2; // Import Cloudinary
// const paymentRoutes = require("./routes/paymentRoutes");
// const MongoStore = require("connect-mongo");
// const http = require("http");
// const { Server } = require("socket.io");
// const chatRoutes = require("./routes/chatRoutes");
// const Chat = require("./models/Chat");
// require("dotenv").config();

// const authRoutes = require("./routes/auth");
// const passwordRoutes = require("./routes/password");
// const googleRoutes = require("./routes/google");
// const passport = require("passport");
// const OAuth2Strategy = require("passport-google-oauth2").Strategy;
// const User = require("./models/User");
// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Allow frontend domain
//     methods: ["GET", "POST"],
//   },
// });
// mongoose
//   .connect(process.env.MONGO_URI, {})
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });
// const FRONTEND_URL = process.env.FRONTEND_URL;
// // Middleware
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://scintillating-strudel-82b877.netlify.app",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: "GET,POST,PUT,DELETE,PATCH",
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["Content-Disposition"],
//   })
// );

// app.use(express.json());
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "default_secret",
//     resave: false,
//     saveUninitialized: true,

//     cookie: {
//       secure: false, // Set true if using HTTPS
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     },
//   })
// );
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "uploads/pdfs")); // Save PDFs here
//   },
//   filename: (req, file, cb) => {
//     cb(null, ` ${Date.now()}-${file.originalname}`); // Save with a unique name
//   },
// });
// const upload = multer({ storage });

// app.use(passport.initialize());
// app.use(passport.session());
// const clientid = process.env.GOOGLE_CLIENT_ID;
// const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

// passport.use(
//   new OAuth2Strategy(
//     {
//       clientID: clientid,
//       clientSecret: clientsecret,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           user = new User({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email: profile.emails[0].value,
//             image: profile.photos[0].value,
//           });

//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// // initial google ouath login
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: `${FRONTEND_URL}/`, // Use FRONTEND_URL for redirection
//     failureRedirect: `${FRONTEND_URL}/login`, // Use FRONTEND_URL for redirection
//   })
// );

// app.get("/login/success", (req, res) => {
//   console.log("Is user authenticated?", req.isAuthenticated());
//   console.log("User data:", req.user);

//   if (req.isAuthenticated()) {
//     // Generate JWT token if user is authenticated
//     const token = jwt.sign(
//       { id: req.user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "2h" } // Adjust expiration as needed
//     );

//     return res.status(200).json({
//       success: true,
//       user: req.user, // This will return the user data from the session
//       token, // Return the token as part of the response
//     });
//   } else {
//     return res.status(401).json({
//       success: false,
//       message: "User not logged in",
//     });
//   }
// });
// app.post("/auth/logout/google", (req, res) => {
//   // Ensure the user is logged in via Google
//   if (req.user && req.user.googleId) {
//     // Log out from Google (using Passport or the authentication library you're using)
//     req.logout((err) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Failed to log out from Google" });
//       }
//       res.json({ message: "Logged out from Google" });
//     });
//   } else {
//     res.status(400).json({ message: "No Google session found" });
//   }
// });

// // Routes
// app.use("/api/chat", chatRoutes);
// app.use("/api/google", googleRoutes);
// app.use("/auth", authRoutes);
// app.use("/api", passwordRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/payment", paymentRoutes);

// const activeUsers = {};
// const typingUsers = {};

// io.on("connection", (socket) => {
//   console.log("📶 User connected:", socket.id);

//   // 🟢 User joins a chat room
//   socket.on("joinRoom", ({ bookingId, userId }) => {
//     socket.join(bookingId);
//     activeUsers[userId] = socket.id;
//     console.log(`👤 User ${userId} joined chat for booking ${bookingId}`);
//   });

//   socket.on("sendMessage", async (data) => {
//     try {
//       const { bookingId, sender, senderModel, receiver, receiverModel, message, location, media } = data;

//       let chat = await Chat.findOne({ bookingId });

//       if (!chat) {
//         chat = new Chat({
//           bookingId,
//           participants: [{ user: senderModel === "User" ? sender : null, employee: senderModel === "Employee" ? sender : null }],
//           messages: [],
//           status: "Active",
//         });
//       }

//       // ✅ Save media if file exists
//       let mediaUrl = null;
//       if (media) {
//         const fileName = `uploads/${Date.now()}-${media.name}`;
//         media.mv(fileName);  // ✅ Save file
//         mediaUrl = `/${fileName}`;
//       }

//       chat.messages.push({
//         sender,
//         senderModel,
//         receiver,
//         receiverModel,
//         message,
//         media: mediaUrl,  // ✅ Store media URL in MongoDB
//         location,
//       });

//       await chat.save();
//       io.to(bookingId).emit("receiveMessage", chat.messages[chat.messages.length - 1]);  // ✅ Send message to chat room

//     } catch (error) {
//       console.error("❌ Error sending message via socket:", error);
//     }
//   });

//   // 🔴 Handle typing indicator
//   // socket.on("typing", ({ bookingId, senderName }) => {
//   //   typingUsers[bookingId] = senderName;
//   //   socket.to(bookingId).emit("userTyping", senderName);
//   // });

//   // socket.on("typing", ({ bookingId, senderName }) => {
//   //   console.log(`✍ Typing Event Received for Booking ID: ${bookingId}`); // Log the booking ID
//   //   console.log(`Sender Name: ${senderName}`); // Log the sender's name

//   //   // Emit the typing event to the room
//   //   io.to(bookingId).emit("userTyping", senderName);
//   //   console.log(`✍ Emitted 'userTyping' to Room ${bookingId}: ${senderName}`); // Log the emitted event
//   // });
//   socket.on("typing", ({ bookingId, senderName, senderModel }) => {
//     if (!senderName) {
//         console.error("❌ Missing senderName in typing event");
//         return;
//     }
//     console.log(`✍ Typing Event Received for Booking ID: ${bookingId}`);
//     console.log(`Sender Name: ${senderName}`);

//     socket.to(bookingId).emit("userTyping", { senderName, senderModel });
// });

// socket.on("stopTyping", ({ bookingId }) => {
//   if (!bookingId) {
//       console.error("❌ Missing bookingId in stopTyping event");
//       return;
//   }
//   console.log(`🛑 Stop Typing Event Received for Booking ID: ${bookingId}`);
//   socket.to(bookingId).emit("userStoppedTyping");  // ✅ Notify all users in the room
// });

//     // 🛑 Handle stop typing
//   // socket.on("stopTyping", (bookingId) => {
//   //   delete typingUsers[bookingId];
//   //   socket.to(bookingId).emit("userStoppedTyping");
//   // });

//   // 🛑 Handle user disconnection
//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id);
//     for (const userId in activeUsers) {
//       if (activeUsers[userId] === socket.id) {
//         delete activeUsers[userId];
//         break;
//       }
//     }
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const employeeRoutes = require("./routes/employeeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cloudinary = require("cloudinary").v2; // Import Cloudinary
// const paymentRoutes = require("./routes/paymentRoutes");
const MongoStore = require("connect-mongo");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/Chat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");
const googleRoutes = require("./routes/google");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const User = require("./models/User");
const paymentRoutes = require("./routes/payment");
const chatRoutess = require("./routes/chat");
require("./expireCheck");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://houseservices.netlify.app",
      "https://67ab9e9fed926fbf98bdc4a4--houseservices.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("MongoDB connected");
    
    // Verify email configuration on startup
    const { getEmailConfig, isSendGridConfigured } = require("./utils/emailTransport");
    
    if (isSendGridConfigured()) {
      console.log("✅ Email service: SendGrid API configured (recommended for Render.com)");
      console.log("   From Email:", process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || "Not set");
    } else {
      console.warn("⚠️  WARNING: SendGrid API key not found!");
      console.warn("   Render.com blocks Gmail SMTP, causing email timeouts.");
      console.warn("   To fix: Add SENDGRID_API_KEY to Render environment variables.");
      console.warn("   See SENDGRID_SETUP.md for instructions.");
      
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("   Also missing: EMAIL_USER or EMAIL_PASS (fallback to Gmail won't work)");
      } else {
        console.warn("   Falling back to Gmail SMTP (will timeout on Render.com)");
      }
      console.log(`   SMTP: ${cfg.host}:${cfg.port} secure=${cfg.secure}`);
      console.log("   (We use STARTTLS on 587 by default to avoid Render 465 timeouts)");
    }
    
    // Start server only after MongoDB connection is established
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if MongoDB connection fails
  });
const FRONTEND_URL = process.env.FRONTEND_URL;
// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://67ab9e9fed926fbf98bdc4a4--houseservices.netlify.app",
  "https://houseservices.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Normalize origin (remove trailing slash)
      const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json());
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,

    cookie: {
      secure: false, // Set true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/pdfs")); // Save PDFs here
  },
  filename: (req, file, cb) => {
    cb(null, ` ${Date.now()}-${file.originalname}`); // Save with a unique name
  },
});
const upload = multer({ storage });

app.use(passport.initialize());
app.use(passport.session());
const clientid = process.env.GOOGLE_CLIENT_ID;
const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new OAuth2Strategy(
    {
      clientID: clientid,
      clientSecret: clientsecret,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// initial google ouath login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONTEND_URL}/`, // Use FRONTEND_URL for redirection
    failureRedirect: `${FRONTEND_URL}/login`, // Use FRONTEND_URL for redirection
  })
);

app.get("/login/success", (req, res) => {
  console.log("Is user authenticated?", req.isAuthenticated());
  console.log("User data:", req.user);

  if (req.isAuthenticated()) {
    // Generate JWT token if user is authenticated
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Adjust expiration as needed
    );

    return res.status(200).json({
      success: true,
      user: req.user, // This will return the user data from the session
      token, // Return the token as part of the response
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "User not logged in",
    });
  }
});
app.post("/auth/logout/google", (req, res) => {
  // Ensure the user is logged in via Google
  if (req.user && req.user.googleId) {
    // Log out from Google (using Passport or the authentication library you're using)
    req.logout((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to log out from Google" });
      }
      res.json({ message: "Logged out from Google" });
    });
  } else {
    res.status(400).json({ message: "No Google session found" });
  }
});

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/google", googleRoutes);
app.use("/auth", authRoutes);
app.use("/api", passwordRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", chatRoutess);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const activeUsers = {}; // userId -> socket.id
const bookingUsers = {}; // bookingId -> Set of userIds
const typingUsers = {};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

io.on("connection", (socket) => {
  console.log("📶 User connected:", socket.id);

  // 🟢 User joins a chat room
  socket.on("joinRoom", ({ bookingId, userId }) => {
    socket.join(bookingId);
    activeUsers[userId] = socket.id;
    
    // Track users in booking
    if (!bookingUsers[bookingId]) {
      bookingUsers[bookingId] = new Set();
    }
    bookingUsers[bookingId].add(userId);
    
    console.log(`👤 User ${userId} joined chat for booking ${bookingId}`);
    
    // Notify other users in the room that this user is online
    socket.to(bookingId).emit("userOnline", { userId, bookingId });
  });

  // Handle user presence updates
  socket.on("userPresence", ({ userId, bookingId, isOnline }) => {
    if (bookingId && bookingUsers[bookingId]) {
      socket.to(bookingId).emit("userOnline", { userId, bookingId, isOnline });
    }
  });

  socket.on("sendMessage", async (data) => {
    try {
      const {
        bookingId,
        sender,
        senderModel,
        receiver,
        receiverModel,
        message,
        location,
        media,
      } = data;

      let chat = await Chat.findOne({ bookingId });

      if (!chat) {
        chat = new Chat({
          bookingId,
          participants: [
            {
              user: senderModel === "User" ? sender : null,
              employee: senderModel === "Employee" ? sender : null,
            },
          ],
          messages: [],
          status: "Active",
        });
      }

      // ✅ Handle base64 image data
      let mediaUrl = null;
      if (media && typeof media === "string" && media.startsWith("data:image")) {
        try {
          // Extract base64 data and file extension
          const matches = media.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const ext = matches[1] || "png";
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");
            
            // Generate filename
            const fileName = `${Date.now()}-${sender}.${ext}`;
            const filePath = path.join(uploadsDir, fileName);
            
            // Save file
            fs.writeFileSync(filePath, buffer);
            
            // Store URL (relative to server root)
            mediaUrl = `/uploads/${fileName}`;
            console.log(`✅ Image saved: ${mediaUrl}`);
          }
        } catch (err) {
          console.error("❌ Error saving base64 image:", err);
        }
      } else if (media && typeof media === "object" && media.mv) {
        // Handle file object (if sent via HTTP POST)
        const fileName = `uploads/${Date.now()}-${media.name}`;
        media.mv(fileName);
        mediaUrl = `/${fileName}`;
      }

      // Handle location object
      let locationData = null;
      if (location) {
        if (typeof location === "string") {
          try {
            locationData = JSON.parse(location);
          } catch (e) {
            locationData = location;
          }
        } else {
          locationData = location;
        }
        // Ensure location has proper structure
        if (locationData && (locationData.lat !== undefined || locationData.latitude !== undefined)) {
          locationData = {
            latitude: locationData.lat || locationData.latitude,
            longitude: locationData.lng || locationData.longitude,
            accuracy: locationData.accuracy || null,
            timestamp: locationData.timestamp || new Date().toISOString(),
          };
        }
      }

      const newMessage = {
        sender,
        senderModel,
        receiver,
        receiverModel,
        message: message || (locationData ? "📍 Location shared" : ""),
        media: mediaUrl,
        location: locationData,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      await chat.save();
      
      // Get the saved message with _id
      const savedMessage = chat.messages[chat.messages.length - 1];
      
      // Emit to all users in the room (including sender for confirmation)
      io.to(bookingId).emit("receiveMessage", savedMessage);
    } catch (error) {
      console.error("❌ Error sending message via socket:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // 🔴 Handle typing indicator
  // socket.on("typing", ({ bookingId, senderName }) => {
  //   typingUsers[bookingId] = senderName;
  //   socket.to(bookingId).emit("userTyping", senderName);
  // });

  // socket.on("typing", ({ bookingId, senderName }) => {
  //   console.log(`✍ Typing Event Received for Booking ID: ${bookingId}`); // Log the booking ID
  //   console.log(`Sender Name: ${senderName}`); // Log the sender's name

  //   // Emit the typing event to the room
  //   io.to(bookingId).emit("userTyping", senderName);
  //   console.log(`✍ Emitted 'userTyping' to Room ${bookingId}: ${senderName}`); // Log the emitted event
  // });
  socket.on("typing", ({ bookingId, senderName, senderModel }) => {
    if (!senderName) {
      console.error("❌ Missing senderName in typing event");
      return;
    }
    console.log(`✍ Typing Event Received for Booking ID: ${bookingId}`);
    console.log(`Sender Name: ${senderName}`);

    socket.to(bookingId).emit("userTyping", { senderName, senderModel });
  });

  socket.on("stopTyping", ({ bookingId }) => {
    if (!bookingId) {
      console.error("❌ Missing bookingId in stopTyping event");
      return;
    }
    console.log(`🛑 Stop Typing Event Received for Booking ID: ${bookingId}`);
    socket.to(bookingId).emit("userStoppedTyping"); // ✅ Notify all users in the room
  });

  // 🛑 Handle stop typing
  // socket.on("stopTyping", (bookingId) => {
  //   delete typingUsers[bookingId];
  //   socket.to(bookingId).emit("userStoppedTyping");
  // });

  // 🛑 Handle user disconnection
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    
    // Find which user disconnected and notify their bookings
    for (const userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        // Find all bookings this user was in
        for (const bookingId in bookingUsers) {
          if (bookingUsers[bookingId].has(userId)) {
            bookingUsers[bookingId].delete(userId);
            // Notify others in the room
            socket.to(bookingId).emit("userOffline", { 
              userId, 
              bookingId,
              lastSeen: new Date() 
            });
          }
        }
        delete activeUsers[userId];
        break;
      }
    }
  });
});
