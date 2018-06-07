const mongoose = require('mongoose');

const { Schema } = mongoose;

const GameSchema = new Schema({
  gameId: {
    type: String
  },
  gameCzar: {
    type: String
  },
  gameWinner: {
    type: String,
    default: '',
    trim: true
  },
  gamePlayers: {
    type: Object,
    default: ''
  },
  date: Date
});

mongoose.model('Game', GameSchema);
