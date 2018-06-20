const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.verifyResetToken = (req, res, next) => {
  // Get token value from headers
  const { token } = req.params;
  // return console.log(token);

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      res.redirect('/#!/password-reset-error');
    } else {
      req.decoded = decoded;
      next();
    }
  });
};

