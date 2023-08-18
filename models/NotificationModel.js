const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  gameId: {
    type: mongoose.Types.ObjectId,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
