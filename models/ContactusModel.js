const mongoose = require("mongoose");

const contactusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    default: null
  },
  phone: {
    type: String,
    default: null,
  },
  message: {
    type: String,
    default: null,
  }
}, {
    timestamps: true
});

const ContactUsModel = mongoose.model("ContactUs", contactusSchema);

module.exports = ContactUsModel;
