const Post = require('../models/Post');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// GET /api/posts?loai=tintuc&page=1&limit=10
exports.getAll = async (req, res, next) => {
  try {
    const { loai, page = 1, limit = 10 } = req.query;
    const filter = { daDang: true };
    if (loai) filter.loai = loai;

    // Ẩn thông báo khẩn đã hết hạn
    filter.$or = [{ hanHienThi: null }, { hanHienThi: { $gte: new Date() } }];

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('tacGia', 'hoTen'),
      Post.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), data: posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('tacGia', 'hoTen');
    if (!post || !post.daDang)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts  (Admin only)
exports.create = async (req, res, next) => {
  try {
    const post = await Post.create({ ...req.body, tacGia: req.user._id });

    // Gửi email thông báo khẩn tới tất cả người dùng (kể cả phụ huynh)
    if (post.loai === 'thongbaokhan' && post.daDang) {
      const users = await User.find({}).select('email hoTen vaiTro');
      const emailList = users.map(u => u.email).filter(Boolean).join(',');
      if (emailList) {
        const htmlBody = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <div style="background:#8B0000;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;font-size:18px">⚠️ THÔNG BÁO KHẨN — Xứ Đoàn Anrê Phú Yên · Mẫu Tâm</h2>
            </div>
            <div style="border:1px solid #e5d5b5;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
              <h3 style="color:#8B0000;margin-top:0">${post.tieuDe}</h3>
              ${post.tomTat ? `<p style="color:#555;font-style:italic">${post.tomTat}</p>` : ''}
              <hr style="border:none;border-top:1px solid #e5d5b5;margin:12px 0"/>
              <div style="color:#333;line-height:1.7">${post.noiDung}</div>
              ${post.hanHienThi ? `<p style="color:#999;font-size:12px;margin-top:16px">⏳ Thông báo có hiệu lực đến: ${new Date(post.hanHienThi).toLocaleDateString('vi-VN')}</p>` : ''}
              <p style="color:#bbb;font-size:11px;margin-top:20px;border-top:1px solid #f0e0c0;padding-top:10px">
                Email tự động từ hệ thống quản lý Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
              </p>
            </div>
          </div>`;
        await sendEmail({
          to: emailList,
          subject: `[KHẨN] ${post.tieuDe}`,
          html: htmlBody,
        }).catch(() => {});
      }
    }

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id  (Admin only)
exports.update = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id  (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, message: 'Đã xoá bài viết' });
  } catch (err) {
    next(err);
  }
};
