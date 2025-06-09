const express = require("express");
const { sendNotification, getUserNotifications } = require("../controllers/notificationController");
const { adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", adminOnly, sendNotification); // Admin sends notification
router.get("/", getUserNotifications); // User fetches notifications

module.exports = router;