const GameModel = require("../models/GameModel");

exports.createGame = async (details) => {
  try {
    const game = await GameModel.create(details);
    if (game._id !== null) {
      return { Success: true, Game: game };
    } else {
      return { Success: false, Error: "DAO error (createGame)" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.joinGame = async (gameId, details) => {
  try {
    const updated_game = await GameModel.findByIdAndUpdate(
      gameId,
      { $set: details },
      { new: true }
    );
    if (updated_game._id !== null) {
      return { Success: true, Game: updated_game };
    } else {
      return { Success: false, Error: "Game not found" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getGameById = async (gameId) => {
  try {
    const game = await GameModel.findById(gameId);
    return game;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
exports.getGameByIdForSchedular = async (gameId) => {
  try {
    const game = await GameModel.findOne({ _id: gameId, status: "Progress" });
    return game;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllGames = async (networkId) => {
  try {
    //GET ALL EXISITING GAMES
    const gamesList = await GameModel.find({network: networkId});
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.listGames = async (details) => {
  try {
    const status = details.status;
    const playerId = details.playerId;
    const gamesList = await GameModel.find({
      $and: [
        { status: "Pending" },
        { network: details.network },
        { player_1: { $ne: playerId } }, // IF MATCH, current player owns this game if match
        { player_2: { $ne: playerId } },
      ],
    });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getProgressGames = async (details) => {
  try {
    const status = details.status;
    const playerId = details.playerId;
    const gamesList = await GameModel.find({
      $and: [
        { status: "Progress" },
        { network: details.network },
        {
          $or: [{ player_1: playerId }, { player_2: playerId }],
        },
      ],
    });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getCreatedGames = async (details) => {
  try {
    const status = details.status;
    const playerId = details.playerId;
    const gamesList = await GameModel.find({
      $and: [
        { status: "Pending" },
        { network: details.network },
        {
          $or: [{ player_1: playerId }, { player_2: playerId }],
        },
      ],
    });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getLiveGames = async (details) => {
  try {
    const playerId = details.playerId;
    const gamesList = await GameModel.find({
      $and: [
        { status: "Progress" },
        { network: details.network },
        { player_1: { $ne: playerId } },
        { player_2: { $ne: playerId } },
      ],
    });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getPastGames = async (details) => {
  try {
    const status = details.status;
    const playerId = details.playerId;
    const gamesList = await GameModel.find({
      $and: [
        { status: { $nin: ["Progress", "Pending"] } },
        { network: details.network },
        {
          $or: [{ player_1: playerId }, { player_2: playerId }],
        },
      ],
    });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.updateGameById = async (gameId, details) => {
  try {
    const updated_game = await GameModel.findByIdAndUpdate(
      gameId,
      { $set: details },
      { new: true }
    );
    return updated_game;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};

exports.cancelGame = async (gameId, playerId) => {
  try {
    const cancelled_game = await GameModel.findOneAndDelete({
      $and: [
        {_id: gameId},
        {status: "Pending"},
        { $or: [{ player_1: playerId }, { player_2: playerId }] }
      ]
    });
    return cancelled_game;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};

exports.drawGame = async (gameId, playerId, status) => {
  try {
    const datetime = new Date();
    const now = datetime.toISOString();
    const drawGame = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          isDrawRequested: true,
          drawRequestedBy: playerId,
          status: status !== "" ? status : "Progress",
          result: status !== "Completed" ? "" : "Draw",
          lastPlayed: now,
        },
      },
      { new: true }
    );
    return drawGame;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};

exports.getDrawGames = async () => {
  try {
    const gamesList = await GameModel.find({ status: "Draw" });
    return { Success: true, List: gamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.rejectDraw = async (gameId) => {
  try {
    const rejectDraw = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          isDrawRequested: false,
          drawRequestedBy: "",
          status: "Progress",
        },
      },
      { new: true }
    );
    return rejectDraw;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};
exports.deletegame = async (gameId, status) => {
  try {
    const deletedGame = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: { status: status },
      },
      { new: true }
    );
    return deletedGame;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};
exports.resignGame = async (gameId, status, winnerId) => {
  try {
    const resignedGame = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          status: status,
          result: "Resign",
          winner: winnerId,
        },
      },
      { new: true }
    );
    return resignedGame;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};

exports.timeOut = async (gameId, status, winnerId) => {
  try {
    const timeOutGame = await GameModel.findByIdAndUpdate(
      gameId,
      {
        $set: {
          status: status,
          result: "Timeout",
          winner: winnerId,
        },
      },
      { new: true }
    );
    return timeOutGame;
  } catch (error) {
    console.log(error);
    return { Success: false, Error: error.message };
  }
};

exports.putGameUnderReview = async (boardId) => {
  try {
    const updated_game = await GameModel.findOneAndUpdate(
      { board_id: boardId },
      {
        $set: { status: "Review" },
      },
      { new: true }
    );

    return {
      Success: false,
      Game: updated_game,
      Review: true,
      Error: "There is an issue and the game has been sent for review",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
