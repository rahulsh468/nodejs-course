const express = require("express");
const ContractService = require("../services/ContractService");
const router = express.Router();
const auth = require("../middlewares/verifyUser");
router.post("/finishGame", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const result = await ContractService.finishGame(reqBody_details);
    console.log("RESUT AFTERFSISISNISIS ::::: ", result);
    if (result.Success) {
      return res.status(200).json({
        Success: true,
        message: result.message,
        Game: result.Game,
        resign: result.resign,
        staleMate: result.staleMate,
        kingExposingMove: result.kingExposingMove,
        Moves: result.Moves,
        checkmate: result.checkmate,
      });
    } else {
      return res.status(500).json({
        status: false,
        data: null,
        message: result.message,
        error: "Error in resolving payment",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = router;
