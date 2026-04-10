const express = require("express");
const router = express.Router();
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword } = require("../Controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
