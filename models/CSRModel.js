const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CSRSchema = new Schema({
  amount: {
    type: Number,
    default: 0,
    required: true,
  },
  privateAddress: {
    type: String,
    required: true,
    default: null,
  },
});

const CSRModel = mongoose.model("csrEarning", CSRSchema);
module.exports = CSRModel;
