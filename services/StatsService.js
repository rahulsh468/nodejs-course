const StatsDAO = require("../dao/StatsDAO");

const NetworkService = require('./NetworkService');

exports.createGameTimeRecord = async (gameId, player1, player2) => {
  try {
    const timeRecord1 = await StatsDAO.createGameTimeRecord(gameId, player1);
    const timeRecord2 = await StatsDAO.createGameTimeRecord(gameId, player2);

    if (timeRecord1.Success && timeRecord2.Success) {
      return {
        Success: true,
        Record1: timeRecord1,
        Record2: timeRecord2,
      };
    }
    return { Success: false, Error: "Something went wrong" };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getGameTimeRecord = async (details) => {
  try {
    const record = await StatsDAO.getGameTimeRecord(details);
    return record;
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

exports.updateGameTimeRecord = async (
  gameId,
  player,
  lastPlayed,
  currentDate
) => {
  try {
    const previous_played = new Date(lastPlayed);
    const current_played = new Date(currentDate);

    const diffInMs = current_played.getTime() - previous_played.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);

    const current_record = await this.getGameTimeRecord({
      game_id: gameId,
      player_id: player,
    });

    if (current_record.Success) {
      const data = current_record.Record[0];

      const total_time = data.totalTime + diffInSeconds;
      const total_moves = data.moves + 1;

      const details = {
        game_id: gameId,
        player_id: player,
        totalTime: total_time,
        moves: total_moves,
      };

      const record = await StatsDAO.updateGameTimeRecord(details);

      return record;
    }

    return current_record;
  } catch (error) {
    return { Success: false, Record: error.message };
  }
};

const secondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const timeString = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return timeString;
};

const secondsToDays = (seconds) => {
  const days = seconds / (60 * 60 * 24);
  return Math.round(days);
};

function convertSecondsToHours(seconds) {
  const hours = Math.floor(seconds / 3600); // Calculate the whole number of hours
  return hours;
}

// CONVERT SECONDS TO DAYS IN FORMAT DD HH:MM:SS
function convertSecondsToDHMS(seconds) {
  const milliseconds = seconds * 1000; // Convert seconds to milliseconds
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000)); // Calculate the number of whole days
  const hours = Math.floor(
    (milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  ); // Calculate the number of whole hours
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000)); // Calculate the number of whole minutes
  const remainingSeconds = Math.floor((milliseconds % (60 * 1000)) / 1000); // Calculate the number of whole seconds
  const remainingMilliseconds = milliseconds % 1000; // Calculate the remaining milliseconds

  const formattedDays = String(days).padStart(2, "0");
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedDays} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// CONVERT TIME TO HOURS DECIMAL NUMBER
function convertTimeToDecimal(time) {
  const [hours, minutes, seconds] = time.split(":"); // Split the time string into hours, minutes, and seconds

  // Convert hours, minutes, and seconds to numbers
  const parsedHours = parseInt(hours, 10);
  const parsedMinutes = parseInt(minutes, 10);
  const parsedSeconds = parseInt(seconds, 10);

  // Calculate the decimal representation of time
  const decimalTime = parsedHours + parsedMinutes / 60 + parsedSeconds / 3600;

  return decimalTime;
}

// CONVERT DECIMAL HOURS TO TIME FORMAT HH:MM:SS
function convertDecimalHoursToTime(decimalHours) {
  const hours = Math.floor(decimalHours); // Extract the whole number of hours
  const decimalMinutes = (decimalHours - hours) * 60; // Calculate the decimal representation of minutes
  const minutes = Math.floor(decimalMinutes); // Extract the whole number of minutes
  const decimalSeconds = (decimalMinutes - minutes) * 60; // Calculate the decimal representation of seconds
  const seconds = Math.floor(decimalSeconds); // Extract the whole number of seconds

  // Format the hours, minutes, and seconds as strings with leading zeros if necessary
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// CONVERT DECIMAL HOURS TO DAYS TIME IN FORMAT DD HH:MM:SS
function convertDecimalHoursToTimeDays(decimalHours) {
  const days = Math.floor(decimalHours / 24); // Extract the whole number of days
  const remainingHours = decimalHours % 24; // Calculate the remaining hours
  const hours = Math.floor(remainingHours); // Extract the whole number of hours
  const decimalMinutes = (remainingHours - hours) * 60; // Calculate the decimal representation of minutes
  const minutes = Math.floor(decimalMinutes); // Extract the whole number of minutes
  const decimalSeconds = (decimalMinutes - minutes) * 60; // Calculate the decimal representation of seconds
  const seconds = Math.floor(decimalSeconds); // Extract the whole number of seconds

  // Format the days, hours, minutes, and seconds as strings with leading zeros if necessary
  const formattedDays = String(days).padStart(2, "0");
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedDays} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// CONVERT DECIMAL SECONDS TO TIME IN FORMAT HH:MM:SS
function convertDecimalSecondsToTime(decimalSeconds) {
  const hours = Math.floor(decimalSeconds / 3600); // Extract the whole number of hours
  const remainingSeconds = decimalSeconds % 3600; // Calculate the remaining seconds
  const minutes = Math.floor(remainingSeconds / 60); // Extract the whole number of minutes
  const seconds = Math.floor(remainingSeconds % 60); // Extract the whole number of seconds

  // Format the hours, minutes, and seconds as strings with leading zeros if necessary
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

exports.getUserStats = async (player, networkNumber) => {
  try {
    const networkId = await NetworkService.getNetworkIdByNumber(networkNumber);
    const totalTimeMovesRecord = await StatsDAO.getTotalTimeMovesOfPlayer(
      player
    );

    const totalTime =
      totalTimeMovesRecord.Record === null
        ? 0
        : totalTimeMovesRecord.Record.totalTime;
    const totalMoves =
      totalTimeMovesRecord.Record === null
        ? 0
        : totalTimeMovesRecord.Record.totalMoves;
    const totalCompletedGames = await StatsDAO.getTotalCompletedGamesOfPlayer(player, networkId);
    const totalPlayerWins = await StatsDAO.getTotalPlayerWins(player, networkId);
    const totalPlayerLoses = await StatsDAO.getTotalPlayerLoses(player, networkId);
    const totalPlayerWinnings = await StatsDAO.getTotalPlayerWinnings(player, networkId);
    const totalPlayerLosings = await StatsDAO.getTotalPlayerLosings(player, networkId);

    const totalPlayerCheckmateWins = await StatsDAO.getPlayerCheckmateWins(player, networkId);
    const totalPlayerCheckmateLoses = await StatsDAO.getPlayerCheckmateLoses(player, networkId);
    const totalPlayerDrawGames = await StatsDAO.getPlayerGameDraws(player, networkId);
    const totalPlayerResignLosses = await StatsDAO.getPlayerGameResign(player, networkId);
    const totalPlayerGames = await StatsDAO.getAllPlayerGames(player, networkId);

    const record =
      totalPlayerWins.Record +
      "-" +
      totalPlayerLoses.Record +
      "-" +
      totalPlayerDrawGames.Record;
    const average_moves_perGame =
      totalMoves === 0 || totalPlayerGames.Record===0
        ? 0
        : (totalMoves / totalPlayerGames.Record).toFixed(2);
    const totalWinnings =
      totalPlayerWinnings.Record - totalPlayerLosings.Record;
    const winPercentage =
      totalPlayerWins.Record === 0
        ? 0
        : (
            (totalPlayerWins.Record / totalCompletedGames.Record) *
            100
          ).toFixed(2);
    const lossPercentage =
      totalPlayerLoses.Record === 0
      ? 0
      : (
          (totalPlayerLoses.Record / totalCompletedGames.Record) *
          100
        ).toFixed(2);
    const drawPercentage =
      totalPlayerDrawGames.Record === 0
        ? 0
        : (
            (totalPlayerDrawGames.Record / totalCompletedGames.Record) *
            100
          ).toFixed(2);
    const time_perMove =
      totalTime === 0 || totalMoves === 0
        ? 0
        : convertTimeToDecimal(secondsToTime(totalTime)) / totalMoves;
    const total_player_games = totalPlayerGames.Record;
    const total_completed_games = totalCompletedGames.Record;
    const total_playmos_time = totalTime;
    const total_wins = totalPlayerWins.Record;
    const total_loses = totalPlayerLoses.Record;
    const total_draws = totalPlayerDrawGames.Record;
    const total_checkmate_wins = totalPlayerCheckmateWins.Record;
    const total_checkmate_loses = totalPlayerCheckmateLoses.Record;
    const total_resign_loses = totalPlayerResignLosses.Record;
    const gameLogs = await StatsDAO.getGameLogs(player);
    const data = {
      record: record,
      average_moves_perGame: average_moves_perGame,
      totalWinnings: totalWinnings,
      winPercentage: winPercentage,
      lossPercentage: lossPercentage,
      drawPercentage: drawPercentage,
      time_perMove: convertDecimalHoursToTime(time_perMove),
      total_player_games: total_player_games,
      total_playmos_time: secondsToTime(total_playmos_time),
      total_wins: total_wins,
      total_loses: total_loses,
      total_draws: total_draws,
      total_completed_games: total_completed_games,
      total_checkmate_wins: total_checkmate_wins,
      total_checkmate_loses: total_checkmate_loses,
      total_resign_loses: total_resign_loses,
      gameLogs: gameLogs.gameLog,
    };

    return { Success: true, Data: data };
  } catch (error) {
    console.log(error);
    return { Success: false, Record: error.message };
  }
};


exports.getPlaymosStats = async (networkNumber) => {
  try {
    const networkId = await NetworkService.getNetworkIdByNumber(networkNumber);
    const totalTimeMovesRecord = await StatsDAO.getTotalTimeMovesOnPlaymos();

    const totalTime =
      totalTimeMovesRecord.Record === null
        ? 0
        : totalTimeMovesRecord.Record.totalTime;
    const totalMoves =
      totalTimeMovesRecord.Record === null
        ? 0
        : totalTimeMovesRecord.Record.totalMoves;
    const totalPlaymosEarnings = await StatsDAO.getTotalPlaymosWinnings(networkId);
    const totalPlaymosGames = await StatsDAO.getTotalPlaymosGames(networkId);
    const totalPlayers = await StatsDAO.getTotalPlayers(networkId);
    const totalWallets = await StatsDAO.getTotalWallets();
    const totalCreatedGames = await StatsDAO.getAllCreatedGamesCount(networkId);
    const totalPlaymosCompletedGames = await StatsDAO.getTotalPlaymosCompletedGames(networkId);

    const average_bid_perGame = (parseInt(totalPlaymosEarnings.Record)*2)/totalPlaymosCompletedGames.Record;

    const average_time_perGame =
      convertTimeToDecimal(secondsToTime(totalTime)) /
      totalPlaymosGames.Record;
    const total_players = totalPlayers.Record;
    const average_no_of_gamesPlayed =
      totalPlaymosGames.Record === 0
        ? 0
        : (totalPlaymosGames.Record / totalWallets.Record).toFixed(2);
    const average_time_perMove =
      totalMoves === 0 || totalTime === 0
        ? 0
        : totalMoves / convertTimeToDecimal(secondsToTime(totalTime));
    const average_moves_perGame = (
      totalMoves / totalPlaymosGames.Record
    ).toFixed(2);

    const dailyActiveWallets = await StatsDAO.getDailyActiveWallets();
    const playmos_csr = await StatsDAO.getPlaymosCSREarnings();

    const data = {
      totalTime: convertSecondsToDHMS(totalTime),
      totalPlaymosEarnings: totalPlaymosEarnings.Record,
      average_time_perGame:
        convertDecimalHoursToTimeDays(average_time_perGame),
      total_players: total_players,
      average_no_of_gamesPlayed: average_no_of_gamesPlayed,
      average_time_perMove: convertDecimalSecondsToTime(average_time_perMove),
      average_moves_perGame: average_moves_perGame,
      daily_active_wallets: dailyActiveWallets.Record,
      playmos_csr_earnings: playmos_csr.Record,
      total_created_games: totalCreatedGames.Record,
      average_bid_perGame: parseFloat(average_bid_perGame).toFixed(2)
    };

    return { Success: true, Data: data };
  }

  catch(error) {
    console.log(error);
    return { Success: false, Record: error.message };
  }
}