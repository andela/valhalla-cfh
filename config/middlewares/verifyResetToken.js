const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.verifyResetToken = (req, res, next) => {
  // Get token value from headers
  const { token } = req.params;

  jwt.verify(token, process.env.SECRET, (error) => {
    if (error) {
      res.redirect('/#!/password-reset-error');
    } else {
      req.decoded = token;
      next();
    }
  });
};

exports.resetToken = (req, res, next) => {
  // Get token value from headers
  const { token } = req.body;
  const jwtToken = token.split('?')[1];

  jwt.verify(jwtToken, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(400).json({
        message: 'Sorry, an error occurred please use the forgot password section'
      });
    }
    req.decoded = decoded;
    next();
  });
};

