const mongoose = require('mongoose');

const Game = mongoose.model('Game');

exports.saveGameResults = (req, res) => {
  const game = new Game();

  game.gameId = req.params.id;
  game.gameCzar = req.body.gameCzar;
  game.gameWinner = req.body.gameWinner;
  game.gamePlayers = req.body.gamePlayers;
  game.date = new Date();

  game.save((error, gameSaved) => {
    if (error) {
      return error;
    }
    res.status(201).json({
      message: 'Game results saved successfully',
      gameSaved
    });
  });
};

exports.history = (req, res) => {
  Game.find().exec((err, games) => {
    if (err) {
      return res.status(500).json({
        message: 'Internal Server error'
      });
    }
    if (!games) {
      return res.status(404).json({
        message: 'No Game Found',
        error: true
      });
    }
    return res.status(200).json({
      message: 'Game Found',
      games
    });
  });
};

exports.leaderBoard = (req, res) => {
  // return console.log('Enter into the function');
  Game.aggregate(
    [
      { $group: { _id: '$gameWinner', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    (err, logs) => {
      if (err) {
        return res.status(500).json({
          message: 'Internal Server error'
        });
      }
      if (!logs) {
        return res.status(404).json({
          message: 'No Game Log',
          error: true
        });
      }
      return res.status(200).json({
        message: 'Game Found',
        logs
      });
    }
  );
};

