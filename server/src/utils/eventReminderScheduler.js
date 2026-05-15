const CountdownEvent = require('../models/CountdownEvent');
const { notifyEventReminder } = require('./pushNotifier');
const { logger } = require('./logger');

const CHECK_INTERVAL_MS = 60 * 1000;
const REMINDER_WINDOW_MS = 30 * 60 * 1000;
const WINDOW_TOLERANCE_MS = 60 * 1000;

const parseEventDate = (value) => {
  if (!value || !value.includes('T')) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sendDueEventReminders = async () => {
  const now = Date.now();
  const events = await CountdownEvent.find({
    active: true,
    reminderPushSentAt: null,
  });

  await Promise.all(events.map(async (event) => {
    const eventDate = parseEventDate(event.date);
    if (!eventDate) return;

    const msUntilStart = eventDate.getTime() - now;
    const isDue =
      msUntilStart <= REMINDER_WINDOW_MS &&
      msUntilStart > REMINDER_WINDOW_MS - WINDOW_TOLERANCE_MS;

    if (!isDue) return;

    await notifyEventReminder(event);
    event.reminderPushSentAt = new Date();
    await event.save();
  }));
};

const startEventReminderScheduler = () => {
  const tick = () => {
    sendDueEventReminders().catch((err) => {
      logger.warn('Gui push nhac su kien that bai', { error: err.message });
    });
  };

  tick();
  return setInterval(tick, CHECK_INTERVAL_MS);
};

module.exports = {
  sendDueEventReminders,
  startEventReminderScheduler,
};
