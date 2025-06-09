const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/emailService");
const otpModal = require("../models/otpModal");

const generateToken = (user) => {
  return jwt.sign({ uId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};


async function verifyOTP({ to, otp }) {
  return await otpModal.findOne({ to: to, otp: otp });

}

function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
function generateAccountNumber() {
  // Declare a digits variable
  // which stores all digits
  var digits = "01234567890987654321";
  let accountNumber = "";
  for (let i = 0; i < 10; i++) {
    accountNumber += digits[Math.floor(Math.random() * 10)];
  }
  return accountNumber;
}
// User Registration
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender, country, age, username } = req.body;

    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      password: hashedPassword,
      gender,
      country,
      age, account: {
        number: generateAccountNumber(),
        balance: 0,
        name: fullName
      },
    });

    await newUser.save();

    // Send welcome email
    const subject = "Welcome to Banking App!";
    const htmlContent = `
      <h2>Hello ${fullName},</h2>
      <p>Thank you for registering with us.</p>
      <p>Enjoy seamless banking services.</p>
    `;
    await sendEmail(email, subject, htmlContent);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (user.deleted) return res.status(400).json({ error: "Account was been deleted" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    // Send login notification email
    const subject = "New Login Alert!";
    const htmlContent = `
      <h2>Hello ${user.fullName},</h2>
      <p>Your account was just accessed.</p>
      <p>If this wasn't you, please secure your account immediately.</p>
    `;
    await sendEmail(user.email, subject, htmlContent);

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // input validation
    if (!email || !otp) {
      return res.status(400).json({ error: "Please fill all fields" });
    }


    let accountObject = await User.findOne({ email });
    if (!accountObject || accountObject === "") {
      return res
        .status(404)
        .send({ ok: false, message: "Account with email not found" });
    }

    const verify = await verifyOTP({ to: email, otp });
    if (!verify) return res.status(400).json({ error: "Invalid OTP" });


    let updateUser = await User.updateOne(
      { _id: accountObject._id },
      { emailVaried: true }
    );

    // delete otp
    await otpModal.deleteOne({ to: email, otp: otp });
    return res.status(200).send({
      ok: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // input validation
    if (!email || !otp) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    if (!password || password === "") {
      return res.status(400).send({ ok: false, message: "Password is required" });
    }


    let accountObject = await User.findOne({ email });
    if (!accountObject || accountObject === "") {
      return res
        .status(404)
        .send({ ok: false, message: "Account with email not found" });
    }

    const verify = await verifyOTP({ to: email, otp });
    if (!verify) return res.status(400).json({ error: "Invalid OTP" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let updateUser = await User.updateOne(
      { _id: accountObject._id },
      { password: hashedPassword }
    );


    // delete otp
    await otpModal.deleteOne({ to: email, otp: otp });
    return res.status(200).send({
      ok: true,
      message: "Password was not updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, generateOTP, verifyEmail, resetPassword };
