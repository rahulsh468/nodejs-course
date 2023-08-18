const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    board_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    white: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    black: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
});

const PlayerModel = mongoose.model('Player', playerSchema);
module.exports = PlayerModel;

