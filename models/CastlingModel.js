const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const castlingSchema = new Schema({
    board_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    player_id: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Player',
        required: true
    },
    rook_1_moved : {
        type: Boolean,
        default: false
    },
    rook_2_moved : {
        type: Boolean,
        default: false
    },
    castling_done: {
        type: Boolean,
        default: false
    }
});

const CastlingModel = mongoose.model('Castling', castlingSchema);
module.exports = CastlingModel;

