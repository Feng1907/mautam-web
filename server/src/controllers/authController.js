const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = async (req, res, next) => {
  try {
    const { email, matKhau } = req.body;
    const user = await User.findOne({ email }).select('+matKhau');
    if (!user || !(await user.kiemTraMatKhau(matKhau)))
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    const token = signToken(user._id);
    user.matKhau = undefined;
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
