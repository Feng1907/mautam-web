import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../store/AuthContext';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

/**
 * Kết nối Socket.io toàn cục, nhận thông báo real-time:
 * - post:new       → gọi onNewPost({ id, tieuDe, loai, slug })
 * - attendance:saved → gọi onAttendanceSaved({ lopName, date, teacherName, present }) [admin only]
 */
export function useRealtimeNotifications({ onNewPost, onAttendanceSaved } = {}) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const cbPost = useRef(onNewPost);
  const cbAttendance = useRef(onAttendanceSaved);

  // Giữ ref luôn mới nhất để không cần re-connect khi callback thay đổi
  useEffect(() => { cbPost.current = onNewPost; }, [onNewPost]);
  useEffect(() => { cbAttendance.current = onAttendanceSaved; }, [onAttendanceSaved]);

  const handleNewPost = useCallback((data) => cbPost.current?.(data), []);
  const handleAttendanceSaved = useCallback((data) => cbAttendance.current?.(data), []);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?.vaiTro === 'admin') {
        socket.emit('join:admin');
      }
    });

    socket.on('reconnect', () => {
      if (user?.vaiTro === 'admin') {
        socket.emit('join:admin');
      }
    });

    socket.on('post:new', handleNewPost);
    socket.on('attendance:saved', handleAttendanceSaved);

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.vaiTro]);

  return null;
}
