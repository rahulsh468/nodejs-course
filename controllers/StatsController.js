const express = require("express");
const router = express.Router();
const auth = require("../middlewares/verifyUser");

const StatsService = require("../services/StatsService");

//THIRD WEB SDK IMPORTS
const { ThirdwebAuth } = require('@thirdweb-dev/auth/express');
const { PrivateKeyWallet } = require('@thirdweb-dev/auth/evm');

// THIRD WEB SETUP
const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "",
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || "")
});

router.post("/user", authMiddleware, async (req, res, next)=> {
  const user = await getUser(req);
  if(user) return next();
  else return res.status(403).json({message: "Unauthorized request after validating signature!"});
}, async (req, res) => {
  try {
    const user = await getUser(req);
    const player = user.address;

    const { network } = req.body;
    const data = await StatsService.getUserStats(player, network);
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

router.post("/playmos", async (req, res) => {
  try {
    const { network } = req.body;
    const data = await StatsService.getPlaymosStats(network);
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