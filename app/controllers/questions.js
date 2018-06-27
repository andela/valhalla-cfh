/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
// const async = require('async');
const Question = mongoose.model('Question');
// const _ = require('underscore');
const regionIdList = [
  '59b91ad4605e234f4555a4dd',
  '59b91ad4605e234f4555a4dc',
  '59b8ffd328650f1362ca5940',
  '59b8ffde28650f1362ca5941',
  '59b90186ad7d37a9fb7d3630'
];

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
 * @param {func} cb
 * @param {String} regionIndex
 * @return {*} err, void
 */
exports.allQuestionsForGame = (cb, regionIndex) => {
  if (!regionIndex || regionIndex >= 6) {
    Question.find({ official: true, numAnswers: { $lt: 3 } })
      .select('-_id').exec((err, questions) => {
        if (err) {
          return new Error(err);
        }
        cb(questions);
      });
  } else {
    Question.find({
      official: true,
      numAnswers: { $lt: 3 },
      regionId: regionIdList[regionIndex - 1]
    })
      .select('-_id').exec((err, questions) => {
        if (err) {
          return new Error(err);
        }
        cb(questions);
      });
  }
};
