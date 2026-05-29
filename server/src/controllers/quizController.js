const Quiz        = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Student     = require('../models/Student');
const NamHoc      = require('../models/NamHoc');
const { getIO }   = require('../config/socket');

// Normalize text để chấm dien_khuyet
function normalizeText(str) {
  return (str || '').trim().toLowerCase();
}

// Tính tổng điểm có thể đạt của quiz
function tinhTongDiem(cauHoi) {
  return cauHoi.reduce((sum, c) => sum + (c.diem || 1), 0);
}

// GET /api/quizzes — danh sách quiz của lớp mình (hoặc tất cả nếu admin)
exports.list = async (req, res, next) => {
  try {
    const { lopId } = req.query;
    const isGiaoly = ['admin', 'giaoly'].includes(req.user.vaiTro);

    let filter = {};
    if (lopId) {
      filter.lop = lopId;
    } else if (!isGiaoly) {
      // Thiếu nhi/phụ huynh: chỉ thấy quiz của lớp mình
      const student = await Student.findOne({ _id: req.query.studentId }).lean();
      if (student) filter.lop = student.lop;
      else filter.lop = null; // không có lớp → không có quiz
    }
    if (!isGiaoly) filter.active = true;

    const quizzes = await Quiz.find(filter)
      .populate('lop', 'tenLop nhanh')
      .populate('taoBy', 'hoTen')
      .sort({ createdAt: -1 })
      .lean();

    // Với mỗi quiz, không trả về đáp án đúng
    const safe = quizzes.map(q => ({
      ...q,
      cauHoi: isGiaoly ? q.cauHoi : q.cauHoi.map(c => ({
        _id: c._id, loai: c.loai, noiDung: c.noiDung, diem: c.diem,
        dapAn: c.dapAn?.map(d => ({ chu: d.chu, noiDung: d.noiDung })),
      })),
    }));

    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
};

// POST /api/quizzes — tạo quiz (giaoly/admin)
exports.create = async (req, res, next) => {
  try {
    const { tieuDe, moTa, lop, thoiGianLam, batDauTu, ketThucLuc, cauHoi } = req.body;
    if (!tieuDe?.trim() || !lop)
      return res.status(400).json({ success: false, message: 'Tiêu đề và lớp là bắt buộc' });

    // Giaoly chỉ được tạo quiz cho lớp mình phụ trách
    if (req.user.vaiTro === 'giaoly') {
      const User = require('../models/User');
      const u = await User.findById(req.user._id).select('lopPhuTrach').lean();
      const lopIds = (u?.lopPhuTrach || []).map(id => id.toString());
      if (!lopIds.includes(lop.toString()))
        return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });
    }

    const namHoc = await NamHoc.findOne({ dangHoatDong: true }).lean();
    const quiz = await Quiz.create({
      tieuDe: tieuDe.trim(), moTa, lop, namHoc: namHoc?._id,
      thoiGianLam, batDauTu, ketThucLuc,
      cauHoi: cauHoi || [],
      taoBy: req.user._id,
    });
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:id
exports.getOne = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('lop', 'tenLop nhanh')
      .populate('taoBy', 'hoTen')
      .lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });

    const isGiaoly = ['admin', 'giaoly'].includes(req.user.vaiTro);
    if (!isGiaoly) {
      // Ẩn đáp án đúng
      quiz.cauHoi = quiz.cauHoi.map(c => ({
        _id: c._id, loai: c.loai, noiDung: c.noiDung, diem: c.diem,
        dapAn: c.dapAn?.map(d => ({ chu: d.chu, noiDung: d.noiDung })),
      }));
    }
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

// Kiểm tra giaoly có quyền với quiz này không
async function checkGiaolyOwnsQuiz(userId, vaiTro, quizId) {
  if (vaiTro === 'admin') return null; // admin luôn được phép
  const User = require('../models/User');
  const [quiz, u] = await Promise.all([
    Quiz.findById(quizId).select('lop').lean(),
    User.findById(userId).select('lopPhuTrach').lean(),
  ]);
  if (!quiz) return 'Không tìm thấy quiz';
  const lopIds = (u?.lopPhuTrach || []).map(id => id.toString());
  if (!lopIds.includes(quiz.lop.toString())) return 'Bạn không phụ trách lớp này';
  return null;
}

// PUT /api/quizzes/:id
exports.update = async (req, res, next) => {
  try {
    const err = await checkGiaolyOwnsQuiz(req.user._id, req.user.vaiTro, req.params.id);
    if (err) return res.status(403).json({ success: false, message: err });

    const { tieuDe, moTa, thoiGianLam, batDauTu, ketThucLuc, active, cauHoi } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { tieuDe: tieuDe?.trim(), moTa, thoiGianLam, batDauTu, ketThucLuc, active, cauHoi },
      { new: true, runValidators: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

// DELETE /api/quizzes/:id
exports.remove = async (req, res, next) => {
  try {
    const errMsg = await checkGiaolyOwnsQuiz(req.user._id, req.user.vaiTro, req.params.id);
    if (errMsg) return res.status(403).json({ success: false, message: errMsg });

    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    await QuizAttempt.deleteMany({ quiz: req.params.id });
    res.json({ success: true, message: 'Đã xóa quiz' });
  } catch (err) { next(err); }
};

// POST /api/quizzes/:id/start — học sinh bắt đầu làm bài
exports.startQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    if (!quiz.active) return res.status(400).json({ success: false, message: 'Quiz chưa được mở' });

    const now = new Date();
    if (quiz.batDauTu && now < new Date(quiz.batDauTu))
      return res.status(400).json({ success: false, message: 'Quiz chưa đến giờ mở' });
    if (quiz.ketThucLuc && now > new Date(quiz.ketThucLuc))
      return res.status(400).json({ success: false, message: 'Quiz đã hết hạn' });

    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'Thiếu studentId' });

    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });

    // Trả về attempt cũ nếu đã tồn tại và chưa nộp
    let attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: studentId });
    if (attempt && attempt.daHoanThanh)
      return res.status(400).json({ success: false, message: 'Bạn đã nộp bài rồi', attemptId: attempt._id });

    if (!attempt) {
      attempt = await QuizAttempt.create({
        quiz: quiz._id,
        student: studentId,
        lop: student.lop,
        tongDiem: tinhTongDiem(quiz.cauHoi),
      });
    }

    // Trả về câu hỏi nhưng ẩn đáp án đúng
    const cauHoiSafe = quiz.cauHoi.map((c, idx) => ({
      _id: c._id, index: idx, loai: c.loai, noiDung: c.noiDung, diem: c.diem,
      dapAn: c.dapAn?.map(d => ({ chu: d.chu, noiDung: d.noiDung })),
    }));

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        thoiGianLam: quiz.thoiGianLam,
        batDau: attempt.batDau,
        cauHoi: cauHoiSafe,
        cauTraLoiHienTai: attempt.cauTraLoi,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/quizzes/:id/submit — nộp bài
exports.submitQuiz = async (req, res, next) => {
  try {
    const { attemptId, cauTraLoi } = req.body;
    if (!attemptId) return res.status(400).json({ success: false, message: 'Thiếu attemptId' });

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });
    if (attempt.daHoanThanh) return res.status(400).json({ success: false, message: 'Bài đã được nộp' });

    const quiz = await Quiz.findById(attempt.quiz).lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });

    let diemTuDong = 0;
    let coTuLuan = false;

    const ketQua = (cauTraLoi || []).map(tr => {
      const cauHoi = quiz.cauHoi[tr.cauHoiIndex];
      if (!cauHoi) return tr;

      const result = { ...tr, loai: cauHoi.loai };

      if (cauHoi.loai === 'trac_nghiem') {
        const dapAnDung = cauHoi.dapAn?.find(d => d.dungKhong);
        result.dungKhong = dapAnDung ? tr.dapAnChon === dapAnDung.chu : false;
        result.diemDat = result.dungKhong ? (cauHoi.diem || 1) : 0;
        diemTuDong += result.diemDat;
      } else if (cauHoi.loai === 'dien_khuyet') {
        const normalized = normalizeText(tr.noiDungDien);
        const dapAnList = (cauHoi.dapAnDung || []).map(d =>
          cauHoi.caseSensitive ? d.trim() : normalizeText(d)
        );
        result.dungKhong = dapAnList.includes(
          cauHoi.caseSensitive ? (tr.noiDungDien || '').trim() : normalized
        );
        result.diemDat = result.dungKhong ? (cauHoi.diem || 1) : 0;
        diemTuDong += result.diemDat;
      } else if (cauHoi.loai === 'tu_luan') {
        result.dungKhong = null; // chờ chấm tay
        result.diemDat = null;
        coTuLuan = true;
      }
      return result;
    });

    attempt.cauTraLoi = ketQua;
    attempt.diem = diemTuDong;
    attempt.tongDiem = tinhTongDiem(quiz.cauHoi);
    attempt.nopLuc = new Date();
    attempt.daHoanThanh = true;
    if (!coTuLuan) attempt.daChayDuTuLuan = true;
    await attempt.save();

    // Notify real-time
    try {
      getIO().to(`lop:${attempt.lop}`).emit('quiz:submitted', {
        quizId: quiz._id,
        studentId: attempt.student,
        attemptId: attempt._id,
        diem: diemTuDong,
        tongDiem: attempt.tongDiem,
        coTuLuan,
      });
      getIO().to(`quiz:${quiz._id}`).emit('quiz:submitted', {
        studentId: attempt.student,
        attemptId: attempt._id,
        diem: diemTuDong,
        tongDiem: attempt.tongDiem,
        coTuLuan,
      });
    } catch (_) { /* socket optional */ }

    res.json({
      success: true,
      data: {
        diem: diemTuDong,
        tongDiem: attempt.tongDiem,
        coTuLuan,
        ketQua: ketQua.map(tr => ({
          cauHoiIndex: tr.cauHoiIndex,
          loai: tr.loai,
          dungKhong: tr.dungKhong,
          diemDat: tr.diemDat,
          dapAnChon: tr.dapAnChon,
          noiDungDien: tr.noiDungDien,
        })),
      },
    });
  } catch (err) { next(err); }
};

// POST /api/quizzes/:id/violation — báo vi phạm (beacon, không cần auth)
exports.reportViolation = async (req, res, next) => {
  try {
    const { attemptId, loai, soGiay } = req.body;
    if (!attemptId || !loai) return res.status(400).end();

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt || attempt.daHoanThanh) return res.status(200).end();

    attempt.viPham.push({ loai, soGiay: soGiay || 0 });
    attempt.soViPham = attempt.viPham.length;
    if (attempt.soViPham >= 3) attempt.biFlagged = true;
    await attempt.save();

    // Notify huynh trưởng real-time
    try {
      const quiz = await require('../models/Quiz').findById(attempt.quiz).select('lop').lean();
      if (quiz) {
        getIO().to(`lop:${quiz.lop}`).emit('quiz:violation', {
          quizId: attempt.quiz,
          studentId: attempt.student,
          attemptId: attempt._id,
          loai, soGiay: soGiay || 0,
          soViPham: attempt.soViPham,
          biFlagged: attempt.biFlagged,
        });
        getIO().to(`quiz:${attempt.quiz}`).emit('quiz:violation', {
          studentId: attempt.student,
          attemptId: attempt._id,
          loai, soGiay: soGiay || 0,
          soViPham: attempt.soViPham,
          biFlagged: attempt.biFlagged,
        });
      }
    } catch (_) { /* socket optional */ }

    res.status(200).end();
  } catch (err) { res.status(200).end(); }
};

// GET /api/quizzes/:id/results — huynh trưởng xem kết quả
exports.getResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });

    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('student', 'hoTen tenThanh lop')
      .sort({ nopLuc: 1 })
      .lean();

    const summary = {
      tong: attempts.length,
      daNop: attempts.filter(a => a.daHoanThanh).length,
      dangLam: attempts.filter(a => !a.daHoanThanh).length,
      coBiFlagged: attempts.filter(a => a.biFlagged).length,
      diemTB: attempts.filter(a => a.diem != null).length
        ? (attempts.reduce((s, a) => s + (a.diem || 0), 0) / attempts.filter(a => a.diem != null).length).toFixed(1)
        : null,
    };

    res.json({ success: true, data: attempts, summary, quiz });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:id/monitor — real-time monitor data
exports.getMonitor = async (req, res, next) => {
  try {
    const students = await Student.find({ lop: req.query.lopId, trangThai: 'active' })
      .select('hoTen tenThanh lop').lean();

    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .select('student daHoanThanh diem tongDiem soViPham biFlagged viPham batDau nopLuc')
      .lean();

    const attemptMap = {};
    attempts.forEach(a => { attemptMap[a.student.toString()] = a; });

    const data = students.map(s => ({
      student: s,
      attempt: attemptMap[s._id.toString()] || null,
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// POST /api/quizzes/:id/attempts/:attemptId/grade — chấm tự luận
exports.gradeEssay = async (req, res, next) => {
  try {
    const { cauHoiIndex, diemDat, nhanXet } = req.body;
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });

    const tr = attempt.cauTraLoi.find(t => t.cauHoiIndex === cauHoiIndex && t.loai === 'tu_luan');
    if (!tr) return res.status(400).json({ success: false, message: 'Không tìm thấy câu trả lời' });

    tr.diemDat = diemDat;
    tr.nhanXetCham = nhanXet || '';
    tr.chamBoi = req.user._id;
    tr.dungKhong = diemDat > 0;

    // Kiểm tra tất cả tu_luan đã chấm chưa
    const tuLuanChua = attempt.cauTraLoi.filter(t => t.loai === 'tu_luan' && t.diemDat == null);
    if (tuLuanChua.length === 0) {
      attempt.daChayDuTuLuan = true;
      attempt.diemTuLuan = attempt.cauTraLoi
        .filter(t => t.loai === 'tu_luan')
        .reduce((s, t) => s + (t.diemDat || 0), 0);
    }

    attempt.markModified('cauTraLoi');
    await attempt.save();
    res.json({ success: true, data: attempt });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:id/leaderboard — bảng xếp hạng quiz (mọi user đã đăng nhập)
exports.getLeaderboard = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('tieuDe thoiGianLam lop').lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });

    const attempts = await QuizAttempt.find({ quiz: req.params.id, daHoanThanh: true, diem: { $ne: null } })
      .populate('student', 'hoTen tenThanh')
      .sort({ diem: -1, nopLuc: 1 })
      .lean();

    const ranked = attempts.map((a, i) => ({
      rank: i + 1,
      studentId: a.student?._id,
      hoTen: a.student?.hoTen,
      tenThanh: a.student?.tenThanh,
      diem: a.diem,
      tongDiem: a.tongDiem,
      soViPham: a.soViPham,
      biFlagged: a.biFlagged,
      nopLuc: a.nopLuc,
    }));

    res.json({ success: true, data: ranked, quiz });
  } catch (err) { next(err); }
};

// GET /api/quizzes/student/:studentId — xem lịch sử quiz của một học sinh
exports.getStudentQuizzes = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.params.studentId, daHoanThanh: true })
      .populate({ path: 'quiz', select: 'tieuDe thoiGianLam cauHoi' })
      .sort({ nopLuc: -1 })
      .lean();
    const result = attempts.map(a => ({
      _id: a._id,
      quiz: { _id: a.quiz?._id, tieuDe: a.quiz?.tieuDe, tongCauHoi: a.quiz?.cauHoi?.length },
      diem: a.diem,
      tongDiem: a.tongDiem,
      soViPham: a.soViPham,
      biFlagged: a.biFlagged,
      nopLuc: a.nopLuc,
      batDau: a.batDau,
    }));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:id/attempts — huynh trưởng lấy tất cả attempts để chấm tự luận
exports.getAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, daHoanThanh: true })
      .populate('student', 'hoTen')
      .lean();
    res.json({ success: true, data: attempts });
  } catch (err) { next(err); }
};
