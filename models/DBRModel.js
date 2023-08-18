const mongoose = require('mongoose');

const dbrSchema = new mongoose.Schema({
    game_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    pastGameStates: {
        type: Array,
        required: true,
        default: []
    }
}, {
    timestamps: true
});

const DBRModel = mongoose.model('DBR', dbrSchema);
module.exports = DBRModel;