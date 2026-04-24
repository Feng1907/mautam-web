const Post = require('../models/Post');

exports.getAll = async (req, res, next) => {
  try {
    const posts = await Post.find({ daDang: true }).sort('-createdAt').populate('tacGia', 'hoTen');
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('tacGia', 'hoTen');
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const post = await Post.create({ ...req.body, tacGia: req.user._id });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá bài viết' });
  } catch (err) {
    next(err);
  }
};
