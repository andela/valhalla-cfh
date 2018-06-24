/*eslint-disable */
/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const _ = require('underscore');

const authTypes = ['github', 'twitter', 'facebook', 'google'];
const { Schema } = mongoose;


/**
 * User Schema
 */
const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  provider: String,
  avatar: String,
  profile_image: String,
  points: Number,
  friendRequests: [],
  friends: [],
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [],
  hashed_password: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password;
  this.hashed_password = this.encryptPassword(password);
}).get(() => this._password);

/**
 * Validations
 */
const validatePresenceOf = value => value && value.length;

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate((name) => {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate((email) => {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('username').validate((username) => {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate((hashed_password) => {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', (next) => {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean} true or false
     * @api public
     */
  authenticate(plainText) {
    if (!plainText || !this.hashed_password) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashed_password);
  },

  /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String} hashed password
     * @api public
     */
  encryptPassword(password) {
    if (!password) return '';
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
};

mongoose.model('User', UserSchema);
