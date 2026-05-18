import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

export default function RealtimeToasts() {
  const toast = useToast();
  const navigate = useNavigate();

  const onNewPost = useCallback((data) => {
    const label = data.loai === 'thongbaokhan' ? '🚨 Thông báo khẩn' : '📰 Bài viết mới';
    toast(`${label}: ${data.tieuDe}`, 'info', 6000);
  }, [toast]);

  const onAttendanceSaved = useCallback((data) => {
    const dateStr = data.date
      ? new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
      : '';
    toast(
      `✅ ${data.teacherName} vừa điểm danh ${data.lopName}${dateStr ? ` (${dateStr})` : ''}`,
      'success',
      5000
    );
    void navigate; // navigate available if needed for future click-to-navigate
  }, [toast, navigate]);

  useRealtimeNotifications({ onNewPost, onAttendanceSaved });

  return null;
}
