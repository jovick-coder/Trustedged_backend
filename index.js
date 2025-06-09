const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./src/config/db");
const express = require("express");
const emailRoutes = require("./src/routes/emailRoutes");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const notificationRoute = require("./src/routes/notificationRoutes");
const bankRoute = require("./src/routes/bankRoutes");
const { protect } = require("./src/middleware/authMiddleware");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", protect, userRoutes);
app.use("/api/notification", protect, notificationRoute);
app.use("/api/bank", protect, bankRoute);
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;