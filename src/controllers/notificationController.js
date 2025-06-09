const Notification = require("../models/notificationModal");
const sendMail = require("../utils/emailService");
const User = require("../models/userModel");

// create  notification
const createNotification = async ({ userId, message, mailSent }) => {
  console.log({ userId, message })
  try {

    // Save notification to database
    const notification = new Notification({ userId, message });
    const savedNotification = await notification.save();

    if (!mailSent) {
      if (userId) {
        // Send email to specific user
        const user = await User.findById(userId);
        if (user) {
          await sendMail(user.email, "New Notification", `<p>${message}</p>`);
        }
      } else {
        // Send email to all users
        const users = await User.find();
        for (const user of users) {
          await sendMail(user.email, "New Notification", `<p>${message}</p>`);
        }
      }

    }

    return savedNotification;
  } catch (error) {
    throw ({ ok: false, error: error.message });
  }
};


// Send notification
const sendNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Save notification to database
    await createNotification({ userId, message })

    if (userId) {
      // Send email to specific user
      const user = await User.findById(userId);
      if (user) {
        await sendMail(user.email, "New Notification", `<p>${message}</p>`);
      }
    } else {
      // Send email to all users
      const users = await User.find();
      for (const user of users) {
        await sendMail(user.email, "New Notification", `<p>${message}</p>`);
      }
    }

    res.status(201).json({ ok: true, message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  const { userId } = res.locals;
  try {
    const notifications = await Notification.find({
      $or: [{ userId }, { userId: null }]
    }).sort({ createdAt: -1 });

    res.status(200).json({ ok: true, notifications });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

module.exports = { sendNotification, getUserNotifications, createNotification };