/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
// const async = require('async');
const Question = mongoose.model('Question');
// const _ = require('underscore');

/**
 * Find question by id
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {Object} id
 * @return {*} err, void
 */
exports.question = (req, res, next, id) => {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error(`Failed to load question ${id}`));
    req.question = question;
    next();
  });
};

/**
 * Show an question
 * @param {Object} req
 * @param {Object} res
 * @return {*} err, void
 */
exports.show = (req, res) => {
  res.jsonp(req.question);
};

/**
 * List of Questions
 * @param {Object} req
 * @param {Object} res
 * @return {*} err, void
 */
exports.all = (req, res) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } })
    .select('-_id').exec((err, questions) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(questions);
      }
    });
};

/**
 * List of Questions (for Game class)
 */
/**
 * List of Questions (for Game class)
 * @param {func} cb
 * @return {*} err, void
 */
exports.allQuestionsForGame = (cb) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } })
    .select('-_id').exec((err, questions) => {
      if (err) {
        return new Error(err);
      }
      cb(questions);
    });
};
