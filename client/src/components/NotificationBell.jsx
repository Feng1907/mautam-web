import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../store/AuthContext';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

const TYPE_LABEL = {
  post:        'Bài viết mới',
  thongbao:    'Thông báo',
  thongbaokhan:'Thông báo khẩn',
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]     = useState(false);
  const panelRef = useRef(null);
  const socketRef = useRef(null);

  const addNotif = useCallback((n) => {
    setNotifs(prev => [{ ...n, _nid: Date.now(), read: false }, ...prev].slice(0, 20));
  }, []);

  // Socket connection — only when logged in
  useEffect(() => {
    if (!user) return;

    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user.vaiTro === 'admin') socket.emit('join:admin');
    });
    socket.on('reconnect', () => {
      if (user.vaiTro === 'admin') socket.emit('join:admin');
    });

    // post:new → map to notification format
    socket.on('post:new', (data) => {
      addNotif({
        type: data.loai || 'post',
        title: TYPE_LABEL[data.loai] || 'Bài viết mới',
        body: data.tieuDe,
        link: `/tin-tuc/${data.slug || data.id}`,
      });
    });

    // generic notification:new for future extensibility
    socket.on('notification:new', addNotif);

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Close panel when clicking outside
  useEffect(() => {
    const h = (e) => { if (!panelRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        className="relative p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
        aria-label="Thông báo"
      >
        <Bell size={18} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-[60]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Thông báo</span>
            {notifs.length > 0 && (
              <button
                onClick={() => setNotifs([])}
                className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">
                Không có thông báo mới
              </p>
            ) : (
              notifs.map(n => (
                <Link
                  key={n._nid}
                  to={n.link || '#'}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-50 dark:border-slate-700/60 last:border-0 transition"
                >
                  <div className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-red-500 self-start mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-slate-100 truncate mt-0.5">{n.body}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
