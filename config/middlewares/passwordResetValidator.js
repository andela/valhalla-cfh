/**
 * validator for user signup
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {*} error, void
 */
exports.sendResetLink = (req, res, next) => {
  req.check('email', 'Email cannot be empty or invalid').isEmail();
  req.sanitizeBody('email').trim();

  const errors = req.validationErrors();

  const errorObject = {};

  if (errors) {
    errors.map((err) => {
      errorObject[err.param] = (err.msg);
      return errorObject;
    });
    return res.status(400).json(errorObject);
  }

  next();
};
/**
 * validator for user signup
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {*} error, void
 */
exports.resetPassword = (req, res, next) => {
  req.check('password', 'Minimum password length should be 6 characters')
    .isLength({ min: 6 }).trim();
  req.sanitizeBody('email').trim();

  const errors = req.validationErrors();

  const errorObject = {};

  if (errors) {
    errors.map((err) => {
      errorObject[err.param] = (err.msg);
      return errorObject;
    });
    return res.status(400).json(errorObject);
  }

  next();
};
