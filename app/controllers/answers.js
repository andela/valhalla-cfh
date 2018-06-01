/**
 * Module dependencies.
 */
// const async = require('async');
const mongoose = require('mongoose');
// const _ = require('underscore');

const Answer = mongoose.model('Answer');


/**
 * Find answer by id
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {Object} id
 * @return {*} void
 */
exports.answer = (req, res, next, id) => {
  Answer.load(id, (err, answer) => {
    if (err) return next(err);
    if (!answer) return next(new Error(`Failed to load answer ${id}`));
    req.answer = answer;
    next();
  });
};

/**
 * Show an answer
 * @param {Object} req
 * @param {Object} res
 * @return {Object} answer
 */
exports.show = (req, res) => {
  res.jsonp(req.answer);
};

/**
 * List of Answers
 * @param {Object} req
 * @param {Object} res
 * @return {Object} err, answers
 */
exports.all = (req, res) => {
  Answer.find({ official: true })
    .select('-_id').exec((err, answers) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(answers);
      }
    });
};

/**
 * List of Answers (for Game class)
 * @param {func} cb
 * @return {*} err, void
 */
exports.allAnswersForGame = (cb) => {
  Answer.find({ official: true })
    .select('-_id').exec((err, answers) => {
      if (err) {
        return new Error(err);
      }
      cb(answers);
    });
};
