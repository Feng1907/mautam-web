import { useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { syncPushNotificationsIfGranted } from '../utils/pushNotifications';

const PushNotificationManager = () => {
  const { user } = useAuth();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!user || requestedRef.current) return;
    requestedRef.current = true;

    syncPushNotificationsIfGranted().catch((err) => {
      if (import.meta.env.DEV) {
        console.warn('Push notification registration failed:', err);
      }
    });
  }, [user]);

  return null;
};

export default PushNotificationManager;
