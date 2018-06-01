/**
 * Generic require login routing middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {*} void
 */
exports.requiresLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
  /**
  * Generic require login routing middleware
  * @param {Object} req
  * @param {Object} res
  * @param {Object} next
  * @return {*} void
  */
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

/**
 * Article authorizations routing middleware
 */
// exports.article = {
//   hasAuthorization: (req, res, next) => {
//     if (req.article.user.id !== req.user.id) {
//       return res.send(401, 'User is not authorized');
//     }
//     next();
//   }
// };
