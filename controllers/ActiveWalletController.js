const ActiveWalletService = require('../services/DailyWalletsService');
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { walletId } = req.body;
    const data = await ActiveWalletService.updateDailyWalletCount(walletId);
    if(!data.Success) throw new Error("Something went wrong!");
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
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;