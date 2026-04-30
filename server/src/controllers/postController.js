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

    // Gửi email thông báo khẩn tới toàn bộ user
    if (post.loai === 'thongbaokhan' && post.daDang) {
      const users = await User.find({ vaiTro: { $in: ['admin', 'giaoly'] } }).select('email hoTen');
      const emailList = users.map((u) => u.email).join(',');
      if (emailList) {
        await sendEmail({
          to: emailList,
          subject: `[KHẨN] ${post.tieuDe}`,
          html: `<h3>${post.tieuDe}</h3><p>${post.tomTat || ''}</p><p>${post.noiDung}</p>`,
        }).catch(() => {}); // Không để lỗi email làm hỏng response
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
