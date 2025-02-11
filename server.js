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






const express = require("express");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const employeeRoutes = require("./routes/employeeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cloudinary = require("cloudinary").v2; // Import Cloudinary
const paymentRoutes = require("./routes/paymentRoutes");
const MongoStore = require("connect-mongo");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/Chat");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");
const googleRoutes = require("./routes/google");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const User = require("./models/User");
const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://houseservices.netlify.app"
      "https://67ab9e9fed926fbf98bdc4a4--houseservices.netlify.app", // Netlify preview
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
const FRONTEND_URL = process.env.FRONTEND_URL;
// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://67ab9e9fed926fbf98bdc4a4--houseservices.netlify.app",
     "https://houseservices.netlify.app"
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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

const activeUsers = {};
const typingUsers = {};

io.on("connection", (socket) => {
  console.log("📶 User connected:", socket.id);

  // 🟢 User joins a chat room
  socket.on("joinRoom", ({ bookingId, userId }) => {
    socket.join(bookingId);
    activeUsers[userId] = socket.id;
    console.log(`👤 User ${userId} joined chat for booking ${bookingId}`);
  });

 
  socket.on("sendMessage", async (data) => {
    try {
      const { bookingId, sender, senderModel, receiver, receiverModel, message, location, media } = data;
  
      let chat = await Chat.findOne({ bookingId });
  
      if (!chat) {
        chat = new Chat({
          bookingId,
          participants: [{ user: senderModel === "User" ? sender : null, employee: senderModel === "Employee" ? sender : null }],
          messages: [],
          status: "Active",
        });
      }
  
      // ✅ Save media if file exists
      let mediaUrl = null;
      if (media) {
        const fileName = `uploads/${Date.now()}-${media.name}`;
        media.mv(fileName);  // ✅ Save file
        mediaUrl = `/${fileName}`;
      }
  
      chat.messages.push({
        sender,
        senderModel,
        receiver,
        receiverModel,
        message,
        media: mediaUrl,  // ✅ Store media URL in MongoDB
        location,
      });
  
      await chat.save();
      io.to(bookingId).emit("receiveMessage", chat.messages[chat.messages.length - 1]);  // ✅ Send message to chat room
  
    } catch (error) {
      console.error("❌ Error sending message via socket:", error);
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
  socket.to(bookingId).emit("userStoppedTyping");  // ✅ Notify all users in the room
});

    // 🛑 Handle stop typing
  // socket.on("stopTyping", (bookingId) => {
  //   delete typingUsers[bookingId];
  //   socket.to(bookingId).emit("userStoppedTyping");
  // });

  // 🛑 Handle user disconnection
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (const userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
