const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
// router.post("/send", chatController.sendMessage);
router.post("/send", upload.single("file"), chatController.sendMessage);

router.get("/:bookingId", chatController.getChatByBooking);
router.patch("/end/:bookingId", chatController.endChat);
router.patch("/resume/:bookingId", chatController.resumeChat);

module.exports = router;
