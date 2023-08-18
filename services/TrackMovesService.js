const TrackMovesDAO = require('../dao/TrackMovesDAO');

exports.createMovesRecord = async(gameId) => {
    try {
        const movesList = await TrackMovesDAO.createMovesRecord(gameId);
        return movesList;
    }

    catch(error) {
        throw new Error(error.message);
    }
}

exports.addMoveToList = async(gameId, movesObject) => {
    try {
        const movesList = await TrackMovesDAO.addMoveToList(gameId, movesObject);
        return movesList;
    }

    catch(error) {
        throw new Error(error.message);
    }
}

exports.getMovesListMenu = async(gameId) => {
    try {
        const movesList = await TrackMovesDAO.getMovesListMenu(gameId);

        // const filtered = movesList.map((item)=> {
        //     //filter pgn for castling and pawn promotion
        //     let piece_segment = item.current_pgn;
        //     let destination_segment = item.new_pgn.substring(3, 5);
        //     let filtered_pgn = piece_segment + destination_segment;
            
        //     const currentPgn_splitted = item.current_pgn.split("_");
        //     const newPgn_splitted = item.new_pgn.split("_");

        //     if(item.current_pgn===currentPgn_splitted && newPgn_splitted!==item.new_pgn && newPgn_splitted.length>1) {
        //         const rank = item.new_pgn.charAt(1);
        //         filtered_pgn += "=" + rank;
        //     }

        //     else if(newPgn_splitted[0]==="O-O" || newPgn_splitted==="O-O-O")
        //         filtered_pgn = newPgn_splitted[0];

        //     return {
        //         isWhite: item.whitesMove,
        //         pgn_string: filtered_pgn
        //     }
        // });

        const filtered = movesList.map((item)=> {
            const pgn = item.actual_pgn;
            const killedPiece = item.pieceKilled;
            if(pgn.length >= 7) {
                const firstHalf = pgn.substring(0, 3);
                const secondHalf = pgn.substring(3, 5);
                let lastHalf = "-" + pgn.substring(5, pgn.length);

                if(killedPiece!==null) {
                    const piece = killedPiece.charAt(1);
                    const segment = killedPiece.substring(3, 5);
                    const killed_pgn = "X" + piece + segment;
                    lastHalf = killed_pgn;

                    const lastCharacter = pgn.charAt(pgn.length-1);
                    lastHalf += lastCharacter==='+' ? lastCharacter : "";
                }

                const updated_pgn = firstHalf + ":" + secondHalf + lastHalf;

                return {
                    isWhite: item.whitesMove,
                    pgn_string: updated_pgn,
                    date: item.date
                } 
            }

            else
                return {
                    isWhite: item.whitesMove,
                    pgn_string: item.actual_pgn,
                    date: item.date
                }
        });

        return filtered;

    }

    catch(error) {
        throw new Error(error.message);
    }
}

const spliceArray = (isWhite, source_piecesArray, find_pgn, replace_pgn, pawnPromoted=false, pawn=null) => {
    const replacePgn_piece = replace_pgn.substring(0, 3);
    const replacePgn_segment = replace_pgn.substring(3, 5);
    const findPgn_piece = find_pgn.substring(0, 3);
    const findPgn_segment = find_pgn.substring(3, 5);
    const index = source_piecesArray.findIndex(object=> object.piece===findPgn_piece && object.segment_value===findPgn_segment);

    source_piecesArray.splice(index, 1, {
        segment_value: replacePgn_segment,
        piece: replacePgn_piece,
        isWhite: isWhite,
        isPawnPromoted: pawnPromoted,
        pawn: pawn
    });

    return source_piecesArray;
}

const pushToKilled = (isWhite, killed_array, killed_pgn, pawnPromoted=false, pawn=null) => {
    const killedPgn_piece = killed_pgn.substring(0, 3);
    const killedPgn_segment = killed_pgn.substring(3, 5); 
    killed_array.push({
        segment_value: killedPgn_segment,
        piece: killedPgn_piece,
        isWhite: !isWhite,
        isPawnPromoted: pawnPromoted,
        pawn: pawn
    });

    return killed_array;
}

const removeKilledPiece = (array, killed_pgn) => {
    const killedPgn_piece = killed_pgn.substring(0, 3);
    const killedPgn_segment = killed_pgn.substring(3, 5); 
    const index = array.findIndex(object=> object.piece===killedPgn_piece && object.segment_value===killedPgn_segment);
    array.splice(index, 1);
    return array;
}

// FOR BACKWARD: FIND_PGN=NEW_PGN; REPLACE_PGN=CURRENT_PGN
// FOR FORWARD: FIND_PGN=CURRENT_PGN; REPLACE_PGN=NEW_PGN

// FOR BACKWARD: KILLED_ARRAY=opposite pieces array, because piece was present once and now is in killed
//               REMOVE_KILLED=opposite killed array, because piece is killed and should be removed from there
// FOR BACKWARD: KILLED_ARRAY=opposite killed array, because piece is killed and should be pushed to here
//               REMOVE_KILLED=opposite pieces array, because piece is killed and should be removed fro pieces

const navigateForwardState = async(isWhite, current_board, find_pgn, replace_pgn, killed_pgn=null) => {
    try {
        let source_piecesArray = [];
        let killed_array = [];
        let removeKilled = [];

        console.log("find_pgn: ", find_pgn);
        console.log("replace_pgn: ", replace_pgn);
        console.log("killed_pgn: ", killed_pgn);

        if(isWhite) {
            source_piecesArray = current_board.white;
            killed_array = current_board.blackKilled;
            removeKilled = current_board.black;
        }
        else {
            source_piecesArray = current_board.black;
            killed_array = current_board.whiteKilled; 
            removeKilled = current_board.white;
        }

        // HANDLE CASTLING AND PAWN PROMOTION
        const splitted = find_pgn.split("_");
        // CASTLING TRACKING
        if(splitted!==find_pgn && splitted.length > 1 && (splitted[0]==="O-O" || splitted[0]==="O-O-O")) {
            console.log("Enter castling tracking f")
            const find_kingPgn = splitted[1];
            const find_rookPgn = splitted[2];

            const oldSplitted = replace_pgn.split("_");
            const replace_kingPgn = oldSplitted[1];
            const replace_rookPgn = oldSplitted[2];

            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_kingPgn, replace_kingPgn);
            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_rookPgn, replace_rookPgn);

            return { Success: true, Board: current_board };
        }


        // PAWN PROMOTION (BECAUSE PAWN GEOMETRY IS REPLACED BY THE PROMOTED GEOMETRY)
        const replace_splitted = replace_pgn.split("_");
        if(replace_splitted!==replace_pgn && replace_splitted.length>1) {
            console.log("Enter pawn promotion tracking f")

            const pawn = replace_splitted[1].substring(0, 3);
            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_pgn, replace_pgn, true, pawn);

            if(killed_pgn !== null) {
                const killed_splitted = killed_pgn.split("_");
                if(killed_splitted!==killed_pgn && killed_splitted.length > 1) {
                    const pawn = killed_splitted[1].substring(0, 3);
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn, true, pawn);
                }
                else
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn);
                // removeKilled = spliceArray(isWhite, removeKilled, killed_pgn, null);
                removeKilled = removeKilledPiece(removeKilled, killed_pgn)
            }

            return { Success: true, Board: current_board };
        }


        else {
            console.log("Enter default tracking")
            // console.log("SPA1: ", source_piecesArray);

            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_pgn, replace_pgn);
            // console.log("SPA2: ", source_piecesArray);

            if(killed_pgn!==null) {
                const killed_splitted = killed_pgn.split("_");
                if(killed_splitted!==killed_pgn && killed_splitted.length > 1) {
                    const pawn = killed_splitted[1].substring(0, 3);
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn, true, pawn);
                }
                else
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn);
                // removeKilled = spliceArray(isWhite, removeKilled, killed_pgn, null);
                removeKilled = removeKilledPiece(removeKilled, killed_pgn)
            }


            return { Success: true, Board: current_board };
        }
        
    }

    catch(error) {
        console.log("Error in navigate state");
        console.log(error);
        return { Success: false, Error: error.message };
    }
}

exports.getForwardState = async({gameId, current_board, increment}) => {
    try {
        increment = parseInt(increment)+1;
        console.log("Increment: ", increment);
        const movesList = await TrackMovesDAO.getMovesListMenu(gameId);
        const listLength = movesList.length - 1;
        
        if(increment>=0 && increment<movesList.length) {
            const state = movesList[listLength - increment];
            const replace_pgn = state.new_pgn;  // To replace PGN
            const find_pgn = state.current_pgn; // to be replaced PGN
            const isWhite = state.whitesMove;       
            const killed_pgn = state.pieceKilled;

            // console.log("STATE: ", state);

            return navigateForwardState(isWhite, current_board, find_pgn, replace_pgn, killed_pgn);
        }

        else {
            return { Success: false, Error: "The current board state is the latest, can't navigate any further" }
        }   
    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message };
    }
}


const navigateBackwardState = async(isWhite, current_board, find_pgn, replace_pgn, killed_pgn=null) => {
    try {
        let source_piecesArray = [];
        let killed_array = [];
        let removeKilled = [];

        console.log("find_pgn: ", find_pgn);
        console.log("replace_pgn: ", replace_pgn);
        console.log("killed_pgn: ", killed_pgn);

        if(isWhite) {
            source_piecesArray = current_board.white;
            killed_array = current_board.black;
            removeKilled = current_board.blackKilled;
        }
        else {
            source_piecesArray = current_board.black;
            killed_array = current_board.white;
            removeKilled = current_board.whiteKilled;
        }



        // HANDLE CASTLING AND PAWN PROMOTION
        const splitted = find_pgn.split("_");
        console.log("splitted: ", splitted)
        // CASTLING TRACKING
        if(splitted!==find_pgn && splitted.length > 1 ) {
            if(splitted[0]==="O-O" || splitted[0]==="O-O-O") {
                console.log("Enter castling tracking b")
                const find_kingPgn = splitted[1];
                const find_rookPgn = splitted[2];
    
                const oldSplitted = replace_pgn.split("_");
                const replace_kingPgn = oldSplitted[1];
                const replace_rookPgn = oldSplitted[2];
    
                source_piecesArray = spliceArray(isWhite, source_piecesArray, find_kingPgn, replace_kingPgn);
                source_piecesArray = spliceArray(isWhite, source_piecesArray, find_rookPgn, replace_rookPgn);
    
                return { Success: true, Board: current_board };
            }

            // else {
            //     console.log("Replace queen promoted b");
            //     find_pgn = splitted[0];
            //     replace_pgn = splitted[1];

            //     source_piecesArray = spliceArray(isWhite, source_piecesArray, find_pgn, replace_pgn, false, null);
            //     return { Success: true, Board: current_board };
            // }
           
        }


        // PAWN PROMOTION (BECAUSE PAWN GEOMETRY IS REPLACED BY THE PROMOTED GEOMETRY)
        const replace_splitted = replace_pgn.split("_");
        if(replace_splitted!==replace_pgn && replace_splitted.length>1) {
            console.log("Enter pawn promotion tracking b")

            const pawn = replace_splitted[1].substring(0, 3);
            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_pgn, replace_pgn, true, pawn);

            if(killed_pgn !== null) {
                const killed_splitted = killed_pgn.split("_");
                if(killed_splitted!==killed_pgn && killed_splitted.length > 1) {
                    const pawn = killed_splitted[1].substring(0, 3);
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn, true, pawn);
                }
                else
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn);
                // removeKilled = spliceArray(isWhite, removeKilled, killed_pgn, null);
                removeKilled = removeKilledPiece(removeKilled, killed_pgn)
            }

            return { Success: true, Board: current_board };
        }


        else {
            console.log("Enter default tracking b")
            source_piecesArray = spliceArray(isWhite, source_piecesArray, find_pgn, replace_pgn);

            if(killed_pgn!==null) {
                const killed_splitted = killed_pgn.split("_");
                if(killed_splitted!==killed_pgn && killed_splitted.length > 1) {
                    const pawn = killed_splitted[1].substring(0, 3);
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn, true, pawn);
                }
                else
                    killed_array = pushToKilled(isWhite, killed_array, killed_pgn);
                // removeKilled = spliceArray(isWhite, removeKilled, killed_pgn, null);
                removeKilled = removeKilledPiece(removeKilled, killed_pgn)
            }


            return { Success: true, Board: current_board };
        }
        
    }

    catch(error) {
        console.log("Error in navigate state backward");
        console.log(error);
        return { Success: false, Error: error.message };
    }
}

exports.getBackwardState = async({gameId, current_board, decrement }) => {
    try {
        decrement = parseInt(decrement);
        console.log("Decrement: ", decrement);
        const movesList = await TrackMovesDAO.getMovesListMenu(gameId);
        const listLength = movesList.length - 1;
        
        if(decrement>=0 && decrement<movesList.length) {
            const state = movesList[listLength - decrement];    
            const replace_pgn = state.current_pgn;  // to replace PGN
            const find_pgn = state.new_pgn;         // to be replaced PGN
            const isWhite = state.whitesMove;       
            const killed_pgn = state.pieceKilled; 

            return navigateBackwardState(isWhite, current_board, find_pgn, replace_pgn, killed_pgn);
        }
        
        else {
            return { Success: false, Error: "The current board state is the oldest, can't navigate any behind" }
        }
    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message };
    }
}