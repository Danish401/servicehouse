const express = require("express");
const {
  signup,
  login,
  loginSuccess,
  logout,
  getUser,
  updateUser,
  getUserById,
  getAllUsers,
} = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require("passport");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

console.log({
  signup,
  login,
  loginSuccess,
  logout,
  getUser,
  updateUser,
  getUserById,
});
router.get("/all-users", getAllUsers); // Fetch all users

router.post("/signup", upload.single("image"), signup);
router.get("/getme", getUser);
router.put("/me", authMiddleware, upload.single("image"), updateUser);
router.get("/:id", getUserById);
router.post("/login", login);
router.get("/login/success", loginSuccess);
router.post("/logout", logout);

router.get('/admin/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome to the admin dashboard, ${req.user.name}` });
});
module.exports = router;
