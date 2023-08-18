const TrackMovesService = require('./TrackMovesService');

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

exports.EnpassantEligibleMoves = async (gameId, isWhite, currentPawnSegment) => {
    try {
        const additive = isWhite ? 1 : -1;

        const gameMenuMoves = await TrackMovesService.getMovesListMenu(gameId);

        if(gameMenuMoves.length===0) 
            return { Success: true, PassingSegment: null, Cutting_segment: null };

        const lastRecord = gameMenuMoves[gameMenuMoves.length-1];
        const lastMove = lastRecord.pgn_string;

        const rank = lastMove.charAt(1);
        if(rank !== "P") return { Success: true, PassingSegment: null, Cutting_segment: null };

        const prevSegment = lastMove.substring(4, 6);
        const currSegment = lastMove.substring(7, 9);

        const prevSegmentNo = parseInt(prevSegment.charAt(1));
        const curSegmentNo = parseInt(currSegment.charAt(1));
        const difference = Math.abs(prevSegmentNo - curSegmentNo);

        const rowIdx_PS = parseInt(currSegment.charAt(1)) - 1;
        const colIdx_PS = segments[rowIdx_PS].indexOf(currSegment);
        const rowIdx_CS = parseInt(currentPawnSegment.charAt(1)) - 1;
        const colIdx_CS = segments[rowIdx_CS].indexOf(currentPawnSegment);

        const rowDifference = rowIdx_CS - rowIdx_PS;
        const colDifference = Math.abs(colIdx_CS - colIdx_PS);

        if(rank==='P' && difference===2 && rowDifference===0 && colDifference===1) {
            const passing_segment = segments[rowIdx_PS + additive][colIdx_PS];
            return { Success: true, PassingSegment: passing_segment, Cutting_segment: currSegment };
        }
        return { Success: true, PassingSegment: null, Cutting_segment: null };
    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message };
    }
}


exports.isSpecialEnpassant = async (gameId, checking_pgn, defendingPieces) => {
    try {
        const piece = checking_pgn.charAt(1);
        if(piece === "P") {
            let defending_pawns_segments = [];
            for(let i=0; i<defendingPieces.length; ++i) {
                const piece = defendingPieces[i].piece;
                const segment = defendingPieces[i].segment_value;
                const piece_rank = piece.charAt(1);

                const total_piece = piece + segment; 

                if(piece_rank==="P") defending_pawns_segments.push(total_piece);
            }

            for(let i=0; i<defending_pawns_segments.length; ++i) {
                const piece = defending_pawns_segments[i];
                const isWhite = piece.charAt(0)==='W' ? true : false;
                const segment = piece.substring(3, 5);

                const Enpassant_move = await this.EnpassantEligibleMoves(gameId, isWhite, segment);
                if(Enpassant_move.Success && Enpassant_move.PassingSegment!==null)
                    return Enpassant_move;    
            }

            return { Success: true, PassingSegment: null, Cutting_segment: null };
        }

        return { Success: true, PassingSegment: null, Cutting_segment: null };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}