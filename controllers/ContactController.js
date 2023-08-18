const express = require("express");
const router = express.Router();
const axios = require("axios");
const ContactUsService = require("../services/ContactUsService");

router.route("/").post(async (req, res) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.token}`
    );
    if (response.data.success) {
      const data = await ContactUsService.postDetails(req.body);
      if (!data.Success) throw new Error(data.Error);
      else {
        return res.status(200).json({
          status: true,
          data: data.Data,
        });
      }
    } else {
      return res.status(500).json({
        status: false,
        data: null,
        error: "Recaptcha failed",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
