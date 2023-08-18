const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//TODO: map player_id to actual user_id
const gameSchema = new Schema(
  {
    contract_address: {
      type: String,
      required: true,
    },
    board_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },
    player_1: {
      type: String,
      default: null,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'Player',
    },
    player_2: {
      type: String,
      default: null,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'Player',
    },
    status: {
      type: String,
      default: "Pending",
    },
    player_turn: {
      type: String,
      default: null,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'Player',
    },
    bid: {
      type: Number,
      required: true,
    },
    lastPlayed: {
      type: Date,
      default: null,
    },
    result: {
      type: String,
      default: null,
    },
    winner: {
      type: String,
      default: null,
    },
    isDrawRequested: {
      type: Boolean,
      default: false,
    },
    drawRequestedBy: {
      type: String,
      default: null,
    },
    network: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Network',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const GameModel = mongoose.model("Game", gameSchema);
module.exports = GameModel;
