const CastlingDAO = require('../dao/CastlingDAO');

exports.createCastlingRecord = async(player_1, player_2, board_id) => {
    try {
        const record_1 = await CastlingDAO.createCastlingRecord({
            board_id: board_id,
            player_id: player_1
         });

         const record_2 = await CastlingDAO.createCastlingRecord({
            board_id: board_id,
            player_id: player_2
         });

         if(record_1.Success && record_2.Success) {
            return { Success: true, Record_1: record_1.Record, Record_2: record_2.Record };
         }

         return { Success: false, Error: 'Castling record creation error' }; 
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

//CHECK IF CASTLING CAN BE DONE
exports.isCastlingEnabled = async(playerId, board_id, rook_segment) => {
    try {
        const record = await CastlingDAO.findRecord({
            board_id: board_id,
            player_id: playerId
        });
        const castlingRecord = record.Record;

        // console.log("===========================")
        // console.log("PlayerId: ", playerId);
        // console.log("BoardId: ", board_id);
        // console.log("Rook segment: ", rook_segment)
        // console.log("Castling record: ", castlingRecord);
        // console.log("===========================")

        const rookSegment = (rook_segment==='a1' || rook_segment==='a8') ? "rook_1_moved" : "rook_2_moved";

        if(!castlingRecord.castling_done && !castlingRecord[rookSegment])
            return true;

        return false;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

//UPDATE CASTLING RECORD IF ANY UPDATES TO ROOK AND KING
exports.updateRecord = async(board_id, details) => {
    try {
        // console.log("PlayerId:", details.player_id)
        // console.log("Update record")
        let toUpdate_record = {
            player_id: details.player_id,
            castling_done: true
        };

        if(details.rookSegment) {
            if(details.isWhite) {
                if(details.rookSegment === "a1")
                    toUpdate_record.rook_1_moved = true;
                else if(details.rookSegment === "h1")
                    toUpdate_record.rook_2_moved = true;
                else{
                    console.log("Invalid")
                    throw new Error("Invalid rook segment");
                    // return { Success: false, Error: "Invalid rook segment"};
                }
            }
    
            else if(!details.isWhite) {
                if(details.rookSegment === "a8")
                    toUpdate_record.rook_1_moved = true;
                else if(details.rookSegment === "h8")
                    toUpdate_record.rook_2_moved = true;
                else{
                    console.log("Invalid")
                    throw new Error("Invalid rook segment");
                    // return { Success: false, Error: "Invalid rook segment"};
                }
            }

            const record = await CastlingDAO.updateCastlingRecord(board_id, toUpdate_record);
            console.log("Record: ", record)

            return record;
        }

        const record = await CastlingDAO.updateCastlingRecord(board_id, details);
        console.log("Record: ", record)

        return record;
    }

    catch(error) {
        console.log(error.message)

        return { Success: false, Error: error.message };
    }
}