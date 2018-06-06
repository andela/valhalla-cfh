/**
 * validator for user signup
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {*} error, void
 */
exports.userSignup = (req, res, next) => {
  req.check('name', 'Username is required').notEmpty();
  req.check('email', 'Email cannot be empty or invalid').isEmail().trim();
  req.check('password', 'Minimun password length is 6 chars')
    .isLength({ min: 6 }).trim();
  req.sanitizeBody('username').trim();
  req.sanitizeBody('email').trim();

  const errors = req.validationErrors();

  const errorArray = [];

  if (errors) {
    errors.map((err) => {
      errorArray.push(err.msg);
      return errorArray;
    });
    return res.status(400).json(errorArray);
  }

  next();
};
