import api from '../services/api';

const SUBSCRIPTION_STORAGE_KEY = 'pushSubscriptionEndpoint';
const SERVICE_WORKER_URL = '/sw.js';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const isPushNotificationSupported = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const getPushPermissionState = () => {
  if (!isPushNotificationSupported()) return 'unsupported';
  return window.Notification.permission;
};

export const getNotificationSettingsHint = () => {
  const browser = navigator.userAgent.includes('Edg/')
    ? 'Edge'
    : navigator.userAgent.includes('Chrome/')
      ? 'Chrome'
      : navigator.userAgent.includes('Firefox/')
        ? 'Firefox'
        : 'trinh duyet';

  return `Thong bao dang bi chan. Hay bam bieu tuong khoa/cai dat canh thanh dia chi cua ${browser}, mo Site settings va cho phep Notifications cho website nay.`;
};

const getPushRegistration = async () => navigator.serviceWorker.register(SERVICE_WORKER_URL);

export const registerPushNotifications = async () => {
  if (!isPushNotificationSupported()) {
    return { success: false, reason: 'unsupported' };
  }

  if (window.Notification.permission === 'denied') {
    return { success: false, reason: 'denied' };
  }

  const registration = await getPushRegistration();

  let permission = window.Notification.permission;
  if (permission === 'default') {
    permission = await window.Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return { success: false, reason: permission };
  }

  const keyRes = await api.get('/notifications/public-key');
  const publicKey = keyRes.data?.data?.publicKey;
  if (!publicKey) {
    return { success: false, reason: 'missing-public-key' };
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await api.post('/notifications/subscribe', subscription.toJSON());
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, subscription.endpoint);

  return { success: true, subscription };
};

export const syncPushNotificationsIfGranted = async () => {
  if (!isPushNotificationSupported() || window.Notification.permission !== 'granted') {
    return { success: false, reason: getPushPermissionState() };
  }

  return registerPushNotifications();
};
