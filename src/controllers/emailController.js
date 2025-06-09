const otpModal = require("../models/otpModal");
const sendEmail = require("../utils/emailService");
const { generateOTP } = require("./authController");

const sendRegistrationEmail = async (req, res) => {
  const { email, fullName } = req.body;

  const subject = "Welcome to Banking App!";
  const htmlContent = `
    <h2>Hello ${fullName},</h2>
    <p>Thank you for registering on our platform.</p>
    <p>Enjoy seamless banking with us.</p>
  `;

  const success = await sendEmail(email, subject, htmlContent);
  if (success) {
    return res.status(200).json({ message: "Registration email sent." });
  }
  res.status(500).json({ error: "Failed to send email" });
};

const sendLoginNotification = async (email, fullName) => {
  const subject = "New Login Alert!";
  const htmlContent = `
    <h2>Hello ${fullName},</h2>
    <p>Your account was just accessed.</p>
    <p>If this wasn't you, please secure your account immediately.</p>
  `;

  return await sendEmail(email, subject, htmlContent);
};

const sendTransferStatusEmail = async (email, fullName, amount, status) => {
  const subject = `Transaction ${status ? "Successful" : "Failed"}`;
  const htmlContent = `
    <h2>Hello ${fullName},</h2>
    <p>Your transfer of $${amount} was <strong>${status ? "successful" : "unsuccessful"}</strong>.</p>
    <p>${status ? "Your account balance has been updated." : "Please try again later."}</p>
  `;

  return await sendEmail(email, subject, htmlContent);
};

const sendOTPEmail = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  const subject = `Account OTP`;
  const htmlContent = `
    <h2>Hello,</h2>
    <p>Your OTP is: <strong>${otp}</strong></p>
  `;
  let otpObject = new otpModal({
    to: email,
    otp: otp,
  });
  const newOtp = await otpObject.save();

  const success = await sendEmail(email, subject, htmlContent);
  if (success) {
    return res.status(200).json({ message: "OTP email sent." });
  }
  res.status(500).json({ error: "Failed to send email" });
};

module.exports = {
  sendRegistrationEmail,
  sendLoginNotification,
  sendTransferStatusEmail,
  sendOTPEmail
};
