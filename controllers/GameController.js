const express = require("express");
const router = express.Router();

const GameService = require("../services/GameService");
const MovesService = require("../services/MovesService");
const PersistMoveService = require("../services/PersistMoveService");
const TrackMovesService = require("../services/TrackMovesService");
const auth = require("../middlewares/verifyUser");
router.post("/createGame", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const created_game = await GameService.createGame(reqBody_details);
    if (created_game.Success) {
      return res.status(200).json({
        status: true,
        data: created_game.Game,
        message: "Created game successfully",
        error: null,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Operation error",
        error: created_game.Error,
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

router.post("/joinGame", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const joined_game = await GameService.joinGame(reqBody_details);
    if (joined_game.Success) {
      return res.status(200).json({
        status: true,
        data: joined_game.Game,
        message: "Joined game successfully",
        error: null,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Operation error",
        error: joined_game.Error,
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

//TODO : compare playerId with gamePlayer depending on color
router.post("/validMoves", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const moves = await MovesService.validMoves(reqBody_details);

    if (!moves.Success) {
      return res.status(200).json({
        status: false,
        data: null,
        message: "Fail",
        error: moves.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: moves.Moves,
      message: moves.message ? moves.message : "Fetched valid moves",
      checkmate: moves.checkmate,
      stalemate: moves.staleMate,
      kingExposingMove: moves.kingExposingMove,
      isKingsideEnabled: moves.isKingsideEnabled
        ? moves.isKingsideEnabled
        : false,
      isQueensideEnabled: moves.isQueensideEnabled
        ? moves.isQueensideEnabled
        : false,
      Game: moves.Game !== null ? moves.Game : {},
      kingInCheck: moves.kingInCheck ? moves.kingInCheck : false,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/list", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };

    const gamesList = await GameService.listGames(reqBody_details);

    if (!gamesList.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: gamesList.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: gamesList.List,
      message: "Fetched open games",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const cancelledGame = await GameService.cancelGame(reqBody_details);

    if (!cancelledGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: cancelledGame.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: cancelledGame.Game,
      message: "Game deleted successfully",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/drawGame", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const drawGame = await GameService.drawGame(reqBody_details);

    if (!drawGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: drawGame.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: drawGame.Game,
      message: "Game Draw Called successfully",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/acceptDraw", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const drawGame = await GameService.acceptDraw(reqBody_details);

    if (!drawGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: drawGame.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: drawGame.Game,
      message: "Game Draw Accepted",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.post("/rejectDraw", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const drawGame = await GameService.rejectDraw(reqBody_details);

    if (!drawGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: drawGame.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: drawGame.Game,
      message: "Game Draw Rejected",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/resignGame", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const resignGame = await GameService.resignGame(reqBody_details);

    if (!resignGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: resignGame.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: resignGame.Game,
      message: "Game Resigned",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/state", async (req, res) => {
  try {
    const game = await GameService.fetchBoardState(req.body);

    if (!game.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: game.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: game.Board,
      Moves: game.Moves,
      message: "Fetched game state",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/makeMove", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["playerId"]: req.user
    };
    const record = await PersistMoveService.makeMove(reqBody_details);

    if (!record.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: record.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: record.Data,
      message: record.message ? record.message : "Fetched updated record",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/id", async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = await GameService.getGameById(gameId);

    if (!game.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: game.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: game.Game,
      message: "Fetched game by id",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.delete("/deletGame/:gameId", async (req, res) => {
  try {
    console.log(req.params.gameId);
    const deleteGame = await GameService.deletegame(req.params.gameId);

    if (!deleteGame.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: record.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: "game deteled",
      message: "Fetched updated record",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/backward", async (req, res) => {
  try {
    const backwardState = await TrackMovesService.getBackwardState(req.body);

    if (!backwardState.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: backwardState.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: backwardState.Board,
      message: "Fetched backward state",
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/forward", async (req, res) => {
  try {
    const forwardState = await TrackMovesService.getForwardState(req.body);

    if (!forwardState.Success) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Fail",
        error: forwardState.Error,
      });
    }

    return res.status(200).json({
      status: true,
      data: forwardState.Board,
      message: "Fetched backward state",
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
