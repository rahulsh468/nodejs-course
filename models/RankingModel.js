const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//TODO: save Object._id as player_id, easy for retrieval ( when creating documents )

const rankingSchema = new Schema({
    player_name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const RankingModel = mongoose.model('Ranking', rankingSchema);
module.exports = RankingModel;