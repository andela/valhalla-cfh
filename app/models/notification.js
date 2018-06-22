const mongoose = require('mongoose');
// const config = require('../../config/config');
const { Schema } = mongoose;


/**
 * Notification Schema
 */
const NotificationSchema = new Schema({
  sender: {
    type: String
  },
  receiver: {
    type: String
  },
  message: {
    type: String
  },
  link: {
    type: String
  },
  status: {
    type: Number
  }
});

mongoose.model('Notification', NotificationSchema);
