const CastlingModel = require("../models/CastlingModel");

exports.createCastlingRecord = async(details) => {
    try {
        const record = {
            ...details,
            ["rook_1_moved"]: false,
            ["rook_2_moved"]: false,
            ["castling_done"]: false
        }

        const castlingRecord = await CastlingModel.create(record);
        return { Success: true, Record: castlingRecord };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}


exports.updateCastlingRecord = async(id, details) => {
    try {
        const castlingRecord = await CastlingModel.findOneAndUpdate(
            { 
                board_id: id,
                player_id: details.player_id
            },
            { $set: details },
            { new: true }
        );
        return { Success: true, Record: castlingRecord };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.findById = async(boardId) => {
    try {
        const castlingRecord = await CastlingModel.find({ board_id : boardId});
        return { Success: true, Record: castlingRecord };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}


exports.findRecord = async(details) => {
    try {
        const castlingRecord = await CastlingModel.find(details);
        console.log(details);
        return { Success: true, Record: castlingRecord };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}