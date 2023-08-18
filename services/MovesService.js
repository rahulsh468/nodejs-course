const GameDAO = require('../dao/GameDAO');
const BoardDAO = require('../dao/BoardDAO');

const CastlingService = require('./CastlingService');
const GamesService = require('./GameService');
const EnpassantService = require('./EnPassantService');

var chessBoard = null;
var ignorePiece = null;

const segments = [
    ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
    ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
    ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'],
    ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
    ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'],
    ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'],
    ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
    ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8']
];

class Piece {
    constructor(rank, segment, isWhite) {
        this.rank = rank;
        this.segment = segment;
        this.color = (isWhite)? 'white' : 'black';
    }

    getColor() {
        return this.color;
    }

    getRank() {
        return this.rank;
    }
}

const checkValid = (x, y) => {
    return x>=0 && y>=0 && x<segments.length && y<segments.length;
}

const checkIfAbsent = (segment) => {
    return chessBoard[segment]!==undefined && chessBoard[segment]===null;
}

const checkIfSameTeam = (segment1, segment2) => {
    return chessBoard[segment1]!==null && chessBoard[segment2]!==null && chessBoard[segment1].getColor() === chessBoard[segment2].getColor();
}

const getTopMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let topMoves = [];

    for(let i=row-1; i>=0; --i) {
        const possible_segment = segments[i][column];
        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            topMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            topMoves.push(possible_segment);
            break;
        }
    }

    return topMoves;
}

const getBottomMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let bottomMoves = [];

    for(let i=row+1; i<segments.length; ++i) {
        const possible_segment = segments[i][column];
        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            bottomMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            bottomMoves.push(possible_segment);
            break;
        }
    }

    return bottomMoves;
}

const getRightMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let rightMoves = [];

    for(let i=column+1; i<segments.length; ++i) {
        const possible_segment = segments[row][i];

        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            rightMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            rightMoves.push(possible_segment);
            break;
        }
    }
    return rightMoves;
}

const getLeftMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let leftMoves = [];

    for(let i=column-1; i>=0; --i) {
        const possible_segment = segments[row][i];

        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            leftMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            leftMoves.push(possible_segment);
            break;
        }
    }
    return leftMoves;
}

const getTopRightMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let topRightMoves = [];

    for(let i=row+1,j=column+1; i<segments.length && j<segments[0].length; ++i,++j) {
        const possible_segment = segments[i][j];
        
        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            topRightMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            topRightMoves.push(possible_segment);
            break;
        }
    }

    return topRightMoves;
}

const getTopLeftMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let topLeftMoves = [];

    for(let i=row+1,j=column-1; i<segments.length && j>=0; ++i,--j) {
        const possible_segment = segments[i][j];

        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            topLeftMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            topLeftMoves.push(possible_segment);
            break;
        }
    }

    return topLeftMoves;
}

const getBottomRightMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let bottomRightMoves = [];

    for(let i=row-1,j=column+1; i>=0 && j<segments[0].length; --i,++j) {
        const possible_segment = segments[i][j];

        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            bottomRightMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            bottomRightMoves.push(possible_segment);
            break;
        }
    }

    return bottomRightMoves;
}

const getBottomLeftMoves = (row, column, segment, checking=false, defendingSet=null) => {
    let bottomLeftMoves = [];

    for(let i=row-1,j=column-1; i>=0 && j>=0; --i,--j) {
        const possible_segment = segments[i][j];

        if(defendingSet!=null && defendingSet.has(possible_segment))
            break;
        else if(checkIfAbsent(possible_segment))
            bottomLeftMoves.push(possible_segment);
        else if(!checking && checkIfSameTeam(segment, possible_segment))
            break;
        else if((checking && checkIfSameTeam(segment, possible_segment)) || (!checkIfSameTeam(segment, possible_segment))){
            bottomLeftMoves.push(possible_segment);
            break;
        }
    }

    return bottomLeftMoves;
}



const populateBoard = (board) => {
    try {
        if(board._id) {
            const whitePieces = board.white;
            const blackPieces = board.black;

            chessBoard = null;

            const current_board = {
                a1: null, b1: null, c1: null, d1: null, e1: null, f1: null, g1: null, h1: null,
                a2: null, b2: null, c2: null, d2: null, e2: null, f2: null, g2: null, h2: null,
                a3: null, b3: null, c3: null, d3: null, e3: null, f3: null, g3: null, h3: null,
                a4: null, b4: null, c4: null, d4: null, e4: null, f4: null, g4: null, h4: null,
                a5: null, b5: null, c5: null, d5: null, e5: null, f5: null, g5: null, h5: null,
                a6: null, b6: null, c6: null, d6: null, e6: null, f6: null, g6: null, h6: null,
                a7: null, b7: null, c7: null, d7: null, e7: null, f7: null, g7: null, h7: null,
                a8: null, b8: null, c8: null, d8: null, e8: null, f8: null, g8: null, h8: null,
            }

            for(let i=0; i<whitePieces.length; ++i) {
                const segment = whitePieces[i].segment_value;
                const piece = whitePieces[i].piece;
                const isWhite = whitePieces[i].isWhite;
    
                current_board[segment] = new Piece(piece, segment, isWhite);
            }

            for(let i=0; i<blackPieces.length; ++i) {
                const segment = blackPieces[i].segment_value;
                const piece = blackPieces[i].piece;
                const isWhite = blackPieces[i].isWhite;
    
                current_board[segment] = new Piece(piece, segment, isWhite);
            }

            chessBoard = current_board;

        }else {
            console.log('Board not found');
            return { Success: false, Error: 'Board not found' }
        }
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}


const pawnMoves = (color, rank, segment, twoStep, checking) => {
    try {
        const additive = (color==='white') ? 1 : -1;
        const jumpIncluded = twoStep!==null ? twoStep.includes(segment) : false;
        let allowedMoves = [];

        const segmentNumber = segment.charAt(1);
        if(segmentNumber === "1" || segmentNumber==="8") 
            return [];


        const board_pieceColor = chessBoard[segment].getColor();
        const board_pieceRank = chessBoard[segment].getRank();

        if(color===board_pieceColor && rank===board_pieceRank) {
            const rowIdx = parseInt(segment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(segment);

            //SINGLE-DOUBLE STEP
            const singleStepSegment = segments[rowIdx + additive][colIdx];
            if(!checking && checkIfAbsent(singleStepSegment)) {
                allowedMoves.push(singleStepSegment);
                
                if(jumpIncluded){
                    const jumpSegment = segments[rowIdx + (2*additive)][colIdx];
                    if(checkIfAbsent(jumpSegment))
                        allowedMoves.push(jumpSegment);
                }
            }

            //ATTACK MOVES
            const possible_attacks = [
                { x:rowIdx+additive, y:colIdx+additive },
                { x:rowIdx+additive, y:colIdx-additive }
            ];

            for(let i=0; i<possible_attacks.length; ++i) {
                const x = possible_attacks[i].x;
                const y = possible_attacks[i].y;
    
                if(checkValid(x, y)) {
                    const possible_segment = segments[x][y];
                    if(checking || (chessBoard[possible_segment]!==null && !checkIfSameTeam(segment, possible_segment))) 
                        allowedMoves.push(possible_segment);
                }
            }

            return allowedMoves;
        }
        else {
            console.log("Pawn integrity mismatch");
            return [];
            // throw new Error('Weird behavior ! Suspicious ! Possible hack');
        }
    }
    catch(error) {
        console.log("Error in fetch valid pawn moves");
        console.log(error);
        throw new Error(error.message);
    } 
}

const validPawnMove = (pgn_string, twoStep=null, checking=false) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const piece_rank = pgn_string.substring(0,3);
        const currentSegment = pgn_string.substring(3, 5);

        const segmentNumber = currentSegment.charAt(1);
        if(segmentNumber === "1" || segmentNumber==="8") 
            return { Success: true, Moves: [], checkmate: false, staleMate: false, kingExposingMove: false };


        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const moves = pawnMoves(piece_color, piece_rank, currentSegment, twoStep, checking);
        return { Success: true, Moves: moves, checkmate: false, staleMate: false, kingExposingMove: false };
    }

    catch(error) {
        console.log("Error in valid pawn move")
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

const validRook = (pgn_string, kingSegment=null, checking=false, defendingSet=null) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        let currentKing = null;
        if(checking && kingSegment!==null) {
            currentKing = chessBoard[kingSegment]
            chessBoard[kingSegment] = null;
        }

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            const topMoves = getTopMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomMoves = getBottomMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const rightMoves = getRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const leftMoves = getLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);

            if(checking && kingSegment!==null) chessBoard[kingSegment] = currentKing;

            const allowedMoves =  [ 
                ...topMoves,
                ...bottomMoves,
                ...rightMoves,
                ...leftMoves
            ];

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("Rook integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }

    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

const validKnight = (pgn_string, checking=false) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        let allowedMoves = [];

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            const possible_indices = [
                { x:rowIdx+2, y:colIdx+1 },
                { x:rowIdx+2, y:colIdx-1 },
                { x:rowIdx-2, y:colIdx+1 },
                { x:rowIdx-2, y:colIdx-1 },
                { x:rowIdx+1, y:colIdx+2 },
                { x:rowIdx+1, y:colIdx-2 },
                { x:rowIdx-1, y:colIdx+2 },
                { x:rowIdx-1, y:colIdx-2 }
            ];

            for(let i=0; i<possible_indices.length; ++i) {
                const x = possible_indices[i].x;
                const y = possible_indices[i].y;
    
                if(checkValid(x, y)) {
                    const possible_segment = segments[x][y];
                    if(checking || checkIfAbsent(possible_segment) || !checkIfSameTeam(currentSegment, possible_segment)) 
                        allowedMoves.push(possible_segment);
                    }
                }

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("Knight integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

const validBishop = (pgn_string, kingSegment=null, checking=false, defendingSet=null) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        let currentKing = null;
        if(checking && kingSegment!==null) {
            currentKing = chessBoard[kingSegment]
            chessBoard[kingSegment] = null;
        }

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            const topRightMoves = getTopRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const topLeftMoves = getTopLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomRightMoves = getBottomRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomLeftMoves = getBottomLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);

            const allowedMoves =[
                ...topRightMoves,
                ...topLeftMoves,
                ...bottomRightMoves,
                ...bottomLeftMoves
            ];

            if(checking && kingSegment!==null) chessBoard[kingSegment] = currentKing;

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("Bishop integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }

    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

const validQueen = (pgn_string, kingSegment=null, checking=false, defendingSet) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        let currentKing = null;
        if(checking && kingSegment!==null) {
            currentKing = chessBoard[kingSegment]
            chessBoard[kingSegment] = null;
        }

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            const topMoves = getTopMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomMoves = getBottomMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const rightMoves = getRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const leftMoves = getLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);

            const topRightMoves = getTopRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const topLeftMoves = getTopLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomRightMoves = getBottomRightMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);
            const bottomLeftMoves = getBottomLeftMoves(rowIdx, colIdx, currentSegment, checking, defendingSet);

            const allowedMoves = [
                ...topMoves,
                ...bottomMoves,
                ...rightMoves,
                ...leftMoves,

                ...topRightMoves,
                ...topLeftMoves,
                ...bottomRightMoves,
                ...bottomLeftMoves
            ];

            if(checking && kingSegment!==null) chessBoard[kingSegment] = currentKing;

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("Queen integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }

    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
}

//TODO: Valid moves against line of check
//get attacking line and check valid move
const validKing = (pgn_string, checking=false) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        let allowedMoves = [];

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            const possible_indices = [
                { x:rowIdx+1, y: colIdx }, 
                { x:rowIdx+1, y: colIdx+1 }, 
                { x:rowIdx, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx }, 
                { x:rowIdx-1, y: colIdx-1 }, 
                { x:rowIdx, y: colIdx-1 }, 
                { x:rowIdx+1, y: colIdx-1 } 
            ];

            for(let i=0; i<possible_indices.length; ++i) {
                const x = possible_indices[i].x;
                const y = possible_indices[i].y;
    
                if(checkValid(x, y)) {
                    const possible_segment = segments[x][y];
                    if(checking || checkIfAbsent(possible_segment) || !checkIfSameTeam(currentSegment, possible_segment)) 
                        allowedMoves.push(possible_segment);
                }
            }

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("King integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
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

const getAttackMoves = (attackingPiece, sub_pgn, twoStepArray=null, kingSegment=null, checking=false) => {
    try {
        switch(attackingPiece) {
            case 'P': 
                return validPawnMove(sub_pgn, twoStepArray, checking);
            case 'R': 
                return validRook(sub_pgn, kingSegment, checking);
            case 'N': 
                return validKnight(sub_pgn, checking);
            case 'B': 
                return validBishop(sub_pgn, kingSegment, checking);
            case 'Q': 
                return validQueen(sub_pgn, kingSegment, checking);
            case 'K': 
                return validKing(sub_pgn, checking);
            default: return { Success: false, Error: 'Piece not found' };
        }
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const isKingChecked = (board, pgn_string) => {
    try {
        const whitePieces = board.white;
        const blackPieces = board.black;
        const color = pgn_string.charAt(0);
        const isWhite = (color==='W') ? true : false;
        let attackPieces = null;
        let kingSegment = null;

        if(isWhite) {
            kingSegment = getKingSegment(whitePieces, 'WK1');
            attackPieces = blackPieces;
        } else {
            kingSegment = getKingSegment(blackPieces, 'BK1');
            attackPieces = whitePieces;
        }

        const twoStepArray = board.start_pawns;
        for(let i=0; i<attackPieces.length; ++i) {
            const piece = attackPieces[i].piece;
            const segment = attackPieces[i].segment_value;
            const attackingPiece = piece.charAt(1);
            const sub_pgn = piece + segment;

            const attackMoves = getAttackMoves(attackingPiece, sub_pgn, twoStepArray, kingSegment, true);

            if(attackMoves.Moves.includes(kingSegment))
                return {checking: true, pgn: sub_pgn, kingSegment: kingSegment };
        }

        return {checking: false, kingSegment: kingSegment };

    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const getAttackSet = (attackPieces, twoStepArray, kingSegment=null, checking=false, defending=false, board=null) => {
    try {
        let attackingSet = new Set();
        for(let i=0; i<attackPieces.length; ++i) {
            if(ignorePiece===null || (ignorePiece!==null && ignorePiece.rank!==attackPieces[i].piece)) {
                const piece = attackPieces[i].piece;
                const segment = attackPieces[i].segment_value;
                const attackingPiece = piece.charAt(1);
                const sub_pgn = piece + segment;
    
                //KING ITSELF CAN'T DEFEND LINE OF CHECK
                if(defending && piece.charAt(1)==='K')
                    continue;
    
                const attackMoves = getAttackMoves(attackingPiece, sub_pgn, twoStepArray, kingSegment, checking);
    
                //WHILE TAKING KING OUT OF CHECK, SHOULDNT LEAD TO CHECK BY OTHER LINE
                if(defending && kingSegment!==null && board!==null) {
                    const new_moves = [];
                    const current_moves = attackMoves.Moves;
                    for(let j=0; j<current_moves.length; ++j) {
                        const current_move = current_moves[j];
                        const new_pgn = sub_pgn + current_move;
                        if(!isKingExposed(new_pgn, kingSegment, board)) {
                            new_moves.push(current_move);
                        }
                    }
    
                    attackMoves.Moves = new_moves;
                }
                
                const attackingMoves = JSON.parse(JSON.stringify(attackMoves.Moves));
                
                for(let move of attackingMoves)
                    attackingSet.add(move)
            }
        }

        return attackingSet;
    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message }; 
    }
}

const restrictedMoves = async(game, board, pgn_string, checking_pgn, kingSegment) => {
    try {
        const gameId = game._id;

        const whitePieces = board.white;
        const blackPieces = board.black;
        const twoStepArray = board.start_pawns;

        const color = pgn_string.charAt(0);
        const isWhite = (color==='W') ? true : false;
        let attackPieces = null;
        let defendPieces = null;
        // let kingSegment = null;
        let kingPiece = null;

        if(isWhite) {
            kingPiece = 'WK1';
            // kingSegment = getKingSegment(whitePieces, 'WK1');
            attackPieces = blackPieces;
            defendPieces = whitePieces;
        } else {
            kingPiece = 'BK1';
            // kingSegment = getKingSegment(blackPieces, 'BK1');
            attackPieces = whitePieces;
            defendPieces = blackPieces;
        }

        const attackingKingSet = getAttackSet(attackPieces, twoStepArray, kingSegment, true);
        const defendingKingSet = getAttackSet(defendPieces, twoStepArray, kingSegment, false, true, board);

        const Enpassant_moves = await EnpassantService.isSpecialEnpassant(gameId, checking_pgn, defendPieces);
        if(Enpassant_moves.Success && Enpassant_moves.Cutting_segment!==null) {
            defendingKingSet.add(Enpassant_moves.Cutting_segment);
        } 

        const king_pgn = kingPiece + kingSegment;
        const validKingMoves = validKing(king_pgn);
        let restrictedKingMoves = [];
        
        //RESTRICTED KING MOVES (IF NEEDED TRY KING EXPOSING MOVE)
        for(let i=0; i<validKingMoves.Moves.length; ++i) {
            const kingValidMove = validKingMoves.Moves[i];
            if(!attackingKingSet.has(kingValidMove))
                restrictedKingMoves.push(kingValidMove);
        }

        //BLOCK KING LINE OF CHECK BY OTHER DEFENDING PIECES
        const afterDefendingMoves = defendKingMoves(checking_pgn, defendingKingSet, kingSegment);

        const checkingPiece_segment = checking_pgn.substring(3,5);
        console.log("=============================")
        console.log("Restricted king moves: ", restrictedKingMoves);
        console.log("Checking piece segment: ", checkingPiece_segment);
        console.log("After defending moves: ", afterDefendingMoves);
        console.log("===========================");

        //RESTRICTED_KING_MOVES = 0; KING HAS NO MOVES TO MAKE
        //AFTER DEFENDING ATTACKING INCLUDES KS; ATTACK CAN STILL KILL KING
        //AFTER DEFENDING INCLUDES CHECKING SEGMENT; SOME PIECE CAN KILL CHECKING PIECE
        //ATTACKING KING SET COVERS CHECKING PIECE
        if(restrictedKingMoves.length===0 && afterDefendingMoves.attacking.includes(kingSegment) && !afterDefendingMoves.defending.includes(checkingPiece_segment)) {
            console.log('Its a checkmate !');

            let winner = null;
            const player_1 = game.player_1;
            const player_2 = game.player_2;
            const player_turn = game.player_turn;

            if(player_1 === player_turn) winner = player_2;
            else if(player_2 === player_turn) winner = player_1;
            
            const updatedGame = await GamesService.endGame(gameId, {
                status: "Completed",
                result: "Checkmate",
                winner: winner
            });

            return { Success: true, Moves: [], message: 'Checkmate ! Hard luck !', checkmate: true, staleMate: false, kingExposingMove: false, Game: updatedGame, resign: false, draw: false, timeout: false };
        }

        else if(pgn_string.charAt(1)==='K') {
            return { Success: true, Moves: restrictedKingMoves, message: 'King is in check from : ' + checking_pgn +  ', but can be avoided by ' + pgn_string, checkmate: false, staleMate: false, kingExposingMove: false ,kingInCheck: true,};
        }

        else {
            const moves = getDefendingMoves(pgn_string, kingSegment, checking_pgn, defendingKingSet, board.start_pawns);

            // check if En-passant eligible, en-passant will only be eligible if peviously pawn was moved and it should be the reason for check
            if(Enpassant_moves.Success && Enpassant_moves.PassingSegment!==null && Enpassant_moves.Cutting_segment!==null) {
                const passing_segment = Enpassant_moves.PassingSegment;
                const cutting_segment = Enpassant_moves.Cutting_segment;

                let allowedMoves = [];
                for(let i=0; i<moves.length; ++i) {
                    const new_pgn = pgn_string + moves[i];
                    if(!isKingExposed(new_pgn, kingSegment, board))
                        allowedMoves.push(moves[i]);
                }

                const new_pgn = pgn_string + cutting_segment;
                if(!isKingExposed(new_pgn, kingSegment, board))
                    allowedMoves.push(passing_segment);
                return { Success: true, Moves: allowedMoves, message: 'King is in check from : ' + checking_pgn +  ', but can be avoided by En-passant', checkmate: false, staleMate: false, kingExposingMove: false ,kingInCheck: true,}
            }  

            // CHECK IF NO PIECE CAN BLOCK 
            // let breakCheckFlag = false;
            // for(let k=0; k<defendPieces.length; ++k) {
            //     const piece = defendPieces[k].piece;
            //     const segment = defendPieces[k].segment_value;
            //     const defend_pgn = piece + segment;
                
            //     const defend_moves = getDefendingMoves(defend_pgn, kingSegment, checking_pgn, defendingKingSet, board.start_pawns);
            //     let allowedMoves = [];
            //     for(let l=0; l<defend_moves.length; ++l) {
            //         const new_pgn = pgn_string + defend_moves[l];
            //         if(!isKingExposed(new_pgn, kingSegment, board))
            //             allowedMoves.push(defend_moves[l]);
            //     }

            //     if(allowedMoves.length>0) {
            //         console.log(defend_pgn , " can save king by moving to segments: ", allowedMoves);
            //         breakCheckFlag = true;
            //         break;
            //     }
            // }

            // if(!breakCheckFlag && restrictedKingMoves.length===0 && afterDefendingMoves.attacking.includes(kingSegment) && !afterDefendingMoves.defending.includes(checkingPiece_segment)) 
            //     console.log("No piece can block: hence checkmate")

            //END CHECK

            // check if king will be exposed after this move 
            // call and check isKingExposingMove, similarly for valid moves

            let allowedMoves = [];
            for(let i=0; i<moves.length; ++i) {
                const new_pgn = pgn_string + moves[i];
                if(!isKingExposed(new_pgn, kingSegment, board))
                    allowedMoves.push(moves[i]);
            }

            return { Success: true, Moves: allowedMoves, message: 'King is in check from : ' + checking_pgn +  ', but can be avoided', checkmate: false, staleMate: false, kingExposingMove: false ,kingInCheck: true,}
        }
 
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}


const validKingMoves = async(pgn_string, board, playerId) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        let allowedMoves = [];

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            let opponentAttackers = null;
            const twoStepArray = board.start_pawns;
            if(piece_color === "white") opponentAttackers = board.black;
            else if(piece_color === "black") opponentAttackers = board.white;
            const attackSet = getAttackSet(opponentAttackers, twoStepArray, currentSegment, true);

            const possible_indices = [
                { x:rowIdx+1, y: colIdx }, 
                { x:rowIdx+1, y: colIdx+1 }, 
                { x:rowIdx, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx }, 
                { x:rowIdx-1, y: colIdx-1 }, 
                { x:rowIdx, y: colIdx-1 }, 
                { x:rowIdx+1, y: colIdx-1 } 
            ];

            for(let i=0; i<possible_indices.length; ++i) {
                const x = possible_indices[i].x;
                const y = possible_indices[i].y;
    
                if(checkValid(x, y)) {
                    const possible_segment = segments[x][y];
                    if(!attackSet.has(possible_segment))
                        if(checkIfAbsent(possible_segment) || !checkIfSameTeam(currentSegment, possible_segment)) 
                            allowedMoves.push(possible_segment);
                }
            }

            const isWhite = (piece_color==="white") ? true : false;

            const kingsideCastling = await kingSideCastlingMoves(playerId, board, isWhite);
            const queensideCastling = await queenSideCastlingMoves(playerId, board, isWhite);

            allowedMoves = [
                ...allowedMoves,
                ...kingsideCastling.Moves,
                ...queensideCastling.Moves
            ];

            // if(isWhite) {
            //     const moves = queenSideCastlingMoves
            //     if(await CastlingService.isCastlingEnabled(playerId, board._id, "a1")) allowedMoves.push("a1");
            //     if(await CastlingService.isCastlingEnabled(playerId, board._id, "h1")) allowedMoves.push("h1");
            // }

            // else {
            //     if(await CastlingService.isCastlingEnabled(playerId, board._id, "a8")) allowedMoves.push("a8");
            //     if(await CastlingService.isCastlingEnabled(playerId, board._id, "h8")) allowedMoves.push("h8");
            // }

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false, isKingsideEnabled: kingsideCastling.castling, isQueensideEnabled: queensideCastling.castling };
        }

        else {
            console.log("Valid king integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
} 

const isKingExposed = (pgn_string, kingSegment, board) => {
    try {
        const twoStepArray = board.start_pawns;
        const color = pgn_string.charAt(0);
        const isWhite = (color === 'W') ? true : false;

        // const piece = pgn_string.substring(0, 3);
        const CS = pgn_string.substring(3, 5);
        const DS = pgn_string.substring(5, 7);
        
        let attackingPieces = null;
        if(isWhite) attackingPieces = board.black;
        else attackingPieces = board.white;

        const CSPiece = chessBoard[CS];
        const DSPiece = chessBoard[DS];
        ignorePiece = DSPiece;

        chessBoard[CS] = null;
        chessBoard[DS] = CSPiece;

        const attackSet = getAttackSet(attackingPieces, twoStepArray, ...skip(1), true);

        chessBoard[CS] = CSPiece;
        chessBoard[DS] = DSPiece;
        ignorePiece = null;


        if(attackSet.has(kingSegment))
            return true

        return false;
    }

    catch(error) {
        console.log(error);
    }
}

const isStaleMate = async(board, pgn_string) => {
    try {
        return new Promise((resolve, reject) => {
            const isWhite = (pgn_string.charAt(0)==="W")? true: false;
            let toCheck_pieces = [];

            if(isWhite) toCheck_pieces = board.white;
            else toCheck_pieces = board.black;
            let moves = [];
            for(let i=0; i<toCheck_pieces.length; ++i) {
                const piece = toCheck_pieces[i].piece.charAt(1);
                const twoStepArray = board.start_pawns;

                const current_piece = toCheck_pieces[i].piece;
                const current_segment = toCheck_pieces[i].segment_value;

                const new_pgn = current_piece + current_segment;

                moves = [];
                switch(piece) {
                    case 'P':
                            moves = validPawnMove(new_pgn, twoStepArray);
                            break;
                    case 'R': moves = validRook(new_pgn);
                              break;
                    case 'N': moves = validKnight(new_pgn);
                            break;
                    case 'B': moves = validBishop(new_pgn);
                            break;
                    case 'Q': moves = validQueen(new_pgn);
                            break;
                    case 'K': moves = staleKingMoves(new_pgn, board);
                            break;
                    default: throw new Error("Piece not found");
                }

                console.log(moves)
                if(moves.Moves.length>0) return resolve(false);
            }

            resolve(true);
            console.log("Done stale mate")
        });
    }

    catch(error) {
        throw new Error(error);
    }
}

exports.identifyPiece = async (details) => {
    try {
        const pgn_string = details.pgn_string;
        const gameId = details.gameId;
        const playerId = details.playerId;

        const isWhite = pgn_string.charAt(0)==='W'? true : false;

        const game = await GameDAO.getGameById(gameId);
        if(game._id && game._id!==null && game.status==='Progress' ) {
            const boardId = game.board_id;
            const board = await BoardDAO.getBoardById(boardId);

            populateBoard(board);

            const kingChecked = isKingChecked(board, pgn_string);

            if(kingChecked.checking) {
                return await restrictedMoves(game, board, pgn_string, kingChecked.pgn, kingChecked.kingSegment);
            }

            else if(pgn_string.charAt(1)!=="O" && await isStaleMate(board, pgn_string)) {
                const updatedGame = await GamesService.endGame(gameId, {
                    status: "Completed",
                    result: "Stalemate",
                    winner: "multiple"
                });

                return { Success: true, message: "No valid moves! Stale mate !", staleMate: true, Game: updatedGame  };
            }

            else if(isKingExposed(pgn_string, kingChecked.kingSegment, board)) {
                return { Success: true, message: 'King will be exposed on making this move', Moves: [], kingExposingMove: true }
            }

            else {
                const twoStepArray = board.start_pawns;

                
                const piece = pgn_string.charAt(1);

                if(piece === "O") {
                    return castlingValidMoves(playerId, board, pgn_string);
                }

                switch(piece) {
                    case 'P': const moves = validPawnMove(pgn_string, twoStepArray);
                              const EnpassantEligibleMoves = await EnpassantService.EnpassantEligibleMoves(gameId, isWhite, pgn_string.substring(3, 5));
                              if(EnpassantEligibleMoves.Success && EnpassantEligibleMoves.PassingSegment!==null) {
                                moves.Moves.push(EnpassantEligibleMoves.PassingSegment);
                              } 
                              return moves;
                    case 'R': return validRook(pgn_string);
                    case 'N': return validKnight(pgn_string);
                    case 'B': return validBishop(pgn_string);
                    case 'Q': return validQueen(pgn_string);
                    case 'K': return validKingMoves(pgn_string, board, playerId);
                    default: return { Success: false, Error: 'Piece not found' };
                }
            }
        }
        else  {
            console.log('Game not found / valid');
            return { Success: false, Error: 'Game not found' }
        }
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
} 

const hasSegment = (segment, movesSet) => {
    return movesSet!==null && movesSet.has(segment);
}

const skip = (num) => new Array(num);

const defendKingMoves = (checking_pgn, defendingKingSet, kingSegment) => {
    try {
        //CHECK WHETHER YOU CAN BLOCK THE LINE OF CHECK

        const piece = checking_pgn.charAt(1);
        const segment = checking_pgn.substring(3, 5);
        let result = null;

        switch(piece) {
            case 'P':
            case 'N':
                if(hasSegment(segment, defendingKingSet)) 
                    return { attacking:[], defending: [segment] };
                else return { attacking: [segment, kingSegment], defending: [] };
            case 'R':
                result = validRook(checking_pgn, ...skip(2), defendingKingSet);
                if(hasSegment(segment, defendingKingSet)) 
                    return { attacking:result.Moves, defending: [segment] };
                return { attacking:result.Moves, defending: [] };
            case 'B':
                result = validBishop(checking_pgn, ...skip(2), defendingKingSet);
                if(hasSegment(segment, defendingKingSet)) 
                    return { attacking:result.Moves, defending: [segment] };
                return { attacking:result.Moves, defending: [] };
            case 'Q':
                result = validQueen(checking_pgn, ...skip(2), defendingKingSet);
                if(hasSegment(segment, defendingKingSet)) 
                    return { attacking:result.Moves, defending: [segment] };
                return { attacking:result.Moves, defending: [] };
        }
        
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const kingChecking_line = (checking_piece, checking_pgn, kingSegment) => {
    const color = checking_pgn.substring(0,1);
    const piece_color = (color==='W')? 'white' : 'black';
    const currentSegment = checking_pgn.substring(3, 5);
    const piece_rank = checking_pgn.substring(0,3);

    if(checkIfAbsent(currentSegment)) 
        return { Success: false, Error: 'OOPS! There is no piece here' };

    const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
    const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

    if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
        const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
        const colIdx = segments[rowIdx].indexOf(currentSegment);

        switch(checking_piece) {
            case 'P':
            case 'N':
                return [ currentSegment ];
            case 'Q':
                if(getTopMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomMoves(rowIdx, colIdx, currentSegment);
                else if(getRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getRightMoves(rowIdx, colIdx, currentSegment);
                else if(getLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getLeftMoves(rowIdx, colIdx, currentSegment);

                else if(getTopRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopRightMoves(rowIdx, colIdx, currentSegment);
                else if(getTopLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopLeftMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomRightMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomLeftMoves(rowIdx, colIdx, currentSegment);
            
            case 'R':
                if(getTopMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomMoves(rowIdx, colIdx, currentSegment);
                else if(getRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getRightMoves(rowIdx, colIdx, currentSegment);
                else if(getLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getLeftMoves(rowIdx, colIdx, currentSegment);

            case 'B':
                if(getTopRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopRightMoves(rowIdx, colIdx, currentSegment);
                else if(getTopLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getTopLeftMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomRightMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomRightMoves(rowIdx, colIdx, currentSegment);
                else if(getBottomLeftMoves(rowIdx, colIdx, currentSegment).includes(kingSegment)) return getBottomLeftMoves(rowIdx, colIdx, currentSegment);

        }
    }

    else {
        console.log("King checking line integrity mismatch");
        return { Success: false, Error: 'Possible hack' }
    }

}

const blockingMoves = (pgn_string, checking_pgn, kingSegment) => {
    const defendingPiece = pgn_string.charAt(1);
    const checking_piece = checking_pgn.charAt(1);
    const defendKingMoves = getAttackMoves(defendingPiece, pgn_string).Moves;

    const checking_kingLine = kingChecking_line(checking_piece, checking_pgn, kingSegment);
    console.log("King check line: ", checking_kingLine);

    const checkingPieceMoves = getAttackMoves(checking_piece, checking_pgn).Moves;

    let kingIdx = -1;
    for(let i=0; i<checkingPieceMoves.length; ++i) {
        if(checkingPieceMoves[i] === kingSegment)
            kingIdx = i;
    }

    let blockingMoves = [];
    for(let i=kingIdx; i>=0; --i) {
        if(defendKingMoves.includes(checkingPieceMoves[i]))
            blockingMoves = [ checkingPieceMoves[i] ];
    }

    const checkingPiece_segment = checking_pgn.substring(3, 5);
    if(defendKingMoves.includes(checkingPiece_segment))
        blockingMoves.push(checkingPiece_segment)

    return blockingMoves;
}

const getDefendingMoves = (pgn_string, kingSegment, checking_pgn, defendingKingSet, twoStepArray) => {
    try {
        const checking_piece = checking_pgn.charAt(1);
        const checkingPiece_segment = checking_pgn.substring(3, 5);

        const checking_kingLine = kingChecking_line(checking_piece, checking_pgn, kingSegment);

        const defendingPiece = pgn_string.charAt(1);
        let moves = null;

        switch(defendingPiece) {
            case 'P': moves = validPawnMove(pgn_string, twoStepArray);
                      break;
            case 'N': moves = validKnight(pgn_string, twoStepArray);
                      break;
            case 'B': moves = validBishop(pgn_string, twoStepArray);
                      break;
            case 'R': moves = validRook(pgn_string, twoStepArray);
                      break;
            case 'Q': moves = validQueen(pgn_string, twoStepArray);
                      break;
        }

        const actualMoves = moves.Moves;

        let allowedMoves = [];
        for(let i=0; i<actualMoves.length; ++i) 
            if(checking_kingLine.includes(actualMoves[i]))
                allowedMoves.push(actualMoves[i]);
        if(actualMoves.includes(checkingPiece_segment))
            allowedMoves.push(checkingPiece_segment);

        return allowedMoves;

        // switch(checking_piece) {
        //     case 'P':
        //     case 'N':
        //         if(hasSegment(checkingPiece_segment, defendingKingSet)) 
        //             return [ checkingPiece_segment ];
        //         else return [];
        //     case 'R':
        //     case 'B':
        //     case 'Q':
        //        return blockingMoves(pgn_string, checking_pgn, kingSegment); 
        // }
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

const queenSideCastlingMoves = async(playerId, board, isWhite) => {
    try {
        const white = ['a1', 'b1', 'c1', 'd1', 'e1'];
        const black = ['a8', 'b8', 'c8', 'd8', 'e8'];

        let toCheck_segments = [];
        let attackPieces = [];

        if(isWhite){ 
            if(checkIfAbsent('a1')) return { Moves: [], castling: false };

            toCheck_segments = white;
            attackPieces = board.black;
        }

        else if(!isWhite) {
            if(checkIfAbsent('a8')) return { Moves: [], castling: false };

            toCheck_segments = black;
            attackPieces = board.white;
        }

        const castlingEnabled = await CastlingService.isCastlingEnabled(playerId, board._id, toCheck_segments[0]);

        if(castlingEnabled) {
            const attackSet = getAttackSet(attackPieces, board.start_pawns)
            for(let i=1; i<toCheck_segments.length; ++i) {
                const segment_inCheck = toCheck_segments[i];
                if(attackSet.has(segment_inCheck)){
                    return { Success: true, Moves: [], message: "Segment is in check :" + segment_inCheck.toString() };
                }else if(i<toCheck_segments.length-1 && !checkIfAbsent(segment_inCheck)) {
                    return { Success: true, Moves: [], message: "Segment is not null :" + segment_inCheck.toString() };
                }
            }

            if(isWhite) {
                console.log("KS: b1, RS: c1" )

                return { 
                    Success: true, 
                    castling: true,
                    Moves: [toCheck_segments[2]], 
                    king: {
                        CS: 'e1',
                        DS: 'c1',
                        piece: 'WK1'
                    },  
                    rook: {
                        piece: 'WR1',
                        CS: 'a1',
                        DS: 'd1'
                    }  
                };
            }

            else if(!isWhite) {
                console.log("KS: b8, RS: c8" )

                return { 
                    Success: true, 
                    castling: true,
                    Moves: [toCheck_segments[2]], 
                    king: {
                        CS: 'e8',
                        DS: 'c8',
                        piece: 'BK1'
                    }, 
                    rook: {
                        CS: 'a8',
                        piece: 'BR1',
                        DS: 'd8'
                    }  
                };
            }
        }

        else {
            return { Success: false, castling: false, Error: "Castling not available", Moves: [] }
        }

    }

    catch(error) {
        throw new Error(error);
    }
}

const kingSideCastlingMoves = async(playerId, board, isWhite) => {
    try {
        const white = ['h1', 'g1', 'f1', 'e1'];
        const black = ['h8', 'g8', 'f8', 'e8'];

        let toCheck_segments = [];
        let attackPieces = [];

        if(isWhite){ 
            if(checkIfAbsent('h1')) return { Moves: [], castling: false };
            toCheck_segments = white;
            attackPieces = board.black;
        }

        else if(!isWhite) {
            if(checkIfAbsent('h8')) return { Moves: [], castling: false };
            toCheck_segments = black;
            attackPieces = board.white;
        }

        const castlingEnabled = await CastlingService.isCastlingEnabled(playerId, board._id, toCheck_segments[0]);

        if(castlingEnabled) {
            const attackSet = getAttackSet(attackPieces, board.start_pawns)
            for(let i=1; i<toCheck_segments.length; ++i) {
                const segment_inCheck = toCheck_segments[i];
                if(attackSet.has(segment_inCheck)){
                    return { Success: true, Moves: [], message: "Segment is in check :" + segment_inCheck.toString() };
                }else if(i<toCheck_segments.length-1 && !checkIfAbsent(segment_inCheck)) {
                    return { Success: true, Moves: [], message: "Segment is not null :" + segment_inCheck.toString() };
                }
            }

            if(isWhite){
                return { 
                    Success: true, 
                    castling: true,
                    Moves: [toCheck_segments[1]], 
                    king: {
                        CS: 'e1',
                        DS: 'g1',
                        piece: 'WK1'
                    }, 
                    rook: {
                        piece: 'WR2',
                        CS: 'h1',
                        DS: 'f1'
                    }  
                };
            }
            else if(!isWhite){

                return { 
                    Success: true, 
                    castling: true,
                    Moves: [toCheck_segments[1]], 
                    king: {
                        CS: 'e8',
                        DS: 'g8',
                        piece: 'BK1'
                    },  
                    rook: {
                        piece: 'BR2',
                        CS: 'h8',
                        DS: 'f8'
                    }  
                };
            }
        }

        else {
            return { Success: false, castling: false, Error: "Castling not available", Moves: [] };
        }

    }

    catch(error) {
        throw new Error(error);
    }
}

const rookKingExists = (isWhite, castling_string) => {
    let rookSegment = null;
    let kingSegment = null;

    if(isWhite) {
        kingSegment = chessBoard["e1"].getRank();
        if(castling_string==="O-O") rookSegment = chessBoard["h1"].getRank();
        else if(castling_string==="O-O-O") rookSegment = chessBoard["a1"].getRank();   
    }

    else {
        kingSegment = chessBoard["e8"].getRank();
        if(castling_string==="O-O") rookSegment = chessBoard["h8"].getRank();
        else if(castling_string==="O-O-O") rookSegment = chessBoard["a8"].getRank();   
    }

    const kingColor = kingSegment.charAt(0);
    const kingRank = kingSegment.charAt(1);

    const rookColor = rookSegment.charAt(0);
    const rookRank = rookSegment.charAt(1);

    const validColor1 = ((isWhite && kingColor==="W" && rookColor==="W" )) ? true : false;
    const validColor2 = ((!isWhite && kingColor==="B" && rookColor==="B" )) ? true : false;

    return kingSegment!==null && rookSegment!==null && kingRank==="K" && rookRank==="R" && (validColor1 || validColor2);
}

const castlingValidMoves = async(playerId, board, pgn_string) => {
    try {
        const color = pgn_string.charAt(0);
        const isWhite  = (color==="W") ? true : false;

        const isValid = rookKingExists(isWhite, pgn_string.substring(1, pgn_string.length));
        if(!isValid) throw new Error("Castling cant be done");

        const castling_string = pgn_string.substring(1, pgn_string.length);
        if(castling_string === "O-O") {
            return kingSideCastlingMoves(playerId, board, isWhite);
        }

        else if(castling_string === "O-O-O") {
            return queenSideCastlingMoves(playerId, board, isWhite);
        }
    }

    catch(error) {
        throw new Error(error);
    }
}

exports.validMoves = async (details) => {
    try {
        const pgn_string = details.pgn_string;
        const gameId = details.gameId;
        const playerId = details.playerId;

        const isWhite = pgn_string==='W' ? true : false;

        const game = await GameDAO.getGameById(gameId);
        if(game._id && game._id!==null && game.status==='Progress' && playerId===game.player_turn) {
            const boardId = game.board_id;
            const board = await BoardDAO.getBoardById(boardId);

            populateBoard(board);

            const kingChecked = isKingChecked(board, pgn_string);

            if(kingChecked.checking) {
                return await restrictedMoves(game, board, pgn_string, kingChecked.pgn, kingChecked.kingSegment);
            }

            else if(await isStaleMate(board, pgn_string)) {
                const updatedGame = await GamesService.endGame(gameId, {
                    status: "Completed",
                    result: "Stalemate",
                    winner: "multiple"
                });

                return { Success: true, message: "No valid moves! Stale mate !", staleMate: true, Game: updatedGame  };
            }

            // else if(isKingExposed(pgn_string, kingChecked.kingSegment, board)) {
            //     return { Success: true, message: 'King will be exposed on making this move', Moves: [], kingExposingMove: true }
            // }

            else {
                const twoStepArray = board.start_pawns;
                const color = pgn_string.charAt(0);
                const isWhite = color==="W" ? true: false;

                const piece = pgn_string.charAt(1);

                if(piece === "O") {
                    return castlingValidMoves(playerId, board, pgn_string);
                }

                let moves = [];
                switch(piece) {
                    case 'P': moves = validPawnMove(pgn_string, twoStepArray);
                              
                              const EnpassantEligibleMoves = await EnpassantService.EnpassantEligibleMoves(gameId, isWhite, pgn_string.substring(3, 5));
                              if(EnpassantEligibleMoves.Success && EnpassantEligibleMoves.PassingSegment!==null) {
                                moves.Moves.push(EnpassantEligibleMoves.PassingSegment);
                              } 

                              break;
                    case 'R': moves = validRook(pgn_string);
                              break;
                    case 'N': moves = validKnight(pgn_string);
                              break;
                    case 'B': moves = validBishop(pgn_string);
                              break;
                    case 'Q': moves = validQueen(pgn_string);
                              break
                    case 'K': moves = await validKingMoves(pgn_string, board, playerId);
                              return moves;
                    default: return { Success: false, Error: 'Piece not found' };
                }

                let searchPattern = "";
                let pieces = [];

                if(isWhite) {
                    searchPattern = "WK1";
                    pieces = board.white;
                }
                else {
                    searchPattern = "BK1";
                    pieces = board.black;
                };

                const current_KS = getKingSegment(pieces, searchPattern);
                const movesArray = moves.Moves;
                let allowedMoves = [];
                for(let i=0; i<movesArray.length; ++i) {
                    const new_pgn = pgn_string + movesArray[i];
                    if(!isKingExposed(new_pgn, current_KS, board))
                        allowedMoves.push(movesArray[i]);
                }

                moves.Moves = allowedMoves;
                return moves;
            }
        }
        else  {
            console.log('Game not found / valid or Player not valid');
            return { Success: false, Error: 'Game not found / Player not valid' }
        }
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
} 


const staleKingMoves = (pgn_string, board) => {
    try {
        const color = pgn_string.substring(0,1);
        const piece_color = (color==='W')? 'white' : 'black';
        const currentSegment = pgn_string.substring(3, 5);
        const piece_rank = pgn_string.substring(0,3);

        if(checkIfAbsent(currentSegment)) 
            return { Success: false, Error: 'OOPS! There is no piece here' };

        const board_pieceColor = chessBoard[currentSegment].getColor(); //DB state color
        const board_pieceRank = chessBoard[currentSegment].getRank();   //DB state rank

        let allowedMoves = [];

        if(piece_color===board_pieceColor && board_pieceRank===piece_rank) {
            const rowIdx = parseInt(currentSegment.charAt(1)) - 1;
            const colIdx = segments[rowIdx].indexOf(currentSegment);

            let opponentAttackers = null;
            const twoStepArray = board.start_pawns;
            if(piece_color === "white") opponentAttackers = board.black;
            else if(piece_color === "black") opponentAttackers = board.white;
            const attackSet = getAttackSet(opponentAttackers, twoStepArray, currentSegment, true);

            const possible_indices = [
                { x:rowIdx+1, y: colIdx }, 
                { x:rowIdx+1, y: colIdx+1 }, 
                { x:rowIdx, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx+1 }, 
                { x:rowIdx-1, y: colIdx }, 
                { x:rowIdx-1, y: colIdx-1 }, 
                { x:rowIdx, y: colIdx-1 }, 
                { x:rowIdx+1, y: colIdx-1 } 
            ];

            for(let i=0; i<possible_indices.length; ++i) {
                const x = possible_indices[i].x;
                const y = possible_indices[i].y;
    
                if(checkValid(x, y)) {
                    const possible_segment = segments[x][y];
                    if(!attackSet.has(possible_segment))
                        if(checkIfAbsent(possible_segment) || !checkIfSameTeam(currentSegment, possible_segment)) 
                            allowedMoves.push(possible_segment);
                }
            }

            return { Success: true, Moves: allowedMoves, checkmate: false, staleMate: false, kingExposingMove: false };
        }

        else {
            console.log("Stale mate integrity mismatch");
            return { Success: false, Error: 'Possible hack' }
        }
    }

    catch(error) {
        console.log(error.message);
        return { Success: false, Error: error.message };
    }
} 

// CONVERT BOARD TO STRING
const chessSegments = [
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'
];


const returnSegmentString = (segment) => {
    if(chessBoard[segment]!==undefined && chessBoard[segment]===null) return "-";
    else {
        const rank = chessBoard[segment].getRank();
        return rank.substring(0, rank.length-1);
    };
}

// await CastlingService.isCastlingEnabled(playerId, board._id, toCheck_segments[0])
exports.destructureBoard = (board) => {
    try {
        populateBoard(board);

        let board_string = "";
        for(let i=0; i<chessSegments.length; ++i) {
            const segment = chessSegments[i];
            const segmentString = returnSegmentString(segment);
            board_string += segmentString;
        }

        return { Success: true, Data: board_string };
    }

    catch(error) {
        return { Success: false, Error: error };
    }
}
