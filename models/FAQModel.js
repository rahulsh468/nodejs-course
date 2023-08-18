const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
  },
  faqs: [
    {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("FAQ", faqSchema);
