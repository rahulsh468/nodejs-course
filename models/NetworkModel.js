const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const networkSchema = new Schema(
  {
    Network_id: {
      type: Number,
      required: true,
      unique: true
    },
    Network_name: {
      type: String,
      default: null,
      required: true
    },
    Currency_label: {
      type: String,
      default: null,
      required: true
    },
    Contract_address: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const NetworkModel = mongoose.model("Network", networkSchema);
module.exports = NetworkModel;
