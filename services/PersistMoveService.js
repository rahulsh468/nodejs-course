const GameService = require('./GameService');
const MovesService = require('./MovesService');
const CastlingService = require('./CastlingService');
const BoardDAO = require('../dao/BoardDAO');
const TrackMovesService = require('./TrackMovesService');
const StatsService = require('./StatsService');
const EnpassantService = require('./EnPassantService');
const DBRService = require('./DBRService');
const NetworkService = require('./NetworkService');

const checkAndUpdateCastling = async(details) => {
    try {
        if(details.rank === "K") {
            const updateCastling = await CastlingService.updateRecord(details.boardId, {
                player_id: details.playerId,
                castling_done: true
            });
        }

        else if(details.rank === "R") {
            // console.log("enter rook rank");

            const updateCastling = await CastlingService.updateRecord(details.boardId, {
                rookSegment: details.CS,
                isWhite: details.isWhite,
                player_id: details.playerId
            });
        }

    }

    catch(error) {
        // console.log(error.message);
        return { Success: false, Error: error.message };
    }
}


const isInsufficientMaterial = (board)=> {
    try {
        const white = board.white;
        const black = board.black;

        if(white.length<=2 && black.length<=2) {
            let whitePieces = new Set();
            let blackPieces = new Set();

            for(let i=0; i<white.length; ++i) {
                const piece = white[i].piece;
                const rank = piece.charAt(1);
                whitePieces.add(rank);
            }

            for(let i=0; i<black.length; ++i) {
                const piece = black[i].piece;
                const rank = piece.charAt(1);
                blackPieces.add(rank);
            }

            const whitePiecesString = Array.from(whitePieces).join('');
            const blackPiecesString = Array.from(blackPieces).join('');
            const whiteString = whitePiecesString.toLowerCase();
            const blackString = blackPiecesString.toLowerCase();

            const sortedWhite = whiteString.split('').sort().join('');
            const sortedBlack = blackString.split('').sort().join('');

            const bishopString = "bk";
            const knightString = "kn";

            if((sortedWhite===knightString || sortedWhite===bishopString) && (sortedBlack===knightString || sortedBlack===bishopString))
                return {Success: true, status: true};
            
        }

        return { Success: true, status: false };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const isWithin24Hours = (compareDate, currentDate) => {
    const differenceInTime = currentDate.getTime() - compareDate.getTime();
    const differenceInHours = differenceInTime / (1000 * 3600);
    return differenceInHours <= 24;
}


const getKingSegment = (pieces, searchPattern) => {
    try {
        for(let i=0; i<pieces.length; ++i) {
            const piece = pieces[i].piece;
            if(piece === searchPattern)
                return pieces[i].segment_value;
        }
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const decideGame = async(isWhite, board, gameId, playerId) => {
    try {
        let kingPiece = "";
        let source_pieces = [];

        if(isWhite){ 
            kingPiece = "WK1";
            source_pieces = board.white;
        }
        else {
            kingPiece = "BK1";
            source_pieces = board.black;
        }
        
        const kingSegment = getKingSegment(source_pieces, kingPiece);
        const king_pgn = kingPiece + kingSegment;
        return await MovesService.validMoves({
            pgn_string: king_pgn,
            gameId: gameId,
            playerId: playerId
        });
    }

    catch(err) {
        return { Success: false, Error: err.message };
    }
}

//TODO: OPTIMISE CALLS
exports.makeMove = async({ gameId, pgn_string, playerId }) => {
    try {
        let current_pgn = null;
        let new_pgn = null;
        let pieceKilled = null;

        //DECODE PGN_STRING
        const color = pgn_string.charAt(0);
        const isWhite = (color==='W')? true : false;
        const piece = pgn_string.substring(0, 3);
        const current_segment = pgn_string.substring(3, 5);
        const destination_segment = pgn_string.substring(5, 7);

        const game = await GameService.getGameById(gameId);
        if(!game.Success) return game;

        const lastPlayed = game.Game.lastPlayed;
        const currentDate = new Date();
        const dateToCompare = new Date(lastPlayed);

        //CHECK WITHIN 24 HOURS
        if(!isWithin24Hours(dateToCompare, currentDate)) {
            const actual_game = game.Game;
            const player_1 = actual_game.player_1;
            const player_2 = actual_game.player_2;
            const player_turn = actual_game.player_turn;
            const winner = (player_1===player_turn) ? player_2 : player_1;

            const updatedGame = await GameService.endGame(gameId, {
                status: "Completed",
                result: "Timeout",
                winner: winner
            });

            return { 
                Success: true, 
                Data: {
                    Board: {
                        white: [],
                        black: [],
                        whiteKilled: [],
                        blackKilled: [],
                        start_pawns: []
                    },
                    Game: { Game: updatedGame.Game },
                    Moves: [],
                    resign: false,
                    stalemate: false,
                    kingExposingMove: false,
                    checkmate: false,
                    draw: false,
                    timeout: true
                } 
            };
        }

        //CHECK IF ITS THE CORRECT PLAYER'S TURN
        if(
            (game.Game.player_turn.toString() !== playerId.toString()) ||
            (isWhite && game.Game.player_1.toString() !== playerId.toString()) ||
            (!isWhite && game.Game.player_2.toString() !== playerId.toString())
        )
            return { Success: false, Error: 'Wait for you turn impatient user' };

        const boardId = game.Game.board_id;

        const validMoves_data = {
            gameId: gameId,
            pgn_string: pgn_string,
            playerId: playerId
        }

        //CHECK IF DESTINATION IS IN SCOPE OF VALID MOVES
        const moves = await MovesService.identifyPiece(validMoves_data);
        if(!moves.Success) return { Success: false, Error: moves.Error };

        let updated_board = null;

        //CHECK IF CASTLING
        let castlingFlag = false;
        const castlingString = pgn_string.substring(1, pgn_string.length);
        if(castlingString==="O-O" || castlingString==="O-O-O") {
            if(moves.castling) {
                castlingFlag = true;
                updated_board = await BoardDAO.updateCastlingRecords(moves.king, moves.rook, boardId, playerId, isWhite);

                current_pgn = castlingString + "_" + updated_board.oldKing + "_" + updated_board.oldRook;
                new_pgn = castlingString + "_" + updated_board.newKing + "_" + updated_board.newRook;
            }
            else {
                return { ...moves, Data:[] };
            }    
        }


        //ENPASSANT MOVES
        let EnpassantFlag = false;
        if(piece.charAt(1)==="P") {
            const EnpassantEligibleMoves = await EnpassantService.EnpassantEligibleMoves(gameId, isWhite, current_segment);
            if(EnpassantEligibleMoves.Success && EnpassantEligibleMoves.PassingSegment!==null && EnpassantEligibleMoves.Cutting_segment!==null) {
                const PS = EnpassantEligibleMoves.PassingSegment;
                const CS = EnpassantEligibleMoves.Cutting_segment;


                if(moves.Moves.includes(PS)) {
                    EnpassantFlag = true;
                    if(isWhite) {
                        updated_board = await BoardDAO.enPassantWhiteUpdate(boardId, piece, current_segment, PS, CS);
                        current_pgn = updated_board.current_pgn;
                        new_pgn = updated_board.new_pgn;
                        pieceKilled = updated_board.pieceKilled;
                    }
                    else {
                        updated_board = await BoardDAO.enPassantBlackUpdate(boardId, piece, current_segment, PS, CS);
                        current_pgn = updated_board.current_pgn;
                        new_pgn = updated_board.new_pgn;
                        pieceKilled = updated_board.pieceKilled;
                    }
                }
            } 
        }

        
        if(!EnpassantFlag && !castlingFlag) {

            const pawnPromotion = pgn_string.length > 7 ? true : false;

            if(pawnPromotion) {
                const eligible_ranks = ['Q', 'R', 'B', 'N'];
                const rank = pgn_string.charAt(pgn_string.length-1);

                if(!eligible_ranks.includes(rank))
                    throw new Error("Rank not eligible");
            }

            const new_pawn_rank = pawnPromotion ? pgn_string.charAt(pgn_string.length-1) : null;

            const valid_moves = moves.Moves;
            const destination_isIncluded = valid_moves.includes(destination_segment);

            if(!destination_isIncluded)
                return { Success: false, Error: 'Possible hack ! not a valid move '};

            //MAKE WHITE PIECE MOVE AND CAPTURE STATE
            if(isWhite) {
                updated_board = await BoardDAO.whiteUpdate(boardId, piece, current_segment, destination_segment, pawnPromotion, new_pawn_rank);
                if(updated_board.Review) return updated_board;

                current_pgn = updated_board.current_pgn;
                new_pgn = updated_board.new_pgn;
                pieceKilled = updated_board.pieceKilled;
            }

            //MAKE BLACK PIECE MOVE AND CAPTURE STATE
            else {
                updated_board = await BoardDAO.blackUpdate(boardId, piece, current_segment, destination_segment, pawnPromotion, new_pawn_rank);
                if(updated_board.Review) return updated_board;

                current_pgn = updated_board.current_pgn;
                new_pgn = updated_board.new_pgn;
                pieceKilled = updated_board.pieceKilled;
            }

            await checkAndUpdateCastling({
                boardId: boardId,
                CS: current_segment,
                rank: pgn_string.charAt(1),
                isWhite: isWhite,
                playerId: playerId
            });
        }
        
        if(updated_board.Success) {
            let changed_turn = null;
            if(isWhite) changed_turn = game.Game.player_2;
            else changed_turn = game.Game.player_1;

            const datetime = new Date();
            const now = datetime.toISOString();

            // CHECK IF DRAW BY INSUFFICENT MATERIAL
            const board = updated_board.Record;
            const statusRecord = isInsufficientMaterial(board);

            let updated_game = null;
            let isRepeatedDraw = false;

            if(statusRecord.Success && statusRecord.status) {
                updated_game = await GameService.updateGameById(gameId, { 
                    player_turn: changed_turn,
                    lastPlayed: now,
                    status: "Completed",
                    result: "Draw"
                });   

                isRepeatedDraw = true;
            }

            else {
                updated_game = await GameService.updateGameById(gameId, { 
                    player_turn: changed_turn,
                    lastPlayed: now
                });
            }

            let final_pgn = pgn_string;
            let checkmateFlag = false;
            let stalemateFlag = false

            const decision_object = await decideGame(!isWhite, updated_board.Record, gameId, changed_turn);

            console.log("Decision object: ", decision_object)
            if(decision_object.staleMate) 
                stalemateFlag = true;
            else if(decision_object.checkmate){ 
                final_pgn += "#";
                checkmateFlag = true;
            }
            else if(decision_object.kingInCheck) 
                final_pgn += '+';


            const movesObject = {
                player: playerId,
                whitesMove: isWhite,
                current_pgn: current_pgn,
                new_pgn: new_pgn,
                actual_pgn: final_pgn,
                pieceKilled: pieceKilled,
                date: now
            };

            const trackMoves = await TrackMovesService.addMoveToList(gameId, movesObject)
            const gameMenu_moves = await TrackMovesService.getMovesListMenu(gameId);

            const update_statsTime = await StatsService.updateGameTimeRecord(gameId, playerId, lastPlayed, now);

            //CHECK IF DRAW BY REPETITION
            const board_string = MovesService.destructureBoard(board);
            if(board_string.Success) {
                const dbrRecord = await DBRService.storeBoardState(gameId, board_string.Data);

                if(dbrRecord.Success && dbrRecord.Status) {
                    isRepeatedDraw = true;
                };
            }


            //FETCH NETWORK CURRENCY
            const network_number = updated_game.Game.network;

            const network_currency = await NetworkService.getNetworkCurrencyByNumber(network_number);

            if(updated_game.Success)
                return { 
                    Success: true, 
                    Data: {
                        Board: updated_board.Record,
                        Game: {Game: updated_game.Game},
                        Moves: gameMenu_moves,
                        resign: false,
                        stalemate: stalemateFlag,
                        kingExposingMove: false,
                        checkmate: checkmateFlag,
                        draw: isRepeatedDraw,
                        timeout: false,
                        network_currency: network_currency
                    }
                };

            return { Success: false, Error: updated_game.Error };
        } 

        return { Success: false, Error: updated_board.Error }

    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message };
    }
}