const LoiChua = require('../models/LoiChua');
const Post    = require('../models/Post');
const Class   = require('../models/Class');
const Student = require('../models/Student');

const toNumberInRange = (value, fallback, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

// GET /api/search?q=...&limit=10&page=1
exports.searchLoiChua = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Tu khoa tim kiem la bat buoc',
      });
    }

    const limit = toNumberInRange(req.query.limit, 10, 1, 50);
    const page = toNumberInRange(req.query.page, 1, 1, 1000);
    const skip = (page - 1) * limit;
    const filter = { $text: { $search: q } };
    const projection = {
      score: { $meta: 'textScore' },
      date: 1,
      title: 1,
      keyVerse: 1,
      tinMungTen: 1,
      season: 1,
      color: 1,
      source: 1,
      sections: { $slice: 3 },
    };

    const [results, total] = await Promise.all([
      LoiChua.find(filter, projection)
        .sort({ score: { $meta: 'textScore' }, date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LoiChua.countDocuments(filter),
    ]);

    res.json({
      success: true,
      query: q,
      total,
      page,
      limit,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/search/global?q=...
// Tìm kiếm tổng hợp: Posts + Classes + Students (tên)
exports.globalSearch = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ success: true, data: { posts: [], classes: [], students: [] } });

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const [posts, classes, students] = await Promise.all([
      Post.find({
        daDang: true,
        $or: [{ tieuDe: regex }, { tomTat: regex }],
      }).select('tieuDe tomTat loai anhDaiDien').limit(4).lean(),

      Class.find({ tenLop: regex })
        .select('tenLop nhanh').limit(4).lean(),

      Student.find({
        $or: [{ hoTen: regex }, { tenThanh: regex }],
        trangThai: 'active',
      }).select('hoTen tenThanh').limit(4).lean(),
    ]);

    res.json({ success: true, query: q, data: { posts, classes, students } });
  } catch (err) {
    next(err);
  }
};
