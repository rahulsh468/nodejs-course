const DBRModel = require('../models/DBRModel');

exports.updateDBRRecord = async(gameId, state=[]) => {
    try {
        const record = await DBRModel.findOneAndUpdate(
            { game_id: gameId },
            { $set: { pastGameStates: state } },
            {
                new: true,
                upsert: true
            }
        );

        return { Success: true, Data: record };
    }

    catch(error) {
        return { Success: false, Error: error };
    }
}

exports.getDBRRecord = async(gameId) => {
    try {
        const record = await DBRModel.findOne({ game_id: gameId });
        return { Success: true, Data: record };
    }

    catch(error) {
        return { Success: false, Error: error };
    }
}