const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.tokenVerification = (req, res, next) => {
  // Get token value from headers
  const token = req.headers.authorization || req.headers['x-access-token'];
  if (!token) {
    // No token
    return res.status(401).json({
      message: 'Kindly sign in',
      error: true
    });
  }
  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      // Error with token
      return res.status(401).json({
        message: 'Please sign in',
        error: error.message
      });
    }
    req.decoded = decoded;
    next();
  });
};
