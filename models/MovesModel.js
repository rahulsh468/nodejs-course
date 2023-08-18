const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moveSchema = new Schema({
    player: {
        // type: mongoose.Schema.Types.ObjectId,4       
        // ref: 'Player',
        type: String,
        required: true
    },
    whitesMove: {
        type: Boolean,
        required: false
    },
    
    current_pgn: {
        type: String,
        required: true
    },
    new_pgn: {
        type: String,
        required: true
    },

    actual_pgn: {
        type: String,
        required: true
    },

    pieceKilled: {
        type: String,
        required: true,
        default: null
    },
    date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const moveListSchema = new Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    moves: [ moveSchema ]
});

const MovesModel = mongoose.model('Move', moveListSchema);
module.exports = MovesModel;

