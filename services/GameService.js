const GameDAO = require("../dao/GameDAO");
const BoardService = require("./BoardService");
const CastlingService = require("./CastlingService");
const ProfileDAO = require("../dao/ProfileDAO");
const TrackMovesService = require("../services/TrackMovesService");
const { createNotification } = require("../services/NotificationService");
const StatsService = require("./StatsService");
const NetworkService = require("./NetworkService");

exports.createGame = async (details) => {
  try {
    const networkNumber = details.network;
    const networkId = await NetworkService.getNetworkIdByNumber(networkNumber);

    const isWhite = details.isWhite;
    let gameObject = {
      bid: details.bid,
      contract_address: details.contract_address,
      network: networkId
    };

    if (isWhite) {
      gameObject.player_1 = details.playerId;
      gameObject.player_turn = details.playerId;
    } else {
      gameObject.player_2 = details.playerId;
    }

    const game = await GameDAO.createGame(gameObject);
    return game;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.joinGame = async (details) => {
  try {
    // const isWhite = details.isWhite;
    let isWhite = null;
    const gameId = details.gameId;

    const gameResult = await GameDAO.getGameById(gameId);

    // if((isWhite && gameResult.player_1!==null) || (!isWhite && gameResult.player_2!==null))
    //     return { Success: false, Error: 'Select another color, color already taken' };

    if (gameResult === null) return { Success: false, Error: "Game not found" };

    let player_1 = gameResult.player_1 === null ? "" : gameResult.player_1;
    let player_2 = gameResult.player_2 === null ? "" : gameResult.player_2;

    if (
      details.playerId === null ||
      player_1.toString() === details.playerId.toString() ||
      player_2.toString() === details.playerId.toString()
    )
      return { Success: false, Error: "Invalid player" };

    if (gameResult.player_1 === null) isWhite = true;
    else isWhite = false;

    if (gameResult !== null && gameResult.status === "Pending") {
      const boardResult = await BoardService.createBoard();
      const boardId = boardResult.Board._id;

      let gameObject = { status: "Progress", board_id: boardId };

      if (isWhite) {
        gameObject.player_1 = details.playerId;
        gameObject.player_turn = details.playerId;
      } else {
        gameObject.player_2 = details.playerId;
      }

      const datetime = new Date();
      const now = datetime.toISOString();
      gameObject.lastPlayed = now;

      const game = await GameDAO.joinGame(gameId, gameObject);
      const updatedGame = game.Game;

      const player_1 = updatedGame.player_1;
      const player_2 = updatedGame.player_2;

      const CastlingRecords = await CastlingService.createCastlingRecord(
        player_1,
        player_2,
        boardId
      );

      const TrackMovesRecord = await TrackMovesService.createMovesRecord(
        gameId
      );
      console.log("GAME IS ::::: ", game);

      // Create a notification here
      await createNotification({
        walletId: game.Game.player_1,
        message: `${player_2} has accepted your game request`,
        gameId: gameId,
      });

      const StatsTimeRecord = await StatsService.createGameTimeRecord(
        gameId,
        player_1,
        player_2
      );

      return game;
    } else {
      return { Success: false, Error: "Game isn't open anymore" };
    }
  } catch (error) {
    // console.log("Error");
    return { Success: false, Error: error.message };
  }
};

exports.listGames = async (details) => {
  try {
    let gamesList = null;

    const networkNumber = details.network;
    const networkId = await NetworkService.getNetworkIdByNumber(networkNumber);

    details = {
      ...details,
      network: networkId
    }

    if (details.status === "ALL") gamesList = await GameDAO.getAllGames(networkId);
    else if (details.status === "REQUESTED")
      gamesList = await GameDAO.getCreatedGames(details);
    else if (details.status === "IN_PROGRESS")
      gamesList = await GameDAO.getProgressGames(details);
    else if (details.status === "AVAILABLE")
      gamesList = await GameDAO.listGames(details);
    else if (details.status === "LIVE")
      gamesList = await GameDAO.getLiveGames(details);
    else if (details.status === "HISTORY")
      gamesList = await GameDAO.getPastGames(details);
    const populatedGamesList = await Promise.all(
      gamesList.List.map(async (game) => {
        const player1 = await ProfileDAO.getProfile(game.player_1);
        const player2 = await ProfileDAO.getProfile(game.player_2);
        const player1Data = player1
          ? {
              walletId: player1.walletId,
              name: player1.userName,
              email: player1.email,
              filename: player1.filename,
              contentType: player1.contentType,
              length: player1.length,
              uploadDate: player1.uploadDate,
              metadata: player1.metadata,
            }
          : null;
        const player2Data = player2
          ? {
              walletId: player2.walletId,
              name: player2.userName,
              email: player2.email,
              filename: player2.filename,
              contentType: player2.contentType,
              length: player2.length,
              uploadDate: player2.uploadDate,
              metadata: player2.metadata,
            }
          : null;
        return {
          _id: game._id,
          isDrawRequested: game.isDrawRequested,
          drawRequestedBy: game.drawRequestedBy,
          contract_address: game.contract_address,
          board_id: game.board_id,
          player_1: game.player_1,
          player_2: game.player_2,
          status: game.status,
          player_turn: game.player_turn,
          bid: game.bid,
          lastPlayed: game.lastPlayed,
          result: game.result,
          winner: game.winner,
          player1: player1Data,
          player2: player2Data,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          __v: game.__v,
        };
      })
    );
    return { Success: true, List: populatedGamesList };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.fetchBoardState = async (details) => {
  try {
    const gameId = details.gameId;
    const game = await GameDAO.getGameById(gameId);
    if (game == null) return { Success: false, Error: "Game not found" };

    const boardId = game.board_id;
    if (boardId === null) return { Success: false, Error: "Board not found" };

    const board = await BoardService.getBoardById(boardId);
    const moves = await TrackMovesService.getMovesListMenu(gameId);

    return { Success: true, Board: board, Moves: moves };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getGameById = async (id) => {
  try {
    const game = await GameDAO.getGameById(id);
    if (game === null) return { Success: false, Error: "Game not found" };
    const player1 = await ProfileDAO.getProfile(game.player_1);
    const player2 = await ProfileDAO.getProfile(game.player_2);
    const gameWithPlayers = {
      ...game.toObject(),
      player1: player1,
      player2: player2,
    };
    return { Success: true, Game: gameWithPlayers };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.updateGameById = async (gameId, details) => {
  try {
    const updated_game = await GameDAO.updateGameById(gameId, details);
    if (updated_game === null)
      return { Success: false, Error: "Game not found" };
    return { Success: true, Game: updated_game };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.cancelGame = async ({ gameId, playerId }) => {
  try {
    const cancelled_game = await GameDAO.cancelGame(gameId, playerId);
    if (cancelled_game === null)
      return { Success: false, Error: "Game not found" };
    return { Success: true, Game: cancelled_game };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.endGame = async (gameId, details) => {
  try {
    const updated_game = await GameDAO.updateGameById(gameId, details);
    if (updated_game === null)
      return { Success: false, Error: "Game not found" };
    return { Success: true, Game: updated_game };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.drawGame = async ({ gameId, playerId }) => {
  try {
    const gameData = await GameDAO.getGameById(gameId);
    if (gameData === null) return { Success: false, Error: "Game not found" };
    if (
      gameData.player_1.toString() === playerId.toString() ||
      gameData.player_2.toString() === playerId.toString()
    ) {
      const drawGame = await GameDAO.drawGame(gameId, playerId, "");
      if (drawGame === null)
        return { Success: false, Error: "Game Draw Error" };
      // create game draw notification here
      // playerId => User who requested Draw
      // drawGame.player_1 or player_2 should be set as walletId
      // message will be ${player_1 || player_2} has requested a draw
      await createNotification({
        walletId:
          playerId !== drawGame.player_1
            ? drawGame.player_1
            : drawGame.player_2,
        message: `${
          playerId !== drawGame.player_1 ? drawGame.player_2 : drawGame.player_1
        } has offered a draw`,
      });
      return { Success: true, Game: drawGame };
    } else {
      return { Success: false, Error: "You cannot call a gameDraw" };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.acceptDraw = async ({ gameId, playerId }) => {
  try {
    const gameData = await GameDAO.getGameById(gameId);
    if (gameData === null) return { Success: false, Error: "Game not found" };
    if (
      gameData.player_1.toString() === playerId.toString() ||
      gameData.player_2.toString() === playerId.toString()
    ) {
      const updated_game = await GameDAO.drawGame(
        gameId,
        playerId,
        "Completed"
      );
      if (updated_game === null)
        return { Success: false, Error: "Game Draw Accept Error" };
      // create game accept notfication here
      // playerId => User who accepted Draw
      // updated_game.player_1 or player_2 should be set as walletId
      // message will be ${player_1 || player_2} has requested a draw
      await createNotification({
        walletId:
          playerId !== updated_game.player_1
            ? updated_game.player_1
            : updated_game.player_2,
        message: `${
          playerId !== updated_game.player_1
            ? updated_game.player_2
            : updated_game.player_1
        } has accepted the draw`,
      });
      return { Success: true, Game: updated_game };
    } else {
      return { Success: false, Error: "You cannot accept the draw" };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.rejectDraw = async ({ gameId, playerId }) => {
  try {
    const gameData = await GameDAO.getGameById(gameId);
    if (gameData === null) return { Success: false, Error: "Game not found" };
    if (
      gameData.player_1.toString() === playerId.toString() ||
      gameData.player_2.toString() === playerId.toString()
    ) {
      const updated_game = await GameDAO.rejectDraw(gameId);
      if (updated_game === null)
        return { Success: false, Error: "Game draw Reject Error" };
      // create game reject notfication here
      // playerId => User who rejected Draw
      // updated_game.player_1 or player_2 should be set as walletId
      // message will be ${player_1 || player_2} has requested a draw
      await createNotification({
        walletId:
          playerId !== updated_game.player_1
            ? updated_game.player_1
            : updated_game.player_2,
        message: `${
          playerId !== updated_game.player_1
            ? updated_game.player_2
            : updated_game.player_1
        } has rejected the draw`,
      });
      return { Success: true, Game: updated_game };
    } else {
      return { Success: false, Error: "You cannot reject the draw" };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.resignGame = async ({ gameId, playerId }) => {
  try {
    const gameData = await GameDAO.getGameById(gameId);
    if (gameData === null) return { Success: false, Error: "Game not found" };
    if (
      gameData.player_1.toString() === playerId.toString() ||
      gameData.player_2.toString() === playerId.toString()
    ) {
      const updated_game = await GameDAO.resignGame(
        gameId,
        "Completed",
        playerId !== gameData.player_1 ? gameData.player_1 : gameData.player_2
      );
      if (updated_game === null)
        return { Success: false, Error: "Game delete Error" };
      // create game resign notfication here
      // playerId => User who resigned
      // updated_game.player_1 or player_2 should be set as walletId
      // message will be ${player_1 || player_2} has requested a draw
      await createNotification({
        walletId:
          playerId !== updated_game.player_1
            ? updated_game.player_1
            : updated_game.player_2,
        message: `${
          playerId !== updated_game.player_1
            ? updated_game.player_2
            : updated_game.player_1
        } has resigned the game`,
      });
      return { Success: true, Game: updated_game };
    } else {
      return { Success: false, Error: "You cannot call a game resign" };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.timeOut = async ({ gameId, playerId }) => {
  try {
    const gameData = await GameDAO.getGameById(gameId);
    if (gameData === null) return { Success: false, Error: "Game not found" };
    if (
      gameData.player_1.toString() === playerId.toString() ||
      gameData.player_2.toString() === playerId.toString()
    ) {
      const updated_game = await GameDAO.timeOut(
        gameId,
        "Completed",
        playerId !== gameData.player_1 ? gameData.player_1 : gameData.player_2
      );
      if (updated_game === null)
        return { Success: false, Error: "Game delete Error" };
      // create game resign notfication here
      // playerId => User who resigned
      // updated_game.player_1 or player_2 should be set as walletId
      // message will be ${player_1 || player_2} has requested a draw
      await createNotification({
        walletId:
          playerId !== updated_game.player_1
            ? updated_game.player_1
            : updated_game.player_2,
        message: `${
          playerId !== updated_game.player_1
            ? updated_game.player_2
            : updated_game.player_1
        } has resigned the game`,
      });
      return { Success: true, Game: updated_game };
    } else {
      return { Success: false, Error: "You cannot call a game timeout" };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deletegame = async (gameId) => {
  try {
    console.log("deleting game", gameId);
    const updated_game = await GameDAO.deletegame(gameId, "Completed");
    if (updated_game === null)
      return { Success: false, Error: "Game not found" };
    return { Success: true, Game: updated_game };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.putGameUnderReview = async (boardId) => {
  try {
    const updated_game = await GameDAO.putGameUnderReview(boardId);
    return updated_game;
  } catch (error) {
    throw new Error(error.message);
  }
};
