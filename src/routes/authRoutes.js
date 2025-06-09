const express = require("express");
const { registerUser, loginUser, getUserProfile, verifyEmail, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
