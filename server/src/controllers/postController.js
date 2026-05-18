const Post = require('../models/Post');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const { notifyUrgentPostPublished } = require('../utils/pushNotifier');
const sanitizeHtml = require('sanitize-html');
const logger = require('../utils/logger');

const notFoundMessage = 'Khong tim thay bai viet';

// Cho phép các tag HTML an toàn từ TipTap editor
const ALLOWED_TAGS = [
  'h1','h2','h3','h4','h5','h6','p','br','hr',
  'strong','b','em','i','u','s','del','mark','code','pre','blockquote',
  'ul','ol','li','a','img','table','thead','tbody','tr','th','td',
  'div','span','figure','figcaption',
];

const ALLOWED_ATTRS = {
  a:   ['href','target','rel'],
  img: ['src','alt','width','height','style'],
  '*': ['class','style'],
};

const sanitizePost = (body) => {
  if (body.noiDung) {
    body.noiDung = sanitizeHtml(body.noiDung, {
      allowedTags:       ALLOWED_TAGS,
      allowedAttributes: ALLOWED_ATTRS,
      allowedSchemes:    ['http','https','data'],
    });
  }
  return body;
};

const sendUrgentPostEmail = async (post) => {
  const users = await User.find({}).select('email hoTen vaiTro');
  const emailList = users.map((u) => u.email).filter(Boolean).join(',');
  if (!emailList) return;

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <div style="background:#8B0000;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">THONG BAO KHAN - Xu Doan Anre Phu Yen - Mau Tam</h2>
      </div>
      <div style="border:1px solid #e5d5b5;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
        <h3 style="color:#8B0000;margin-top:0">${post.tieuDe}</h3>
        ${post.tomTat ? `<p style="color:#555;font-style:italic">${post.tomTat}</p>` : ''}
        <hr style="border:none;border-top:1px solid #e5d5b5;margin:12px 0"/>
        <div style="color:#333;line-height:1.7">${post.noiDung}</div>
        ${post.hanHienThi ? `<p style="color:#999;font-size:12px;margin-top:16px">Thong bao co hieu luc den: ${new Date(post.hanHienThi).toLocaleDateString('vi-VN')}</p>` : ''}
        <p style="color:#bbb;font-size:11px;margin-top:20px;border-top:1px solid #f0e0c0;padding-top:10px">
          Email tu dong tu he thong quan ly Xu Doan Anre Phu Yen - Mau Tam
        </p>
      </div>
    </div>`;

  await sendEmail({
    to: emailList,
    subject: `[KHAN] ${post.tieuDe}`,
    html: htmlBody,
  }).catch((err) => logger.warn('sendUrgentPostEmail failed', { postId: post._id, error: err.message }));
};

const notifyUrgentPostIfPublished = async (post, wasPublished = false) => {
  if (post.loai !== 'thongbaokhan' || !post.daDang || wasPublished) return null;

  const [pushResult] = await Promise.all([
    notifyUrgentPostPublished(post).catch((err) => ({ error: err.message })),
    sendUrgentPostEmail(post),
  ]);

  return pushResult;
};

// GET /api/posts?loai=tintuc&page=1&limit=10
exports.getAll = async (req, res, next) => {
  try {
    const { loai, page = 1, limit = 10 } = req.query;
    const filter = { daDang: true };
    if (loai) filter.loai = loai;

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
      return res.status(404).json({ success: false, message: notFoundMessage });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts  (Admin only)
exports.create = async (req, res, next) => {
  try {
    const post = await Post.create({ ...sanitizePost({ ...req.body }), tacGia: req.user._id });
    const pushResult = await notifyUrgentPostIfPublished(post);

    res.status(201).json({ success: true, data: post, push: pushResult });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id  (Admin only)
exports.update = async (req, res, next) => {
  try {
    const previous = await Post.findById(req.params.id).select('daDang loai');
    if (!previous)
      return res.status(404).json({ success: false, message: notFoundMessage });

    const post = await Post.findByIdAndUpdate(req.params.id, sanitizePost({ ...req.body }), {
      new: true,
      runValidators: true,
    });

    const pushResult = await notifyUrgentPostIfPublished(post, previous.daDang);

    res.json({ success: true, data: post, push: pushResult });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id  (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: notFoundMessage });
    res.json({ success: true, message: 'Da xoa bai viet' });
  } catch (err) {
    next(err);
  }
};
