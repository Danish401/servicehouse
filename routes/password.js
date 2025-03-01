const express = require("express");
const { forgotPassword, resetPassword } = require("../controllers/passwordController");

const router = express.Router();

router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

module.exports = router;
