const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const segmentSchema = new Schema({
    segment_value: {
        type: String,
        required: true
    },
    piece: {
        type: String,
        required: true,
    },
    isWhite: {
        type: Boolean,
        default: false
    },
    isPawnPromoted: {
        type: Boolean,
        required: true,
        default: false
    },
    pawn: {
        type: String,
        default: null,
    }
});

const boardSchema = new Schema({
    white: [ segmentSchema ],
    black: [ segmentSchema ],
    whiteKilled: [ segmentSchema ],
    blackKilled: [ segmentSchema ],
    start_pawns: {
        type: Array,
        required: true
    }
}, {
    timestamps: true
});

const BoardModel = mongoose.model('Board', boardSchema);
module.exports = BoardModel;

