//Auth model go here
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    default: null,
  },
  walletId: {
    type: String,
    required: true,
  },
  lastInteracted: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  email: {
    type: String,
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  cloudinaryUrl: {
    type: String,
  },
  cloudinaryPublicId: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
