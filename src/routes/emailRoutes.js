const express = require("express");
const router = express.Router();
const { sendRegistrationEmail, sendOTPEmail } = require("../controllers/emailController");

router.post("/register-email", sendRegistrationEmail);
router.post("/otp-email", sendOTPEmail);

module.exports = router;
