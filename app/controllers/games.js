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
