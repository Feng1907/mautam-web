const AbsenceRequest = require('../models/AbsenceRequest');
const { sendPushToUsers } = require('../utils/pushNotifier');

const getByClass = async (req, res) => {
  try {
    const { lopId, status, dateFrom, dateTo } = req.query;
    if (!lopId) return res.status(400).json({ success: false, message: 'Thiếu lopId' });

    if (req.user.vaiTro !== 'admin') {
      const owns = req.user.lopPhuTrach?.some(l => (l._id || l).toString() === lopId);
      if (!owns) return res.status(403).json({ success: false, message: 'Không có quyền xem lớp này' });
    }

    const filter = { lop: lopId };
    if (status && status !== 'all') filter.status = status;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo)   filter.date.$lte = dateTo;
    }

    const requests = await AbsenceRequest.find(filter)
      .populate('student', 'hoTen tenThanh')
      .populate('parent', 'hoTen')
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ghiChu } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const request = await AbsenceRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });

    const isAdmin = req.user.vaiTro === 'admin';
    const isNotified = request.notifiedTo?.toString() === req.user._id.toString();
    const owns = req.user.lopPhuTrach?.some(l => (l._id || l).toString() === request.lop.toString());

    if (!isAdmin && !isNotified && !owns) {
      return res.status(403).json({ success: false, message: 'Không có quyền duyệt đơn này' });
    }

    request.status = status;
    if (ghiChu !== undefined) request.ghiChu = ghiChu;
    await request.save();

    const statusLabel = status === 'approved' ? 'đã được duyệt' : 'đã bị từ chối';
    sendPushToUsers([request.parent], {
      title: `Đơn xin phép ${statusLabel}`,
      body: `Đơn xin phép ngày ${request.date} của đoàn sinh ${statusLabel}.`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      url: '/phu-huynh',
      type: 'absence-request-update',
    }).catch(() => {});

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getByClass, updateStatus };
