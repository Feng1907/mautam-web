const webPush = require('web-push');

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

const hasVapidConfig = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (hasVapidConfig) {
  webPush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@mautam.local',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

module.exports = {
  webPush,
  hasVapidConfig,
  vapidPublicKey: VAPID_PUBLIC_KEY || '',
};
