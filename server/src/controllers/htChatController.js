const HtRoom    = require('../models/HtRoom');
const HtMessage = require('../models/HtMessage');
const User      = require('../models/User');
const { getIO } = require('../config/socket');

// GET /api/ht-chat/users — danh sách giaoly/admin để tạo DM/nhóm
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      vaiTro: { $in: ['admin', 'giaoly'] },
      _id: { $ne: req.user._id },
    }).select('hoTen email avatar vaiTro chucVu').lean();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// GET /api/ht-chat/rooms — danh sách phòng của tôi, kèm số tin chưa đọc
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await HtRoom.find({ members: req.user._id })
      .populate('members', 'hoTen avatar vaiTro')
      .sort({ lastMsgAt: -1, updatedAt: -1 })
      .lean();

    const unreadCounts = await Promise.all(rooms.map(r =>
      HtMessage.countDocuments({ room: r._id, readBy: { $ne: req.user._id } })
    ));

    const result = rooms.map((r, i) => ({ ...r, unread: unreadCounts[i] }));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/ht-chat/rooms — tạo DM hoặc nhóm
exports.createRoom = async (req, res, next) => {
  try {
    const { name, memberIds, isGroup } = req.body;
    if (!memberIds?.length)
      return res.status(400).json({ success: false, message: 'Cần ít nhất 1 thành viên' });

    const allMembers = [...new Set([req.user._id.toString(), ...memberIds])];

    // DM: kiểm tra đã tồn tại chưa
    if (!isGroup && allMembers.length === 2) {
      const existing = await HtRoom.findOne({
        isGroup: false,
        members: { $all: allMembers, $size: 2 },
      }).populate('members', 'hoTen avatar vaiTro');
      if (existing) return res.json({ success: true, data: existing });
    }

    const room = await HtRoom.create({
      name: isGroup ? (name?.trim() || 'Nhóm mới') : null,
      members: allMembers,
      createdBy: req.user._id,
      isGroup: !!isGroup,
    });
    const populated = await room.populate('members', 'hoTen avatar vaiTro');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// GET /api/ht-chat/rooms/:id/messages
exports.getMessages = async (req, res, next) => {
  try {
    const room = await HtRoom.findOne({ _id: req.params.id, members: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chat' });

    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 40;
    const msgs  = await HtMessage.find({ room: room._id })
      .populate('sender', 'hoTen avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data: msgs.reverse() });
  } catch (err) { next(err); }
};

// POST /api/ht-chat/rooms/:id/messages — gửi tin
exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ success: false, message: 'Tin nhắn không được trống' });

    const room = await HtRoom.findOne({ _id: req.params.id, members: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chat' });

    const msg = await HtMessage.create({
      room: room._id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });
    const populated = await msg.populate('sender', 'hoTen avatar');

    // Cập nhật lastMsg trên room
    await HtRoom.updateOne({ _id: room._id }, { lastMsg: text.trim(), lastMsgAt: new Date() });

    // Broadcast realtime
    try {
      getIO().to(`htchat:${room._id}`).emit('htchat:message', populated);
    } catch { /* ignore */ }

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// PUT /api/ht-chat/rooms/:id/read — đánh dấu đã đọc
exports.markRead = async (req, res, next) => {
  try {
    await HtMessage.updateMany(
      { room: req.params.id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};
