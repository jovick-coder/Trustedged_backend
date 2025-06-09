const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");



// Get User Profile (Protected)
const getUserProfile = async (req, res) => {
  const { userId, isAdmin } = res.locals;
  try {
    const user = await User.findById({ _id: userId }).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all User Profile (Protected)
const getAllUserProfile = async (req, res) => {
  const { userId, isAdmin } = res.locals;
  const { userID } = req.query;

  let query = {};
  if (userID) {
    query.userId = userID;
  }
  try {
    let users = await User.find(query).select("-password");
    users = users.filter((user) => !user.deleted);
    res.status(200).json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile (Protected)
const updateUserProfile = async (req, res) => {
  const { userId } = res.locals;
  let profileUpdate = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (profileUpdate.newPassword) {
      if (!profileUpdate.oldPassword || profileUpdate.oldPassword === "")
        return res
          .status(400)
          .send({ true: false, message: "Provide old password" });
      if (!profileUpdate.newPassword || profileUpdate.newPassword === "")
        return res
          .status(400)
          .send({ true: false, message: "Provide new password" });
      const validPassword = bcrypt.compare(profileUpdate.oldPassword, user.password);
      // console.log("validPassword", user);

      if (!validPassword) {
        return respond(res, 400, {
          ok: false,
          message: "Previous password incorrect",
        });
      }
      const salt = await bcrypt.genSalt(10);
      profileUpdate.password = await bcrypt.hash(password, salt);
    }

    let newProfileUpdate = await User.updateOne({ _id: userId }, profileUpdate);
    if (!newProfileUpdate.acknowledged) {
      return res
        .status(404)
        .send({ ok: false, message: "Profile was not updated" });
    }
    return res.send({ ok: true, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Disable Account Toggle (Protected, Admin Only)
const toggleUserAccount = async (req, res) => {
  const { userId, isAdmin } = res.locals;
  const { targetUserId } = req.body;

  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ message: `User account ${user.isActive ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete user account by making deleted true
const deleteUserAccount = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.deleted = true;
    await user.save();
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, getAllUserProfile, updateUserProfile, toggleUserAccount, deleteUserAccount };