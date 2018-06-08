/*eslint-disable */
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;

const User = mongoose.model('User');
const config = require('./config');
require('dotenv').config();

module.exports = (passport) => {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    ((email, password, done) => {
      User.findOne({
        email
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        user.email = null;
        user.hashed_password = null;
        return done(null, user);
      });
    })
  ));

  // Use twitter strategy
  passport.use(new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY || config.twitter.clientID,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET || config.twitter.clientSecret,
      // callbackURL: process.env.TWITTER_CALLBACK_URL,
      includeEmail: true
    },
    ((token, tokenSecret, profile, done) => {
      User.findOne({
        'twitter.id_str': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile._json.email,
            username: profile.username,
            provider: 'twitter',
            profile_image: profile._json.profile_image_url
          });

          user.save((err) => {
            if (err) return err;
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use facebook strategy
  passport.use(new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'email', 'gender', 'picture.width(200).height(200)', 'link', 'locale', 'name', 'timezone'],
      enableProof: true
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'facebook.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile._json.email || '',
            username: profile.username,
            provider: 'facebook',
            profile_image: profile.photos[0].value
          });

          user.save((err) => {
            if (err) return err;
            user.facebook = null;
            return done(err, user);
          });
        } else {
          user.facebook = null;
          return done(err, user);
        }
      });
    })
  ));

  // Use google strategy
  passport.use(new GoogleStrategy(
    {

      clientID: process.env.GOOGLE_CLIENT_ID || config.google.clientID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || config.google.clientSecret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'google.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            profile_image: profile._json.picture
          });

          user.save((err) => {
            if (err) return err;
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use instagramstrategy
  passport.use(new InstagramStrategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID || config.instagram.clientID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || config.instagram.clientSecret,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL

    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'instagram.data.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: (profile.emails && profile.emails[0].value) || '',
            username: profile.username,
            provider: 'instagram',
            profile_image: profile._json.data.profile_picture
          });
          
          user.save((err) => {
            if (err) return err;
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));
};
