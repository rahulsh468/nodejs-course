const BoardModel = require('../models/BoardModel');
const CastlingModel = require('../models/CastlingModel');

const GameDAO = require('../dao/GameDAO');

exports.createBoard = async ( details ) => {
    try {
        const board = await BoardModel.create(details);

        if(board._id !== null) {
            return { Success: true, Board: board };
        } 
        else {
            return { Success: false, Error: 'DAO error (createBoard)' };
        }
    }
    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.getBoardById = async (boardId) => {
    try {
        const board = await BoardModel.findById(boardId);
        return board;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const addKilledPiece = async(boardId, toAdd_object, deletePiece_id, isWhite) => {
    try {
        const board = await BoardModel.findById(boardId);
        if(isWhite) {
            board.whiteKilled.push(toAdd_object);
            board.white.id(deletePiece_id).remove();
            board.markModified('white');
        }else {
            board.blackKilled.push(toAdd_object);
            board.black.id(deletePiece_id).remove();
            board.markModified('black');
        }
        return await board.save();
    }

    catch(error) {
        return { Success: false, Error: error.message }
    }
}

const deleteFromAlive = async(boardId, objectId, isWhite) => {
    try {
        const board = await BoardModel.findById(boardId);
        if(isWhite) {
            board.white.id(objectId).remove();
            board.markModified('white');
        }else {
            board.black.id(objectId).remove();
            board.markModified('black');
        }
        return await board.save();
    }

    catch(error) {
        return { Success: false, Error: error.message }
    }
}

//TODO: OPTIMISE CALLS
//TODO : INCORPORATE TRANSACTION
//TODO : CHECK PIECE EXISTS IN KILLED, SAME COLOR PIECE IS IN DS
exports.whiteUpdate = async (boardId, piece, current_segment, destination_segment, isPawnPromotion=false, rank=null) => {
    try { 
        let current_pgn = piece + current_segment;
        let new_pgn = piece + destination_segment;
        let pieceKilled = null;

        //CHECK IF RECORD EXISTS FOR : BOARD_ID, PIECE, CS
        const current_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'white':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            { 'white.$': 1 }
        );

        if(current_record === null) return { Success: false, Error: 'No piece at segment' };

        console.log("CR: ", current_record)

        if(current_record.white[0].isPawnPromoted) {
            current_pgn += "_" + current_record.white[0].pawn;
            new_pgn += "_" + current_record.white[0].pawn;
        }
        
        //CHECK IF DS HAS A PIECE TO KILL
        const destinationSegment_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'black':{
                    $elemMatch:{
                        'segment_value' : destination_segment
                    }
                }
            },
            { 'black.$': 1 }
        );

        if(destinationSegment_record !== null) {
            const blackPiece = destinationSegment_record.black[0];
            const rank = blackPiece.piece.charAt(1);

            if(rank==="K")
                return GameDAO.putGameUnderReview(boardId);

            const toAdd_object = {
                segment_value : blackPiece.segment_value,
                piece : blackPiece.piece,
                isWhite : blackPiece.isWhite,
                isPawnPromoted: blackPiece.isPawnPromoted,
                pawn: blackPiece.pawn
            }
            //ADDING TO KILLED PIECES AND REMOVING FROM BLACK
            const createdKilled_record = await addKilledPiece(boardId, toAdd_object, blackPiece._id, false);

            pieceKilled = blackPiece.piece + blackPiece.segment_value;
            if(blackPiece.isPawnPromoted) {
                pieceKilled += '_' + blackPiece.pawn;
            }
        }
        
        let updated_record = null;

        if(isPawnPromotion) {
            const new_rank = 'W' + rank + '1' + piece.substring(3, piece.length);
            new_pgn = new_rank + destination_segment + "_" + piece;
            updated_record = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'white':{
                        $elemMatch:{
                            'piece' : piece,
                            'segment_value' : current_segment
                        }
                    }
                },
                {
                    $set: {
                        'white.$.piece': new_rank,                        
                        'white.$.segment_value' : destination_segment,
                        'white.$.isPawnPromoted': true,
                        'white.$.pawn': piece
                    }
                },
                { new: true }
            );
        }
        
        else {
            const currentRecord_pieceSegment = current_record.white[0].segment_value;
            const destinationSegment_pieceSegment = (destinationSegment_record===null) ? null : destinationSegment_record.black[0].segment_value;

            //UPDATE PAWN_SEGMENT IF NEEDED
            const current_board = await BoardModel.findById(boardId);
            const current_startPawns = current_board.start_pawns;

            if(current_startPawns.includes(currentRecord_pieceSegment)) {
                const idx = current_startPawns.indexOf(currentRecord_pieceSegment);
                current_startPawns.splice(idx, 1);
            }

            if(destinationSegment_pieceSegment!==null && current_startPawns.includes(destinationSegment_pieceSegment)) {
                const idx = current_startPawns.indexOf(destinationSegment_pieceSegment);
                current_startPawns.splice(idx, 1);
            }

            console.log("SP: ", current_startPawns);

            //UPDATE CS : MAKE MOVE TO DS
            updated_record = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'white':{
                        $elemMatch:{
                            'piece' : piece,
                            'segment_value' : current_segment
                        }
                    }
                },
                {
                    $set: {
                        start_pawns : current_startPawns,
                        'white.$.segment_value' : destination_segment
                    }
                },
                { new: true }
            );
        }

        return { Success: true, Record: updated_record, pieceKilled: pieceKilled, current_pgn: current_pgn, new_pgn: new_pgn };
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}


//TODO : INCORPORATE TRANSACTION
//TODO : CHECK PIECE EXISTS IN KILLED, SAME PIECE IS IN DS
exports.blackUpdate = async (boardId, piece, current_segment, destination_segment, isPawnPromotion=false, rank=null) => {
    try { 
        let current_pgn = piece + current_segment;
        let new_pgn = piece + destination_segment;
        let pieceKilled = null;

        //CHECK IF RECORD EXISTS FOR : BOARD_ID, PIECE, CS
        const current_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'black':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            { 'black.$': 1 }
        );

        if(current_record === null) return { Success: false, Error: 'No piece at segment' };

        if(current_record.black[0].isPawnPromoted) {
            current_pgn += "_" + current_record.black[0].pawn;
            new_pgn += "_" + current_record.black[0].pawn;
        }
        
        //CHECK IF DS HAS A PIECE TO KILL
        const destinationSegment_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'white':{
                    $elemMatch:{
                        'segment_value' : destination_segment
                    }
                }
            },
            { 'white.$': 1 }
        );

        if(destinationSegment_record !== null) {
            const whitePiece = destinationSegment_record.white[0];
            const rank = whitePiece.piece.charAt(1);

            if(rank==="K")
                return GameDAO.putGameUnderReview(boardId);
                
            const toAdd_object = {
                segment_value : whitePiece.segment_value,
                piece : whitePiece.piece,
                isWhite : whitePiece.isWhite,
                isPawnPromoted: whitePiece.isPawnPromoted,
                pawn: whitePiece.pawn
            }
            //ADDING TO KILLED PIECES AND REMOVING FROM BLACK
            const createdKilled_record = await addKilledPiece(boardId, toAdd_object, whitePiece._id, true);
            pieceKilled = whitePiece.piece + whitePiece.segment_value;
            if(whitePiece.isPawnPromoted) {
                pieceKilled += '_' + whitePiece.pawn;
            }
        }

        let updated_record = null;

        if(isPawnPromotion) {
            const new_rank = 'B' + rank + '1' + piece.substring(3, piece.length);
            new_pgn = new_rank + destination_segment + "_" + piece;

            updated_record = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'black':{
                        $elemMatch:{
                            'piece' : piece,
                            'segment_value' : current_segment
                        }
                    }
                },
                {
                    $set: {
                        'black.$.piece': new_rank,                        
                        'black.$.segment_value' : destination_segment,
                        'black.$.isPawnPromoted': true,
                        'black.$.pawn': piece
                    }
                },
                { new: true }
            );
        }

        else {
            const currentRecord_pieceSegment = current_record.black[0].segment_value;
            const destinationSegment_pieceSegment = (destinationSegment_record===null) ? null : destinationSegment_record.white[0].segment_value;

            //UPDATE PAWN_SEGMENT IF NEEDED
            const current_board = await BoardModel.findById(boardId);
            const current_startPawns = current_board.start_pawns;

            if(current_startPawns.includes(currentRecord_pieceSegment)) {
                const idx = current_startPawns.indexOf(currentRecord_pieceSegment);
                current_startPawns.splice(idx, 1);
            }

            if(destinationSegment_pieceSegment!==null && current_startPawns.includes(destinationSegment_pieceSegment)) {
                const idx = current_startPawns.indexOf(destinationSegment_pieceSegment);
                current_startPawns.splice(idx, 1);
            }

            
            //UPDATE CS : MAKE MOVE TO DS
            updated_record = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'black':{
                        $elemMatch:{
                            'piece' : piece,
                            'segment_value' : current_segment
                        }
                    }
                },
                {
                    $set: {
                        start_pawns : current_startPawns,
                        'black.$.segment_value' : destination_segment
                    }
                },
                { new: true }
            );
        }
        
        return { Success: true, Record: updated_record, pieceKilled: pieceKilled, current_pgn: current_pgn, new_pgn: new_pgn };
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

exports.updateCastlingRecords = async(kingRecord, rookRecord, boardId, playerId, isWhite) => {
    try {
        let updatedKing = null;
        let updatedRook = null;

        const oldKing = kingRecord.piece + kingRecord.CS;
        const oldRook = rookRecord.piece + rookRecord.CS;
        const newKing = kingRecord.piece + kingRecord.DS;
        const newRook = rookRecord.piece + rookRecord.DS;

        if(isWhite) {
            updatedKing = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'white':{
                        $elemMatch:{
                            'piece' : kingRecord.piece,
                            'segment_value' : kingRecord.CS
                        }
                    }
                },
                {
                    $set: {
                        'white.$.segment_value' : kingRecord.DS
                    }
                },
                { new: true }
            );

            updatedRook = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'white':{
                        $elemMatch:{
                            'piece' : rookRecord.piece,
                            'segment_value' : rookRecord.CS
                        }
                    }
                },
                {
                    $set: {
                        'white.$.segment_value' : rookRecord.DS
                    }
                },
                { new: true }
            );
        }

        else if(!isWhite) {
            updatedKing = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'black':{
                        $elemMatch:{
                            'piece' : kingRecord.piece,
                            'segment_value' : kingRecord.CS
                        }
                    }
                },
                {
                    $set: {
                        'black.$.segment_value' : kingRecord.DS
                    }
                },
                { new: true }
            );

            updatedRook = await BoardModel.findOneAndUpdate(
                {   
                    '_id' : boardId,
                    'black':{
                        $elemMatch:{
                            'piece' : rookRecord.piece,
                            'segment_value' : rookRecord.CS
                        }
                    }
                },
                {
                    $set: {
                        'black.$.segment_value' : rookRecord.DS
                    }
                },
                { new: true }
            );
        }

        const castling_update = await CastlingModel.findOneAndUpdate(
            {
                board_id: boardId,
                player_id: playerId
            },
            {
                $set: {
                    castling_done: true
                }
            },
            { new: true }
        );

        return {
            Success: true,
            // Record: {
            //     updatedKingRecord: updatedKing,
            //     updatedRecord: updatedRook,
            //     CastlingUpdate: castling_update
            // }

            //rook is updating after king, so it will have the updated state
            Record: updatedRook,
            oldKing: oldKing,
            oldRook: oldRook,
            newKing: newKing,
            newRook: newRook
        };
        
    }

    catch(error) {
        return { Success: false, Error: error.message }
    }
}

//EN-PASSANT WHITE UPDATE
exports.enPassantWhiteUpdate = async (boardId, piece, current_segment, passing_segment, cutting_segment) => {
    try { 
        let current_pgn = piece + current_segment;
        let new_pgn = piece + passing_segment;
        let pieceKilled = null;

        //CHECK IF RECORD EXISTS FOR : BOARD_ID, PIECE, CS
        const current_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'white':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            { 'white.$': 1 }
        );

        if(current_record === null) return { Success: false, Error: 'No piece at segment' };
        
        //CHECK IF DS HAS A PIECE TO KILL
        const destinationSegment_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'black':{
                    $elemMatch:{
                        'segment_value' : cutting_segment
                    }
                }
            },
            { 'black.$': 1 }
        );

        if(destinationSegment_record!==null) {
            if(destinationSegment_record.black[0].piece.charAt(1)==="P") {
                const blackPiece = destinationSegment_record.black[0];
                const toAdd_object = {
                    segment_value : blackPiece.segment_value,
                    piece : blackPiece.piece,
                    isWhite : blackPiece.isWhite
                }
                //ADDING TO KILLED PIECES AND REMOVING FROM BLACK
                const createdKilled_record = await addKilledPiece(boardId, toAdd_object, blackPiece._id, false);
    
                pieceKilled = blackPiece.piece + blackPiece.segment_value;
            }
            
            else {
                return { Success: false, Error: "Destination record is not a pawn ! Weird behavior !" };
            }
        }
        
        let updated_record = null;

        const currentRecord_pieceSegment = current_record.white[0].segment_value;
        const destinationSegment_pieceSegment = (destinationSegment_record===null) ? null : destinationSegment_record.black[0].segment_value;

        //UPDATE PAWN_SEGMENT IF NEEDED
        // const current_board = await BoardModel.findById(boardId);
        // const current_startPawns = current_board.start_pawns;

        // if(current_startPawns.includes(currentRecord_pieceSegment)) {
        //     const idx = current_startPawns.indexOf(currentRecord_pieceSegment);
        //     current_startPawns.splice(idx, 1);
        // }

        // if(destinationSegment_pieceSegment!==null && current_startPawns.includes(destinationSegment_pieceSegment)) {
        //     const idx = current_startPawns.indexOf(destinationSegment_pieceSegment);
        //     current_startPawns.splice(idx, 1);
        // }

        //UPDATE CS : MAKE MOVE TO DS
        updated_record = await BoardModel.findOneAndUpdate(
            {   
                '_id' : boardId,
                'white':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            {
                $set: {
                    // start_pawns : current_startPawns,
                    'white.$.segment_value' : passing_segment
                }
            },
            { new: true }
        );

        return { Success: true, Record: updated_record, pieceKilled: pieceKilled, current_pgn: current_pgn, new_pgn: new_pgn };
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}


//EN-PASSANT BLACK UPDATE
exports.enPassantBlackUpdate = async (boardId, piece, current_segment, passing_segment, cutting_segment) => {
    try { 
        let current_pgn = piece + current_segment;
        let new_pgn = piece + passing_segment;
        let pieceKilled = null;

        //CHECK IF RECORD EXISTS FOR : BOARD_ID, PIECE, CS
        const current_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'black':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            { 'black.$': 1 }
        );

        if(current_record === null) return { Success: false, Error: 'No piece at segment' };
        
        //CHECK IF DS HAS A PIECE TO KILL
        const destinationSegment_record = await BoardModel.findOne(
            {   
                '_id' : boardId,
                'white':{
                    $elemMatch:{
                        'segment_value' : cutting_segment
                    }
                }
            },
            { 'white.$': 1 }
        );

        if(destinationSegment_record !== null) {
            if(destinationSegment_record.white[0].piece.charAt(1)==="P") {
                const whitePiece = destinationSegment_record.white[0];
                const toAdd_object = {
                    segment_value : whitePiece.segment_value,
                    piece : whitePiece.piece,
                    isWhite : whitePiece.isWhite
                }
                //ADDING TO KILLED PIECES AND REMOVING FROM BLACK
                const createdKilled_record = await addKilledPiece(boardId, toAdd_object, whitePiece._id, true);
                pieceKilled = whitePiece.piece + whitePiece.segment_value;
            }

            else {
                return { Success: false, Error: "Destination record is not a pawn ! Weird behavior !" };
            }
        }

        let updated_record = null;

        
        const currentRecord_pieceSegment = current_record.black[0].segment_value;
        const destinationSegment_pieceSegment = (destinationSegment_record===null) ? null : destinationSegment_record.white[0].segment_value;

        //UPDATE PAWN_SEGMENT IF NEEDED
        // const current_board = await BoardModel.findById(boardId);
        // const current_startPawns = current_board.start_pawns;

        // if(current_startPawns.includes(currentRecord_pieceSegment)) {
        //     const idx = current_startPawns.indexOf(currentRecord_pieceSegment);
        //     current_startPawns.splice(idx, 1);
        // }

        // if(destinationSegment_pieceSegment!==null && current_startPawns.includes(destinationSegment_pieceSegment)) {
        //     const idx = current_startPawns.indexOf(destinationSegment_pieceSegment);
        //     current_startPawns.splice(idx, 1);
        // }

        
        //UPDATE CS : MAKE MOVE TO DS
        updated_record = await BoardModel.findOneAndUpdate(
            {   
                '_id' : boardId,
                'black':{
                    $elemMatch:{
                        'piece' : piece,
                        'segment_value' : current_segment
                    }
                }
            },
            {
                $set: {
                    // start_pawns : current_startPawns,
                    'black.$.segment_value' : passing_segment
                }
            },
            { new: true }
        );
        
        return { Success: true, Record: updated_record, pieceKilled: pieceKilled, current_pgn: current_pgn, new_pgn: new_pgn };
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}
