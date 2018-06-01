/**
 * Module dependencies.
 */
// const mongoose = require('mongoose');
// const async = require('async');
// const _ = require('underscore');

/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.play = (req, res) => {
  if (Object.keys(req.query)[0] === 'custom') {
    res.redirect('/#!/app?custom');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Render index page
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.render = (req, res) => {
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};
