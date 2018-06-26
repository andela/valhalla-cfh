/*eslint-disable */
/**
 * Module dependencies.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const avatars = require('./avatars').all();
const nodemailer = require('nodemailer');

const User = mongoose.model('User');
const Game = mongoose.model('Game');

require('dotenv').config();

/**
 * Auth callback
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Create user
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {Object} webpage
 */
exports.create = (req, res, next) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * Assign avatar to user
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return {Object} webpage
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

/**
 * Add donation
 * @param {Object} req
 * @param {Object} res
 * @return {*} void
 */
exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i += 1) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            // Validated donation
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 * Show profile
 * @param {Object} req
 * @param {Object} res
 * @return {Object} webpage
 */
exports.show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 * @param {Object} req
 * @param {Object} res
 * @return {Object} user object
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {Object} id
 * @return {*} void
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

/**
* Register a new user
* @param {Object} req
* @param {Object} res
* @return {Object} registration object
*/
exports.validator = (req, res) => {
  User.findOne({
    email: req.body.email
  }).exec((err, existingUser) => {
    if (existingUser) {
      return res.status(409).json({
        emailConflict: 'Email is taken'
      });
    }

    return res.status(200).json(['okay']);
  });
};

/**
* Register a new user
* @param {Object} req
* @param {Object} res
* @return {Object} registration object
*/
exports.finishUserSignup = (req, res) => {
  User.findOne({
    email: req.body.email
  }).exec((err, existingUser) => {
    if (existingUser) {
      return res.status(409).json(['Email is taken']);
    }

    const user = new User(req.body);
    user.provider = 'local';
    user.save((err, createdUser) => {
      if (err) {
        return res.status(500).json(['User data not saved']);
      }
      
      const userData = {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email
      };

      const token = jwt.sign(userData, process.env.SECRET);

      req.login(createdUser, (err) => {
        if (err) return next(err);
      
        return res.status(201).json({
          message: `Welcome, ${createdUser.name}`,
          token,
          userData
        });
      });
    });
  });
};

/**
* Method to Login User
* @param {Object} req
* @param {Object} res
* @return {Object} logged in object
*/
exports.login = (req, res) => {
  // Destructure from user
  const { email, password } = req.body;
  // Find email
  User.findOne({ email }).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    // If no user found
    if (!user) {
      return res.status(400).json({
        error: 'No user found!'
      });
    }
    // Compare password from user to database
    if (bcrypt.compareSync(password, user.hashed_password)) {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      // Create token
      const token = jwt.sign(userData, process.env.SECRET);
      // return res.status(200).json({
      //   token,
      //   message: 'Successfully SignIn',
      // });

      
      return res.status(200).json({
        token,
        message: 'Successfully SignIn',
      });
    }
    return res.status(400).json({
      error: 'Username or Password is Incorrect'
    });
  });
};

/**
* Method to reset User password
* @param {Object} req
* @param {Object} res
* @return {Object} logged in object
*/
exports.resetPassword = (req, res) => {
  // Destructure from req.body
  const { email, password, confirmPassword } = req.body;
  // Find email
  User.findOne({ email }).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    // If no user found
    if (!user) {
      return res.status(400).json({
        emailError: 'Sorry user with email provided does not exist'
      });
    }
    
    // Compare password from user
    if (password !== confirmPassword) {
      return res.status(400).json({
        passwordMismatch: 'Passwords do not match'
      });
    }

    user.password = password; 
    user.save((err, updatedUser) => {
      if (err) {
        return res.status(500).json(['Sorry password update failed']);
      }
      
      const userData = {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      };

      const token = jwt.sign(userData, process.env.SECRET);

      req.login(updatedUser, (err) => {
        if (err) return next(err);
      
        return res.status(200).json({
          message: `Welcome, ${updatedUser.name}`,
          token,
          userData
        });
      });
    });
  });
};

exports.search = function (req, res) {
  const { searchTerm } = req.body;
  const escapeRegex = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const searchQuery = new RegExp(escapeRegex, 'gi');
  let foundUsers = [];
  User.find()
    .or([
      { 'name': searchQuery }, { 'email': searchQuery }
    ])
    .exec((error, users) => {
      if (error) {
        return res.status(500).send({
          error: 'Internal Server Error'
        });
      }
      if (users.length === 0) {
        return res.status(404).send({
          error: 'User not found'
        });
      }
      users.forEach((user) => {
        const userDetails = {
          email: user.email,
          name: user.name
        };
        return foundUsers.push(userDetails)
      });
      return res.status(200).send({
        message: 'Successfully found users',
        foundUsers
      });
  });
};

exports.invites = function (req, res) {
  const { userEmail, username, gameLink } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'valhallacfh@gmail.com',
      pass: 'valhalla190'
    }
  });
  const mailOptions = {
    from: 'valhallacfh@gmail.com',
    to: userEmail,
    subject: 'CFH - Join Cards for Humanity Game',
    html: `<p>Hello ${username}, </p>
          <p>Valhalla CFH invites link: ${gameLink}, join game on Cards For Humanity</p>`
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      res.status(500).json({
        error: 'Email Not Sent!'
      });
    } else {
      res.status(200).json({
        message: `Email invite sent successfully`
      });
    }
  });
};

exports.profile = function (req, res) {
  const { decoded } = req;
  const { username } = req.query;
  let getPlayers = '';

  if(username){
    const { username } = req.query;
    let getPlayers = '';
  
    User.findOne({
      name: username
    }).exec((err, user) => {
      if (err) {
        return res.status(500).json({
          error: 'Internal Server Error'
        });
      }
      // No user found
      if (!user) {
        return res.status(400).json({
          error: 'No user found'
        });
      }
  
      Game.find({ gamePlayers: user.name }).exec((err, players) => {
        if (err) {
          return res.status(500).json({
            message: 'Internal server error'
          });
        }
        if (!players) {
          return res.status(404).json({
            message: 'No players found',
            error: true
          })
        }
  
        getPlayers = players;
        return res.status(200).json({
          message: 'User found!',
          user,
          players
        });
      });
    });
  }
else{
  User.findOne({
    _id: decoded.id
  }).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    // No user found
    if (!user) {
      return res.status(400).json({
        error: 'No user found'
      });
    }

    Game.find({ gamePlayers: user.name }).exec((err, players) => {
      if (err) {
        return res.status(500).json({
          message: 'Internal server error'
        });
      }
      if (!players) {
        return res.status(404).json({
          message: 'No players found',
          error: true
        })
      }

      getPlayers = players;
      return res.status(200).json({
        message: 'User found!',
        user,
        players
      });
    });
  });
}
}

exports.friends = function (req, res) {
  const { decoded } = req;

  User.find({
    _id: decoded.id
  }).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    return res.status(200).json({
      message: 'User found',
      friends: user[0].friends
    });
  });
};

exports.getUser = (req, res) => {
  const { decoded } = req;

  User.find({
    _id: decoded.id
  }).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    // No user found
    if (!user) {
      return res.status(400).json({
        error: 'No user found'
      });
    }

    Game.find({ gamePlayers: user.name }).exec((err, players) => {
      if (err) {
        return res.status(500).json({
          message: 'Internal server error'
        });
      }
      if (!players) {
        return res.status(404).json({
          message: 'No players found',
          error: true
        })
      }

      getPlayers = players;
      return res.status(200).json({
        message: 'User found!',
        user,
        players
      });
    });
  });
}

exports.sendFriendRequest = (req, res) => {
  const { decoded } = req;
  const { receiverName, receiverEmail } = req.body;
  
  const senderName = decoded.name;
  const senderEmail = decoded.email;

  User.findOneAndUpdate(
    { _id: decoded.id },
    { $push: {friendRequests: {receiverName}} }
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
  });

  User.findOneAndUpdate(
    { name: receiverName },
    { $push: {friendRequests: {senderName}} }
  ).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    res.status(200).json({
      message: 'Friend Request Sent Succesfully!'
    });
  });
};

exports.acceptFriendRequest = (req, res) => {
  const { decoded } = req;
  const { senderName, senderEmail } = req.body;
  const receiverName = decoded.name;
  const receiverEmail = decoded.email;

  User.findOneAndUpdate(
    { _id: decoded.id },
    { $pull: {friendRequests: { senderName }} }
  ).exec((err, user) => {
    console.log(user);
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error receiver end'
      });
    }

    console.log('pull from 1');
    
  });

  User.findOneAndUpdate(
    { name: senderName },
    { $pull: {friendRequests: { receiverName }} } 
  ).exec((err, user) => {
    console.log(user);
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    console.log('pull from 2');

  });

  User.findOneAndUpdate(
    { _id: decoded.id },
    { $push: {friends: {senderName}} }
  ).exec((err, user) => {
    console.log(user);
    
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }

    console.log('error from 1');

  });

  User.findOneAndUpdate(
    { name: senderName },
    { $push: {friends: {receiverName}} }
  ).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    console.log('error from 2');

    res.status(200).json({
      message: 'Friend Request Accepted!'
    });
  });
};

exports.rejectFriendRequest = (req, res) => {
  const { decoded } = req;
  const receiverName = decoded.name;
  // const senderEmail = decoded.email;
  const { senderName } = req.body;

  User.findOneAndUpdate(
    { _id: decoded.id },
    { $pull: {friendRequests: { senderName }} }
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error receiver end'
      });
    }
  });

  User.findOneAndUpdate(
    { name: senderName },
    { $pull: {friendRequests: { receiverName }} }
  ).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    res.status(200).json({
      message: 'Friend Request Rejected!'
    });
  });
}

exports.deleteFriend = (req, res, next) => {
  const { decoded } = req;
  const { receiverName } = req.body;
  const senderName = decoded.name;

  User.findOneAndUpdate(
    { _id: decoded.id },
    { $pull: {friends: { senderName: receiverName }} },
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
  });

  User.findOneAndUpdate(
    { name: receiverName },
    { $pull: {friends: { senderName: senderName }} },
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
  });


  User.findOneAndUpdate(
    { _id: decoded.id },
    { $pull: {friends: { receiverName: receiverName }} },
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
  });

  User.findOneAndUpdate(
    { name: receiverName },
    { $pull: {friends: { receiverName: senderName }} },
  ).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    next(); 
  });
};
