const agenda = require("../configs/Agenda");
const MovesDAO = require("../dao/TrackMovesDAO");
const GameDao = require("../dao/GameDAO");
const NotificationService = require("../services/NotificationService");
const GameDAO = require("../dao/GameDAO");
const gameService = require("../services/GameService");
const ContractService = require("../services/ContractService");

function calculateTimeDifference(date) {
  const currentTime = new Date();
  const moveTime = new Date(date);
  const timeDiff = Math.abs(moveTime.getTime() - currentTime.getTime());
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60)); // Convert milliseconds to hours
  const minutesDiff = Math.floor((timeDiff / (1000 * 60)) % 60); // Convert milliseconds to minutes
  const secondsDiff = Math.floor((timeDiff / 1000) % 60); // Convert milliseconds to seconds
  return { hours: hoursDiff, minutes: minutesDiff, seconds: secondsDiff };
}

agenda.define("checkMoves", async (job) => {
  try {
    const moves = await MovesDAO.getAllMoves();
    // console.log("moves", moves);
    if (moves.Error || !moves.Success) {
      // Set agenda service to start after 24 hours
      // console.log("MOVES IS NULL");
      const twentyFourHoursLater = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await agenda.schedule(twentyFourHoursLater, "checkMoves");
      return;
    }
    const processedMoves = []; // Array to track processed moves

    for (const movesArray of moves.Moves) {
      if (movesArray.moves.length > 0) {
        const lastMove = movesArray.moves[movesArray.moves.length - 1];
        const timeDifference = calculateTimeDifference(lastMove.date);
        const playerUID = lastMove.player;
        // console.log(timeDifference, playerUID);

        const game = await GameDAO.getGameByIdForSchedular(movesArray.game_id);
        // console.log("GAME IS :::: ", game);
        if (game === null) {
          continue;
        }

        const notificationMessage = getNotificationMessage(
          timeDifference.hours
        );

        if (notificationMessage && !processedMoves.includes(lastMove._id)) {
          const recipient =
            playerUID === game.player_1 ? game.player_2 : game.player_1;
          const notificationData = {
            walletId: recipient,
            message: notificationMessage,
          };
          await NotificationService.createNotification(notificationData);

          processedMoves.push(lastMove._id); // Add move to the processed moves array
        }

        if (timeDifference.hours >= 24 && !processedMoves.includes(game._id)) {
          await handleGameFinish(game, playerUID);

          processedMoves.push(game._id); // Add game to the processed moves array
        }
      }
    }
  } catch (error) {
    console.error("agenda: Error occurred:", error);
  }
});

async function handleGameFinish(game, playerUID) {
  const opponent = playerUID === game.player_1 ? game.player_2 : game.player_1;
  const notificationData = {
    walletId: opponent,
    message: "You have lost the game",
  };
  await NotificationService.createNotification(notificationData);

  await gameService.resignGame({
    gameId: game._id,
    playerId: opponent,
  });
  try {
    await ContractService.finishGame({
      gameId: game._id,
      // contract_address: game.contract_address,
      creatorStatus: playerUID === game.player_1 ? 2 : 1,
      takerStatus: playerUID === game.player_1 ? 1 : 2,
      playerId: opponent,
      gameCall: "Timeout"
    });
  } catch (error) {
    console.error("agenda: Error occurred in ContractService:", error);
    agenda.stop(); // Stop the scheduler in case of error
    return;
  }
}

function getNotificationMessage(hours) {
  if (hours === 8) {
    return "You have only 8 hours left to make a move";
  } else if (hours === 3) {
    return "You have only 3 hours left to make a move";
  }
  return null;
}


agenda.define("isDrawAccepted", async (job) => {
  try {
    const games = await GameDao.getDrawGames();

    for (const game of games.List) {
      const lastPlayedTime = game.lastPlayed;
      const currentTime = new Date();
      const timeDifference = Math.abs(
        currentTime.getTime() - lastPlayedTime.getTime()
      );
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

      if (hoursDifference >= 24 && game.drawRequestedBy !== null) {
        // Call finishGame to declare the specified user as the winner
        const winner = game.drawRequestedBy;
        try {
          await new ContractService().finishGame({
            gameId: game._id,
            // contract_address: game.contract_address,
            creatorStatus: winner === game.player_1 ? 1 : 2,
            takerStatus: winner === game.player_1 ? 2 : 1,
          });
        } catch (error) {
          console.error("agenda: Error occurred in ContractService:", error);
          agenda.stop(); // Stop the scheduler in case of error
          return;
        }

        // Update game status and winner in the database
        game.status = "Completed";
        game.result = 'Draw';
        game.winner = winner;
        await game.save();

        // Create a notification for the winner
        const notificationData = {
          walletId: winner,
          message: "You have won the game by accepting the draw.",
        };
        await NotificationService.createNotification(notificationData);
      }
    }
  } catch (error) {
    console.error("agenda: Error occurred:", error);
  }
});

async function startAgenda() {
  try {
    await agenda.start();
    console.log("Agenda: Scheduler started successfully");
    await agenda.every("1 minute", ["checkMoves", "isDrawAccepted"]);
    // one();
  } catch (error) {
    console.error("Agenda: Error starting scheduler:", error);
  }
}

module.exports = { startAgenda };
