const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getUserProfile, getAllUserProfile, toggleUserAccount, updateUserProfile, deleteUserAccount, changeUserAccountCurrency } = require("../controllers/profileController");

const router = express.Router();

router.get("/", adminOnly, getAllUserProfile);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/", adminOnly, toggleUserAccount);
router.put("/currency", adminOnly, changeUserAccountCurrency);
router.delete("/", adminOnly, deleteUserAccount);

module.exports = router;
