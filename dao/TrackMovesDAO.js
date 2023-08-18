const MovesModel = require("../models/MovesModel");
const GameModel = require("../models/GameModel");
exports.createMovesRecord = async (gameId) => {
  try {
    const movesRecord = await MovesModel.create({
      game_id: gameId,
      moves: [],
    });

    return movesRecord;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAllMoves = async () => {
  try {
    const inProgressGames = await GameModel.find({ status: "Progress" }).select(
      "_id"
    );
    const gameIds = inProgressGames.map((game) => game._id);

    const allMoves = await MovesModel.find({ game_id: { $in: gameIds } });

    if (allMoves.length > 0) {
      return { Success: true, Moves: allMoves };
    } else {
      return { Success: false, Error: "No moves found for games in progress" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.addMoveToList = async (gameId, movesObject) => {
  try {
    const movesList = await MovesModel.find({ game_id: gameId });
    const new_list = movesList[0].moves;

    new_list.push(movesObject);

    const updatedMovesList = await MovesModel.findOneAndUpdate(
      {
        game_id: gameId,
      },
      {
        $set: {
          moves: new_list,
        },
      },
      { new: true }
    );

    return updatedMovesList;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getMovesListMenu = async (gameId) => {
  try {
    const movesList = await MovesModel.findOne({ game_id: gameId });
    const list = movesList.moves;

    return list;
  } catch (error) {
    throw new Error(error.message);
  }
};


exports.getAllMovesInString = async (gameId) => {
  try {
    const movesList = await MovesModel.findOne({ game_id: gameId });
    let movesString = "";
    for (let i = 0; i < movesList.moves.length; i++) {
      const move = movesList.moves[i];
      movesString += `${move.current_pgn} ${move.new_pgn} `;
    }
    movesString = movesString.trim();
    return movesString;
  } catch (error) {
    console.error(error);
    return { Success: false, Error: error.message };
  }
};
