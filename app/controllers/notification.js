const mongoose = require('mongoose');

const Notification = mongoose.model('Notification');


exports.newNotification = (req, res) => {
  const {
    link, message, requestStatus, receiver, status, requestAccepted
  } = req.body;
  const { decoded } = req;

  const notification = new Notification({
    sender: decoded.name,
    receiver,
    senderEmail: decoded.email,
    message,
    link,
    status,
    friendRequest: parseInt(requestStatus, 10),
    requestAccepted
  });

  notification.save((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    res.status(200).json({
      message: 'Notification sent!',
      notification
    });
  });
};

exports.getNotifications = (req, res) => {
  const { decoded } = req;

  Notification.find({
    receiver: decoded.name,
    status: 0
  }).exec((err, notification) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    res.status(200).json({
      message: 'Notifications loaded successfully!',
      notification
    });
  });
};

exports.readNotification = (req, res) => {
  const { id } = req.body;
  Notification.findOneAndRemove({ _id: id }).exec((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    res.status(200).json({
      message: 'Notifications seen!'
    });
  });
};
