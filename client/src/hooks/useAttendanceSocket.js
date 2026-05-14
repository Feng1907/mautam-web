import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

/**
 * Hook kết nối Socket.io, join room lớp, lắng nghe attendance:checked.
 * Tự động reconnect khi mất kết nối.
 */
export function useAttendanceSocket(lopId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]); // tối đa 10 em gần nhất
  const [latestCheckin, setLatestCheckin] = useState(null);  // dùng cho Toast

  const handleCheckin = useCallback((payload) => {
    setLatestCheckin({ ...payload, id: Date.now() });
    setRecentCheckins(prev => [payload, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    if (!lopId) return;

    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join:lop', lopId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('reconnect', () => {
      setConnected(true);
      socket.emit('join:lop', lopId); // re-join sau reconnect
    });

    socket.on('attendance:checked', handleCheckin);

    return () => {
      socket.emit('leave:lop', lopId);
      socket.disconnect();
    };
  }, [lopId, handleCheckin]);

  return { connected, recentCheckins, latestCheckin };
}
