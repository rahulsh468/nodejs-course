const mongoose = require("mongoose");

const pageContentSchema = new mongoose.Schema({
  pageName: {
    type: String,
    unique: true,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  cloudinaryUrl: {
    type: String,
  },
  cloudinaryPublicId: {
    type: String,
  },
});

module.exports = mongoose.model("PageContent", pageContentSchema);
