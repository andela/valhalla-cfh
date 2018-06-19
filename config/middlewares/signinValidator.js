/**
 * Validator class
 * @class Validator
 */
class Validator {
  /**
   * sign in validator
   * @param {Object} req
   * @param {Object} res
   * @param {Object} next
   * @return {*} error, void
   */
  static signin(req, res, next) {
    req.checkBody({
      email: {
        notEmpty: true,
        isEmail: {
          errorMessage: 'Provide a valid Email Address'
        },
        errorMessage: 'Your Email Address is required'
      },

      password: {
        notEmpty: true,
        errorMessage: 'Your Password is required'
      },
    });
    const errors = req.validationErrors();
    if (errors) {
      const allErrors = {};
      errors.forEach((error) => {
        allErrors[error.param] = error.msg;
      });
      return res.status(400)
        .json(allErrors);
    }

    next();
  }
}

module.exports = Validator;
