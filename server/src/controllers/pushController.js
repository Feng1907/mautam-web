const User = require('../models/User');
const { vapidPublicKey } = require('../config/webPush');

const getPublicKey = (req, res) => {
  res.json({
    success: true,
    data: { publicKey: vapidPublicKey },
  });
};

const subscribe = async (req, res, next) => {
  try {
    const { endpoint, expirationTime = null, keys } = req.body;

    const subscription = {
      endpoint,
      expirationTime: expirationTime ? new Date(expirationTime) : null,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      userAgent: req.get('user-agent') || '',
      updatedAt: new Date(),
    };

    const existingIndex = req.user.pushSubscriptions.findIndex(
      (item) => item.endpoint === endpoint
    );

    if (existingIndex >= 0) {
      req.user.pushSubscriptions[existingIndex].set(subscription);
    } else {
      req.user.pushSubscriptions.push({
        ...subscription,
        createdAt: new Date(),
      });
    }

    await req.user.save();

    res.status(existingIndex >= 0 ? 200 : 201).json({
      success: true,
      message: 'Da luu subscription nhan thong bao',
      data: {
        userId: req.user._id,
        subscriptionCount: req.user.pushSubscriptions.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    res.json({
      success: true,
      message: 'Da huy subscription nhan thong bao',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicKey,
  subscribe,
  unsubscribe,
};
