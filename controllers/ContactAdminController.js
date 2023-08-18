const express = require("express");
const router = express.Router();
const ContactUsService = require("../services/ContactUsService");

router
.get('/', async(req, res)=> {
    try {
        const data = await ContactUsService.getAllDetails();
        if(!data.Success) throw new Error(data.Error);
        else {
            return res.status(200).json({
                status: true,
                data: data.Data
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