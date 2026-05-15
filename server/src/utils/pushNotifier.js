const User = require('../models/User');
const ParentStudent = require('../models/ParentStudent');
const { hasVapidConfig, webPush } = require('../config/webPush');
const logger = require('./logger');

const staleSubscriptionStatuses = new Set([404, 410]);

const compactText = (value = '', maxLength = 140) => {
  const text = String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
};

const buildUrgentPostPayload = (post) => ({
  title: `[KHAN] ${post.tieuDe}`,
  body: compactText(post.tomTat || post.noiDung || 'Co thong bao khan moi tu Mau Tam'),
  icon: post.anhDaiDien || '/favicon.svg',
  badge: '/favicon.svg',
  url: `/tin-tuc/${post._id}`,
  postId: String(post._id),
  type: 'urgent-post',
});

const buildLateAttendancePayload = ({ student, lopName, checkedAt }) => ({
  title: 'Doan sinh diem danh muon',
  body: `${student.tenThanh ? `${student.tenThanh} ` : ''}${student.hoTen} vua diem danh muon${lopName ? ` tai lop ${lopName}` : ''}.`,
  icon: student.avatar || '/favicon.svg',
  badge: '/favicon.svg',
  url: '/phu-huynh',
  type: 'late-attendance',
  studentId: String(student._id),
  checkedAt,
});

const buildEventReminderPayload = (event) => ({
  title: 'Sap den su kien',
  body: `${event.name} se bat dau trong 30 phut.`,
  icon: '/favicon.svg',
  badge: '/favicon.svg',
  url: '/',
  type: 'event-reminder',
  eventId: String(event._id),
});

const removeStaleSubscriptions = async (endpoints) => {
  if (!endpoints.length) return;

  await User.updateMany(
    { 'pushSubscriptions.endpoint': { $in: endpoints } },
    { $pull: { pushSubscriptions: { endpoint: { $in: endpoints } } } }
  );
};

const sendPushToAllUsers = async (payload) => {
  if (!hasVapidConfig) {
    logger.warn('Bo qua web-push vi chua cau hinh VAPID keys');
    return { attempted: 0, sent: 0, failed: 0, removed: 0, skipped: true };
  }

  const users = await User.find({ 'pushSubscriptions.0': { $exists: true } }).select('pushSubscriptions');
  const subscriptions = users.flatMap((user) =>
    user.pushSubscriptions.map((subscription) => subscription.toObject())
  );

  if (!subscriptions.length) {
    return { attempted: 0, sent: 0, failed: 0, removed: 0, skipped: false };
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) => webPush.sendNotification(subscription, body))
  );

  const staleEndpoints = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent += 1;
      return;
    }

    failed += 1;
    const statusCode = result.reason?.statusCode;
    if (staleSubscriptionStatuses.has(statusCode)) {
      staleEndpoints.push(subscriptions[index].endpoint);
    }
  });

  await removeStaleSubscriptions(staleEndpoints);

  if (failed > 0) {
    logger.warn('Gui web-push co subscription loi', {
      attempted: subscriptions.length,
      sent,
      failed,
      removed: staleEndpoints.length,
    });
  }

  return {
    attempted: subscriptions.length,
    sent,
    failed,
    removed: staleEndpoints.length,
    skipped: false,
  };
};

const sendPushToUsers = async (userIds, payload) => {
  const uniqueUserIds = [...new Set(userIds.map(String))];
  if (!hasVapidConfig) {
    logger.warn('Bo qua web-push vi chua cau hinh VAPID keys');
    return { attempted: 0, sent: 0, failed: 0, removed: 0, skipped: true };
  }

  if (!uniqueUserIds.length) {
    return { attempted: 0, sent: 0, failed: 0, removed: 0, skipped: false };
  }

  const users = await User.find({
    _id: { $in: uniqueUserIds },
    'pushSubscriptions.0': { $exists: true },
  }).select('pushSubscriptions');

  const subscriptions = users.flatMap((user) =>
    user.pushSubscriptions.map((subscription) => subscription.toObject())
  );

  if (!subscriptions.length) {
    return { attempted: 0, sent: 0, failed: 0, removed: 0, skipped: false };
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) => webPush.sendNotification(subscription, body))
  );

  const staleEndpoints = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent += 1;
      return;
    }

    failed += 1;
    const statusCode = result.reason?.statusCode;
    if (staleSubscriptionStatuses.has(statusCode)) {
      staleEndpoints.push(subscriptions[index].endpoint);
    }
  });

  await removeStaleSubscriptions(staleEndpoints);

  return {
    attempted: subscriptions.length,
    sent,
    failed,
    removed: staleEndpoints.length,
    skipped: false,
  };
};

const notifyLateAttendance = async ({ student, lopName, checkedAt }) => {
  const links = await ParentStudent.find({
    student: student._id,
    trangThai: 'active',
  }).select('parent');

  const parentIds = links.map((link) => link.parent);
  const result = await sendPushToUsers(
    parentIds,
    buildLateAttendancePayload({ student, lopName, checkedAt })
  );

  logger.info('Da xu ly web-push diem danh muon', {
    studentId: student._id,
    ...result,
  });

  return result;
};

const notifyEventReminder = async (event) => {
  const result = await sendPushToAllUsers(buildEventReminderPayload(event));
  logger.info('Da xu ly web-push nhac su kien', {
    eventId: event._id,
    ...result,
  });
  return result;
};

const notifyUrgentPostPublished = async (post) => {
  const result = await sendPushToAllUsers(buildUrgentPostPayload(post));
  logger.info('Da xu ly web-push thong bao khan', {
    postId: post._id,
    ...result,
  });
  return result;
};

module.exports = {
  buildEventReminderPayload,
  buildLateAttendancePayload,
  buildUrgentPostPayload,
  notifyEventReminder,
  notifyLateAttendance,
  notifyUrgentPostPublished,
  sendPushToUsers,
  sendPushToAllUsers,
};
