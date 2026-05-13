import api from '../services/api';

const SUBSCRIPTION_STORAGE_KEY = 'pushSubscriptionEndpoint';

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

export const registerPushNotifications = async () => {
  if (!isPushNotificationSupported()) {
    return { success: false, reason: 'unsupported' };
  }

  if (window.Notification.permission === 'denied') {
    return { success: false, reason: 'denied' };
  }

  const registration = await navigator.serviceWorker.register('/sw.js');

  let permission = window.Notification.permission;
  if (permission === 'default') {
    permission = await window.Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return { success: false, reason: permission };
  }

  const keyRes = await api.get('/subscribe/public-key');
  const publicKey = keyRes.data?.data?.publicKey;
  if (!publicKey) {
    return { success: false, reason: 'missing-public-key' };
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await api.post('/subscribe', subscription.toJSON());
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, subscription.endpoint);

  return { success: true, subscription };
};
