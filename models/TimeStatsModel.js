const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeStatsSchema = new Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true
    },
    player_id: {
        type: String,
        required: true
    },
    totalTime: {
        type: Number,
        required: true,
        default: 0
    },
    moves: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

const TimeStatsModel = mongoose.model('StatsTime', timeStatsSchema);
module.exports = TimeStatsModel;