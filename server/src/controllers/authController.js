const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { logAction } = require('../utils/auditLog');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS   = 15 * 60 * 1000; // 15 phút

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, matKhau } = req.body;
    if (!email || !matKhau)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({ email }).select('+matKhau +loginAttempts +lockUntil');
    if (!user)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    // Kiểm tra tài khoản bị khóa
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Tài khoản tạm khóa do đăng nhập sai nhiều lần. Thử lại sau ${minutesLeft} phút.`,
      });
    }

    const isMatch = await user.kiemTraMatKhau(matKhau);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { loginAttempts: attempts };
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        update.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        update.loginAttempts = 0;
      }
      await User.updateOne({ _id: user._id }, update);
      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      return res.status(401).json({
        success: false,
        message: remaining > 0
          ? `Email hoặc mật khẩu không đúng. Còn ${remaining} lần thử trước khi tài khoản bị khóa.`
          : 'Tài khoản đã bị khóa 15 phút do đăng nhập sai quá nhiều lần.',
      });
    }

    // Đăng nhập thành công — reset counter + ghi lịch sử
    const ua = req.headers['user-agent'] || '';
    const browser = ua.includes('Firefox') ? 'Firefox' : ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Browser';
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : ua.includes('Android') ? 'Android' : ua.includes('Mac') ? 'Mac' : 'Unknown';
    await User.updateOne({ _id: user._id }, {
      loginAttempts: 0, lockUntil: null,
      $push: { loginHistory: { $each: [{ ip: req.ip, device: `${browser} / ${os}`, loginAt: new Date() }], $slice: -10 } },
    });
    logAction(req, 'login', 'user', user.hoTen);

    const token = signToken(user._id);
    user.matKhau = undefined;
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await require('../models/User').findById(req.user._id)
    .populate('lopPhuTrach', 'tenLop').lean();
  res.json({ success: true, user, data: user });
};

// GET /api/auth/login-history
exports.getLoginHistory = async (req, res) => {
  const user = await require('../models/User').findById(req.user._id)
    .select('loginHistory').lean();
  const history = (user?.loginHistory || []).slice().reverse();
  res.json({ success: true, data: history });
};

// POST /api/auth/signup  (Đăng ký công khai — mặc định vaiTro='user')
exports.signup = async (req, res, next) => {
  try {
    const { hoTen, email, matKhau, soDienThoai } = req.body;

    if (!hoTen || !email || !matKhau)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });

    if (matKhau.length < 6)
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký' });

    const user = await User.create({
      hoTen,
      email,
      matKhau,
      soDienThoai,
      vaiTro: 'user',  // Đăng ký công khai luôn là user thường
    });

    const token = signToken(user._id);
    user.matKhau = undefined;
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register  (Admin tạo tài khoản cho Huynh trưởng — gửi email MK tạm)
exports.register = async (req, res, next) => {
  try {
    const { hoTen, email, vaiTro, soDienThoai } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });

    const matKhauTam = crypto.randomBytes(4).toString('hex');

    const user = await User.create({
      hoTen,
      email,
      matKhau: matKhauTam,
      vaiTro: vaiTro || 'giaoly',
      soDienThoai,
      phaiBatDauDoiMatKhau: true,
    });

    // Gửi email không chặn — nếu lỗi vẫn trả về thành công kèm mật khẩu tạm
    let emailSent = true;
    try {
      await sendEmail({
        to: email,
        subject: 'Tài khoản Xứ Đoàn Anrê Phú Yên - Mẫu Tâm',
        html: `
          <p>Xin chào <strong>${hoTen}</strong>,</p>
          <p>Tài khoản của bạn đã được tạo.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mật khẩu tạm:</strong> ${matKhauTam}</p>
          <p>Vui lòng đăng nhập và đổi mật khẩu ngay.</p>
        `,
      });
    } catch {
      emailSent = false;
    }

    user.matKhau = undefined;
    logAction(req, 'create', 'user', `${hoTen} (${email})`);
    // Luôn trả về matKhauTam để admin copy thủ công nếu email thất bại
    res.status(201).json({ success: true, data: user, matKhauTam, emailSent });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password  (Admin reset MK của user bất kỳ)
exports.adminResetPassword = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('+matKhau');
    if (!user)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    const matKhauMoi = crypto.randomBytes(4).toString('hex');
    const hashed = await bcrypt.hash(matKhauMoi, 12);
    await User.updateOne({ _id: user._id }, { matKhau: hashed, phaiBatDauDoiMatKhau: true });

    let emailSent = true;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu - Xứ Đoàn Mẫu Tâm',
        html: `
          <p>Xin chào <strong>${user.hoTen}</strong>,</p>
          <p>Mật khẩu của bạn đã được Admin đặt lại.</p>
          <p><strong>Mật khẩu mới:</strong> ${matKhauMoi}</p>
          <p>Vui lòng đăng nhập và đổi mật khẩu ngay.</p>
        `,
      });
    } catch {
      emailSent = false;
    }

    logAction(req, 'grant', 'user', `Reset mật khẩu: ${user.hoTen}`);
    res.json({ success: true, matKhauMoi, emailSent });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    if (!matKhauCu || !matKhauMoi)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });

    if (matKhauMoi.length < 6)
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

    const user = await User.findById(req.user._id).select('+matKhau');
    if (!(await user.kiemTraMatKhau(matKhauCu)))
      return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng' });

    user.matKhau = matKhauMoi;
    user.phaiBatDauDoiMatKhau = false;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile  (cập nhật thông tin cá nhân + avatar)
exports.updateProfile = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, avatar } = req.body;

    // avatar là base64 string hoặc URL — giới hạn 2MB base64 (~1.5MB ảnh)
    if (avatar && avatar.startsWith('data:') && avatar.length > 2 * 1024 * 1024)
      return res.status(400).json({ success: false, message: 'Ảnh quá lớn, vui lòng chọn ảnh dưới 1.5MB' });

    const updateData = {};
    if (hoTen?.trim())     updateData.hoTen = hoTen.trim();
    if (soDienThoai !== undefined) updateData.soDienThoai = soDienThoai;
    if (avatar !== undefined)      updateData.avatar = avatar;

    const user = await require('../models/User')
      .findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true })
      .select('-matKhau');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+matKhau');
    if (!user)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    const matKhauMoi = crypto.randomBytes(4).toString('hex');
    user.matKhau = matKhauMoi;
    user.phaiBatDauDoiMatKhau = true;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Đặt lại mật khẩu - Xứ Đoàn Mẫu Tâm',
      html: `
        <p>Mật khẩu mới của bạn: <strong>${matKhauMoi}</strong></p>
        <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
      `,
    });

    res.json({ success: true, message: 'Mật khẩu mới đã được gửi qua email' });
  } catch (err) {
    next(err);
  }
};
