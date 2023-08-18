const BoardDAO = require('../dao/BoardDAO');

const default_white = [ 
    { segment_value:'a2', piece:'WP1', isWhite:true },
    { segment_value:'b2', piece:'WP2', isWhite:true },
    { segment_value:'c2', piece:'WP3', isWhite:true },
    { segment_value:'d2', piece:'WP4', isWhite:true },
    { segment_value:'e2', piece:'WP5', isWhite:true },
    { segment_value:'f2', piece:'WP6', isWhite:true },
    { segment_value:'g2', piece:'WP7', isWhite:true },
    { segment_value:'h2', piece:'WP8', isWhite:true },

    { segment_value:'a1', piece:'WR1', isWhite:true },
    { segment_value:'b1', piece:'WN1', isWhite:true },
    { segment_value:'c1', piece:'WB1', isWhite:true },
    { segment_value:'e1', piece:'WK1', isWhite:true },
    { segment_value:'d1', piece:'WQ1', isWhite:true },
    { segment_value:'f1', piece:'WB2', isWhite:true },
    { segment_value:'g1', piece:'WN2', isWhite:true },
    { segment_value:'h1', piece:'WR2', isWhite:true },
];

const default_black = [ 
    { segment_value:'a7', piece:'BP1', isWhite:false },
    { segment_value:'b7', piece:'BP2', isWhite:false },
    { segment_value:'c7', piece:'BP3', isWhite:false },
    { segment_value:'d7', piece:'BP4', isWhite:false },
    { segment_value:'e7', piece:'BP5', isWhite:false },
    { segment_value:'f7', piece:'BP6', isWhite:false },
    { segment_value:'g7', piece:'BP7', isWhite:false },
    { segment_value:'h7', piece:'BP8', isWhite:false },

    { segment_value:'a8', piece:'BR1', isWhite:false },
    { segment_value:'b8', piece:'BN1', isWhite:false },
    { segment_value:'c8', piece:'BB1', isWhite:false },
    { segment_value:'e8', piece:'BK1', isWhite:false },
    { segment_value:'d8', piece:'BQ1', isWhite:false },
    { segment_value:'f8', piece: 'BB2', isWhite:false },
    { segment_value:'g8', piece:'BN2', isWhite:false },
    { segment_value:'h8', piece:'BR2', isWhite:false },
];

const twoStep = [ 
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'
]

exports.createBoard = async() => {
    try {   
        const board_object = {
            white: default_white,
            black: default_black,
            whiteKilled: [],
            blackKilled: [],
            start_pawns: twoStep
        };

        const board = await BoardDAO.createBoard(board_object);
        return board;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.getBoardById = async(boardId) => {
    try {   
        const board = await BoardDAO.getBoardById(boardId);
        return board;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}