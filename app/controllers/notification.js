const mongoose = require('mongoose');

const Notification = mongoose.model('Notification');


exports.newNotification = (req, res) => {
  const { receiverName, gameLink } = req.body;
  const { decoded } = req;

  const notification = new Notification({
    sender: decoded.name,
    receiver: receiverName,
    message: `${decoded.name} invited you to a game`,
    gameLink,
    status: 0
  });

  notification.save((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Internal Server Error'
      });
    }
    res.status(200).json({
      message: 'Notification sent!'
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
  Notification.findOneAndUpdate(
    { _id: id },
    { $set: { status: 1 } }
  ).exec((err) => {
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
