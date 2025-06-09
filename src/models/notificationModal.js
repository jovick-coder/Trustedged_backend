const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    message: { type: String, required: true },
    onlyAdmin: { type: Boolean, default: false },
    date: { type: Date, default: Date.now() },
  }, {
  timestamps: true
}
);

module.exports = mongoose.model("Notification", notificationSchema);