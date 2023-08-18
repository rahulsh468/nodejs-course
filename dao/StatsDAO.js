const TimeStatsModel = require("../models/TimeStatsModel");
const GameModel = require("../models/GameModel");
const DailyActiveWalletsModel = require("../models/DailyWalletsModel");
const PlaymosCSRModel = require("../models/CSRModel");
const ProfileModel = require("../models/AuthModel");

exports.createGameTimeRecord = async (gameId, player) => {
  try {
    const timeRecord = await TimeStatsModel.create({
      game_id: gameId,
      player_id: player,
    });

    return { Success: true, Record: timeRecord };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.getGameTimeRecord = async (details) => {
  try {
    const record = await TimeStatsModel.find(details);

    return { Success: true, Record: record };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.updateGameTimeRecord = async (details) => {
  try {
    const record = await TimeStatsModel.findOneAndUpdate(
      {
        game_id: details.game_id,
        player_id: details.player_id,
      },
      { $set: details },
      { new: true }
    );

    return { Success: true, Record: record };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// TOTAL PLAYER TIME AND MOVES
exports.getTotalTimeMovesOfPlayer = async (player) => {
  try {
    const record = await TimeStatsModel.aggregate([
      { $match: { player_id: player } },

      {
        $group: {
          _id: null,
          totalTime: { $sum: "$totalTime" },
          totalMoves: { $sum: "$moves" },
        },
      },
    ]);

    return { Success: true, Record: record.length > 0 ? record[0] : null };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// TOTAL PLAYER GAMES
exports.getTotalCompletedGamesOfPlayer = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { network: network },
        { $or: [{ player_1: player }, { player_2: player }] },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// TOTAL PLAYER WINS
exports.getTotalPlayerWins = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" }, 
        { network: network },
        { winner: player }],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player loses
exports.getTotalPlayerLoses = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { network: network },
        { result: { $ne: "Draw" } },
        { result: { $ne: "Stalemate" } },
        { result: { $ne: "Review" } },
        { winner: { $ne: player } },
        { $or: [{ player_1: player }, { player_2: player }] },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player checkmate wins
exports.getPlayerCheckmateWins = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { result: "Checkmate" },
        { winner: player },
        { network: network },
        { $or: [{ player_1: player }, { player_2: player }] },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player checkmate loses
exports.getPlayerCheckmateLoses = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { result: "Checkmate" },
        { winner: { $ne: player } },
        { network: network },
        { $or: [{ player_1: player }, { player_2: player }] },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player draws
exports.getPlayerGameDraws = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { $or: [{ result: "Draw" }, { result: "Stalemate" }] },
        { $or: [{ player_1: player }, { player_2: player }] },
        { network: network },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player resign
exports.getPlayerGameResign = async (player, network) => {
  try {
    const record = await GameModel.find({
      $and: [
        { status: "Completed" },
        { result: "Resign" },
        { winner: { $ne: player } },
        { network: network },
        { $or: [{ player_1: player }, { player_2: player }] },
      ],
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player winnings
exports.getTotalPlayerWinnings = async (player, network) => {
  try {
    const record = await GameModel.aggregate([
      {
        $match: {
          $and: [
            { winner: player }, 
            { status: "Completed" },
            { network: network },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$bid" },
        },
      },
    ]);

    return {
      Success: true,
      Record: record.length > 0 ? record[0].totalEarnings : 0,
    };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.getTotalPlayerLosings = async (player, network) => {
  try {
    const record = await GameModel.aggregate([
      {
        $match: {
          $and: [
            { winner: { $ne: player } },
            { status: "Completed" },
            { result: { $ne: "Stalemate" } },
            { result: { $ne: "Draw" } },
            { $or: [{ player_1: player }, { player_2: player }] },
            { network: network },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalLosings: { $sum: "$bid" },
        },
      },
    ]);

    return {
      Success: true,
      Record: record.length > 0 ? record[0].totalLosings : 0,
    };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// TOTAL PLAYMOS TIME AND MOVES
exports.getTotalTimeMovesOnPlaymos = async () => {
  try {
    const record = await TimeStatsModel.aggregate([
      {
        $group: {
          _id: null,
          totalTime: { $sum: "$totalTime" },
          totalMoves: { $sum: "$moves" },
        },
      },
    ]);

    return { Success: true, Record: record.length > 0 ? record[0] : null };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// total player resign
exports.getAllPlayerGames = async (player, network) => {
  try {
    const record = await TimeStatsModel.find({
      player_id: player,
      network: network 
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

// New Stats Record Details
exports.getGameLogs = async (playerId) => {
  console.log("PLAYER ID :: ", playerId);
  try {
    const games = await GameModel.aggregate([
      {
        $match: {
          $or: [{ player_1: playerId }, { player_2: playerId }],
          status: "Completed",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "player_1",
          foreignField: "walletId",
          as: "player1",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "player_2",
          foreignField: "walletId",
          as: "player2",
        },
      },
      {
        $addFields: {
          player1: { $arrayElemAt: ["$player1", 0] },
          player2: { $arrayElemAt: ["$player2", 0] },
        },
      },
      {
        $project: {
          player1: {
            userName: "$player1.userName",
            walletId: "$player1.walletId",
          },
          player2: {
            userName: "$player2.userName",
            walletId: "$player2.walletId",
          },
          winner: 1,
          status: 1,
          bid: 1,
          result: { $ifNull: ["$result", ""] },
        },
      },
    ]);
    const gameLogs = games.map((game) => ({
      player1: game.player1,
      player2: game.player2,
      winner: game.winner,
      status: game.status,
      result: game.result,
      bid: game.bid,
    }));

    return { Success: true, gameLog: gameLogs.reverse() };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

//total playmos earnings of all players
exports.getTotalPlaymosWinnings = async (network) => {
  try {
    const record = await GameModel.aggregate([
      {
        $match: { 
          $and: [
            { status: "Completed" },
            { network: network }
          ]
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$bid" },
        },
      },
    ]);
    return {
      Success: true,
      Record: record.length > 0 ? record[0].totalEarnings : 0,
    };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

//total playmos games (except pending)
exports.getTotalPlaymosGames = async (network) => {
  try {
    const record = await GameModel.find({ 
      status: { $ne: "Pending" } ,
      network: network
    });

    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.getTotalPlayers = async (network) => {
  try {
    const record = await GameModel.aggregate([
      {
        $match: {
          $and: [
            { player_1: { $ne: null } },
            { player_2: { $ne: null } },
            { status: { $ne: "Pending" } },
            { network: network }

            // pending condition because only add players who have played a game
          ],
        },
      },
      {
        $project: {
          player_1: 1,
          player_2: 1,
        },
      },
      {
        $group: {
          _id: null,
          distinctField1: { $addToSet: "$player_1" },
          distinctField2: { $addToSet: "$player_2" },
        },
      },
      {
        $project: {
          distinctValues: {
            $setUnion: ["$distinctField1", "$distinctField2"],
          },
        },
      },
    ]).exec();

    return {
      Success: true,
      Record: record.length > 0 ? record[0].distinctValues.length : 0,
    };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.getTotalWallets = async () => {
  try {
    // const record = await GameModel.aggregate([
    //     {
    //         $match: {
    //             $and: [
    //                 { player_1 : { $ne: null }},
    //                 { player_2 : { $ne: null }},
    //             ]
    //         }
    //     },
    //     {
    //       $project: {
    //         player_1: 1,
    //         player_2: 1,
    //       }
    //     },
    //     {
    //       $group: {
    //         _id: null,
    //         distinctField1: { $addToSet: '$player_1' },
    //         distinctField2: { $addToSet: '$player_2' },
    //       }
    //     },
    //     {
    //       $project: {
    //         distinctValues: {
    //           $setUnion: ['$distinctField1', '$distinctField2']
    //         }
    //       }
    //     }
    //   ]).exec();

    // return {Success: true, Record: record[0].distinctValues.length };

    const record = await ProfileModel.find({});
    return { Success: true, Record: record.length };
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.getDailyActiveWallets = async () => {
  try {
    const now = new Date(); // Get the current date
    const year = now.getFullYear(); // Get the current year
    const month = now.getMonth(); // Get the current month (0-indexed)

    const firstDayOfMonth = new Date(year, month, 1);
    firstDayOfMonth.setMonth(firstDayOfMonth.getMonth() - 1);
    const firstDayOfPreviousMonth = new Date(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      1
    );

    const previousMonth = month === 0 ? 11 : month - 1; // Adjust for zero-based indexing
    // const nextMonth = new Date(year, month + 1, 1);
    const nextMonth = new Date(year, month, 1);

    const lastDayOfMonth = new Date(nextMonth.getTime() - 1);
    const totalDaysInPreviousMonth = lastDayOfMonth.getDate();

    const record = await DailyActiveWalletsModel.aggregate([
      {
        $match: {
          Date: { $gt: firstDayOfPreviousMonth, $lte: lastDayOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalWalletsLogin: { $sum: "$walletCount" },
        },
      },
    ]);

    if (record.length === 0) return { Success: true, Record: 0 };

    const totalDays = totalDaysInPreviousMonth;
    const no_of_wallets_login = record[0].totalWalletsLogin;

    const average_daily_wallets = (no_of_wallets_login / totalDays).toFixed(2);
    return { Success: true, Record: average_daily_wallets };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getPlaymosCSREarnings = async () => {
  try {
    // const playmosCSR = await PlaymosCSRModel.find({});
    // if (playmosCSR.length === 0) return { Success: true, Record: 0 };

    // const playmosCSREarnings = playmosCSR[0].amount;
    const record = await GameModel.aggregate([
      {
        $match: { status: "Completed" },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$bid" },
        },
      },
    ]);
    const playmosCSREarnings = record.length > 0 ? record[0].totalEarnings : 0;
    return { Success: true, Record: playmosCSREarnings * 0.05 };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getAllCreatedGamesCount = async (network) => {
  try {
    const record = await GameModel.find({ network: network });
    return { Success: true, Record: record.length };
  }

  catch(error) {
    return { Success: false, Error: error.message };
  }
}

exports.getTotalPlaymosCompletedGames = async (network) => {
  try {
    const record = await GameModel.find({
      status: "Completed", 
      network: network
    });
    return { Success: true, Record: record.length };
  }

  catch(error) {
    return { Success: false, Error: error.message };
  }
}