const HtRoom    = require('../models/HtRoom');
const HtMessage = require('../models/HtMessage');
const User      = require('../models/User');
const Class     = require('../models/Class');
const NamHoc    = require('../models/NamHoc');
const { getIO } = require('../config/socket');

// Seed group rooms cho các lớp mà user phụ trách (năm học đang hoạt động)
async function seedClassRooms(userId) {
  const namHoc = await NamHoc.findOne({ dangHoatDong: true }).lean();
  if (!namHoc) return;

  const classes = await Class.find({
    namHoc: namHoc._id,
    $or: [{ huynhTruong: userId }, { duTruong: userId }],
  }).lean();

  // Chỉ lấy user giaoly làm member — loại admin ra khỏi room lớp
  const giaolyIds = (await User.find({ vaiTro: 'giaoly' }).select('_id').lean())
    .map(u => u._id.toString());

  for (const lop of classes) {
    const memberIds = [lop.huynhTruong, ...(lop.duTruong || [])]
      .filter(Boolean)
      .map(id => id.toString())
      .filter(id => giaolyIds.includes(id));  // chỉ giaoly
    if (!memberIds.length) continue;
    const uniqueMembers = [...new Set(memberIds)];

    const existing = await HtRoom.findOne({ classRef: lop._id });
    if (existing) {
      // Sync members nếu thay đổi
      const currentSet = existing.members.map(m => m.toString()).sort().join(',');
      const newSet = uniqueMembers.sort().join(',');
      if (currentSet !== newSet) {
        existing.members = uniqueMembers;
        await existing.save();
      }
    } else {
      await HtRoom.create({
        name: lop.tenLop,
        members: uniqueMembers,
        createdBy: userId,
        isGroup: true,
        classRef: lop._id,
      });
    }
  }
}

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

// GET /api/ht-chat/rooms — seed class rooms rồi trả danh sách, kèm số tin chưa đọc
exports.getRooms = async (req, res, next) => {
  try {
    if (req.user.vaiTro === 'giaoly') {
      await seedClassRooms(req.user._id);
    } else if (req.user.vaiTro === 'admin') {
      // Loại admin ra khỏi tất cả class rooms (classRef != null)
      await HtRoom.updateMany(
        { classRef: { $ne: null }, members: req.user._id },
        { $pull: { members: req.user._id } }
      );
    }

    const rooms = await HtRoom.find({ members: req.user._id })
      .populate('members', 'hoTen avatar vaiTro')
      .populate('classRef', 'tenLop nhanh')
      .populate({ path: 'pinnedMessage', select: 'text sender attachments',
        populate: { path: 'sender', select: 'hoTen' } })
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
      .populate({ path: 'replyTo', select: 'text sender attachments deleted',
        populate: { path: 'sender', select: 'hoTen' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data: msgs.reverse() });
  } catch (err) { next(err); }
};

// POST /api/ht-chat/rooms/:id/messages — gửi tin (text và/hoặc attachments)
exports.sendMessage = async (req, res, next) => {
  try {
    const { text, attachments, replyTo } = req.body;
    console.log('[sendMessage] body:', { text, replyTo, attachmentsLen: attachments?.length }, 'user:', req.user?._id, 'room:', req.params.id);
    if (!text?.trim() && !attachments?.length)
      return res.status(400).json({ success: false, message: 'Tin nhắn không được trống' });

    const room = await HtRoom.findOne({ _id: req.params.id, members: req.user._id });
    console.log('[sendMessage] room found:', !!room);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chat' });

    const msg = await HtMessage.create({
      room: room._id,
      sender: req.user._id,
      text: text?.trim() || '',
      attachments: attachments || [],
      readBy: [req.user._id],
      replyTo: replyTo || null,
    });
    console.log('[sendMessage] msg created:', msg._id);
    await msg.populate('sender', 'hoTen avatar');
    await msg.populate({ path: 'replyTo', select: 'text sender attachments deleted',
      populate: { path: 'sender', select: 'hoTen' } });
    console.log('[sendMessage] populated ok');
    const populated = msg;

    const preview = text?.trim() || (attachments?.length ? `[${attachments[0].fileType === 'image' ? 'Ảnh' : 'Tệp'}]` : '');
    await HtRoom.updateOne({ _id: room._id }, { lastMsg: preview, lastMsgAt: new Date() });
    console.log('[sendMessage] room updated');

    try { getIO().to(`htchat:${room._id}`).emit('htchat:message', populated); } catch { /* ignore */ }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('[sendMessage] CATCH:', err.name, err.message, err.stack?.split('\n').slice(0, 3).join(' | '));
    next(err);
  }
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

// DELETE /api/ht-chat/rooms/:roomId/messages/:msgId — xóa tin nhắn
exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await HtMessage.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });

    const isOwner = msg.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.vaiTro === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Không có quyền xóa tin nhắn này' });

    msg.deleted = true;
    msg.text = '';
    msg.attachments = [];
    await msg.save();

    try {
      getIO().to(`htchat:${msg.room}`).emit('htchat:message:deleted', { _id: msg._id, room: msg.room });
    } catch { /* ignore */ }

    res.json({ success: true });
  } catch (err) { next(err); }
};

// PATCH /api/ht-chat/rooms/:id/pin — ghim hoặc bỏ ghim tin nhắn
exports.pinMessage = async (req, res, next) => {
  try {
    const { msgId } = req.body;
    const room = await HtRoom.findOneAndUpdate(
      { _id: req.params.id, members: req.user._id },
      { pinnedMessage: msgId || null },
      { new: true }
    ).populate({ path: 'pinnedMessage', select: 'text sender attachments',
      populate: { path: 'sender', select: 'hoTen' } });
    if (!room) return res.status(404).json({ success: false });
    try {
      getIO().to(`htchat:${room._id}`).emit('htchat:pin', { roomId: room._id, pinnedMessage: room.pinnedMessage });
    } catch { /* ignore */ }
    res.json({ success: true, data: room.pinnedMessage });
  } catch (err) { next(err); }
};

// POST /api/ht-chat/rooms/:roomId/messages/:msgId/react — toggle emoji reaction
exports.reactMessage = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ success: false, message: 'Thiếu emoji' });

    const msg = await HtMessage.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });

    const userId = req.user._id;
    const entry = msg.reactions.find(r => r.emoji === emoji);

    if (entry) {
      const alreadyReacted = entry.users.some(u => u.toString() === userId.toString());
      if (alreadyReacted) {
        entry.users = entry.users.filter(u => u.toString() !== userId.toString());
        if (entry.users.length === 0) msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
      } else {
        entry.users.push(userId);
      }
    } else {
      msg.reactions.push({ emoji, users: [userId] });
    }

    await msg.save();

    try {
      getIO().to(`htchat:${msg.room}`).emit('htchat:reaction', { msgId: msg._id, reactions: msg.reactions });
    } catch { /* ignore */ }

    res.json({ success: true, data: msg.reactions });
  } catch (err) { next(err); }
};
