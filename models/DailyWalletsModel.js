//Auth model go here
const mongoose = require("mongoose");

const dailyWalletsSchema = new mongoose.Schema({
  Date: {
    type: Date,
    required: true,
    default: null,
  },
  DateString: {
    type: String,
    required: true
  }, 
  walletCount: {
    type: Number,
    required: true,
  }
}, {
    timestamps: true
});

const DailyWalletsModel = mongoose.model("DailyWallet", dailyWalletsSchema);

module.exports = DailyWalletsModel;
