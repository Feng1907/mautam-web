import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { MessageCircle, Plus, Send, Users, X, Check, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

const avatarBg = (name = '') => {
  const colors = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  return colors[name.charCodeAt(0) % colors.length];
};

const fmtTime = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now - dt) / 86400000);
  if (diffDays === 0) return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hôm qua';
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

function Avatar({ name, avatar, size = 8 }) {
  const cls = `w-${size} h-${size} rounded-full object-cover shrink-0`;
  if (avatar) return <img src={avatar} alt={name} className={cls} />;
  return (
    <div className={`${cls} flex items-center justify-center text-white text-xs font-bold`}
      style={{ background: avatarBg(name || '?') }}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function RoomName({ room, myId }) {
  if (room.isGroup) return room.name || 'Nhóm';
  const other = room.members?.find(m => (m._id || m) !== myId);
  return other?.hoTen || 'Chat';
}

export default function HtChatWidget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen]           = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [text, setText]           = useState('');
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isGroup, setIsGroup]     = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef      = useRef(null);
  const prevRoomRef    = useRef(null);
  const inputRef       = useRef(null);

  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);

  // Socket
  useEffect(() => {
    if (!user || !isGiaoly) return;
    const socket = io(SERVER_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;
    socket.on('htchat:message', (msg) => {
      qc.setQueryData(['ht-messages', msg.room], old => old ? [...old, msg] : [msg]);
      qc.invalidateQueries(['ht-rooms']);
    });
    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (prevRoomRef.current) socket.emit('leave:htchat', prevRoomRef.current);
    if (activeRoom) { socket.emit('join:htchat', activeRoom); prevRoomRef.current = activeRoom; }
  }, [activeRoom]);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['ht-rooms'],
    queryFn: () => api.get('/ht-chat/rooms').then(r => r.data.data),
    enabled: !!isGiaoly,
    refetchInterval: open ? 30000 : false,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['ht-messages', activeRoom],
    queryFn: () => api.get(`/ht-chat/rooms/${activeRoom}/messages`).then(r => r.data.data),
    enabled: !!activeRoom,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['ht-users'],
    queryFn: () => api.get('/ht-chat/users').then(r => r.data.data),
    enabled: showNewRoom,
  });

  const createRoom = useMutation({
    mutationFn: (data) => api.post('/ht-chat/rooms', data).then(r => r.data.data),
    onSuccess: (room) => {
      qc.invalidateQueries(['ht-rooms']);
      setActiveRoom(room._id);
      setShowNewRoom(false);
      setSelectedUsers([]); setGroupName(''); setIsGroup(false);
    },
  });

  const sendMsg = useMutation({
    mutationFn: () => api.post(`/ht-chat/rooms/${activeRoom}/messages`, { text }),
    onMutate: () => {
      const opt = { _id: `opt-${Date.now()}`, room: activeRoom, sender: { _id: user._id, hoTen: user.hoTen, avatar: user.avatar }, text, createdAt: new Date().toISOString(), _optimistic: true };
      qc.setQueryData(['ht-messages', activeRoom], old => [...(old || []), opt]);
      setText('');
    },
    onSuccess: (res) => {
      qc.setQueryData(['ht-messages', activeRoom], old => old?.map(m => m._optimistic ? res.data.data : m) || []);
      qc.invalidateQueries(['ht-rooms']);
    },
    onError: () => {
      qc.setQueryData(['ht-messages', activeRoom], old => old?.filter(m => !m._optimistic) || []);
    },
  });

  const markRead = useCallback((roomId) => {
    api.put(`/ht-chat/rooms/${roomId}/read`).catch(() => {});
    qc.setQueryData(['ht-rooms'], old => old?.map(r => r._id === roomId ? { ...r, unread: 0 } : r));
  }, [qc]);

  const handleSelectRoom = (roomId) => { setActiveRoom(roomId); markRead(roomId); };

  useEffect(() => {
    if (open && activeRoom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, activeRoom]);

  useEffect(() => {
    if (open && activeRoom) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, activeRoom]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRoom || sendMsg.isPending) return;
    sendMsg.mutate();
  };

  const activeRoomData = rooms.find(r => r._id === activeRoom);
  const totalUnread = rooms.reduce((s, r) => s + (r.unread || 0), 0);

  if (!isGiaoly) return null;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="no-print fixed bottom-20 left-4 md:bottom-6 z-40 w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: '#8B0000' }}
        aria-label="Chat Huynh Trưởng"
      >
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {!open && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-amber-400 text-red-900 text-[10px] font-black flex items-center justify-center leading-none">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="no-print fixed bottom-36 left-4 md:bottom-22 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: '#8B0000' }}>
            <div className="flex items-center gap-2">
              {activeRoom && (
                <button onClick={() => setActiveRoom(null)} className="text-white/70 hover:text-white transition mr-1">
                  <ChevronLeft size={18} />
                </button>
              )}
              <MessageCircle size={16} className="text-white/80" />
              <span className="text-sm font-semibold text-white truncate max-w-40">
                {activeRoom && activeRoomData
                  ? <RoomName room={activeRoomData} myId={user._id} />
                  : 'Chat Huynh Trưởng'
                }
              </span>
            </div>
            <button onClick={() => setShowNewRoom(true)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
              title="Cuộc trò chuyện mới">
              <Plus size={15} />
            </button>
          </div>

          {/* Room list */}
          {!activeRoom && (
            <div className="flex-1 overflow-y-auto">
              {roomsLoading ? (
                <div className="p-3 space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm gap-2">
                  <MessageCircle size={32} className="opacity-20" />
                  <p>Chưa có cuộc trò chuyện</p>
                  <button onClick={() => setShowNewRoom(true)}
                    className="text-xs text-red-700 dark:text-red-400 font-semibold hover:underline">
                    Bắt đầu cuộc trò chuyện mới
                  </button>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {rooms.map(room => {
                    const other = !room.isGroup && room.members?.find(m => m._id !== user._id);
                    return (
                      <button key={room._id} onClick={() => handleSelectRoom(room._id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left">
                        {room.isGroup
                          ? <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                              <Users size={15} className="text-purple-600 dark:text-purple-400" />
                            </div>
                          : <Avatar name={other?.hoTen} avatar={other?.avatar} size={9} />
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">
                              {room.isGroup ? (room.name || 'Nhóm') : (other?.hoTen || 'Chat')}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0 ml-1">{fmtTime(room.lastMsgAt)}</span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{room.lastMsg || 'Bắt đầu trò chuyện'}</p>
                        </div>
                        {room.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {room.unread > 9 ? '9+' : room.unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {activeRoom && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-300 text-sm">Đang tải...</div>
                ) : messages.map(msg => {
                  const isMe = (msg.sender?._id || msg.sender) === user._id;
                  return (
                    <div key={msg._id} className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && <Avatar name={msg.sender?.hoTen} avatar={msg.sender?.avatar} size={6} />}
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMe ? 'bg-red-700 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-bl-sm'
                      } ${msg._optimistic ? 'opacity-60' : ''}`}>
                        {!isMe && msg.sender?.hoTen && (
                          <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">{msg.sender.hoTen}</p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px]">{msg.text}</p>
                        <p className={`text-[10px] mt-0.5 text-right ${isMe ? 'text-red-200' : 'text-gray-400 dark:text-slate-500'}`}>
                          {fmtTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 dark:border-slate-700 shrink-0">
                <input ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:border-red-400 transition"
                  maxLength={2000}
                />
                <button type="submit" disabled={!text.trim() || sendMsg.isPending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition shrink-0"
                  style={{ background: '#8B0000' }}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── New room modal ── */}
      {showNewRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 dark:text-slate-100">Cuộc trò chuyện mới</h2>
              <button onClick={() => { setShowNewRoom(false); setSelectedUsers([]); setIsGroup(false); setGroupName(''); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X size={16} />
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="sr-only" checked={isGroup} onChange={e => setIsGroup(e.target.checked)} />
              <div className={`w-8 h-5 rounded-full transition flex items-center px-0.5 ${isGroup ? 'bg-red-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isGroup ? 'translate-x-3' : ''}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-slate-300">Tạo nhóm</span>
            </label>

            {isGroup && (
              <input className="input" placeholder="Tên nhóm" value={groupName}
                onChange={e => setGroupName(e.target.value)} />
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Chọn thành viên {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allUsers.map(u => {
                  const selected = selectedUsers.includes(u._id);
                  return (
                    <button key={u._id}
                      onClick={() => isGroup
                        ? setSelectedUsers(p => selected ? p.filter(id => id !== u._id) : [...p, u._id])
                        : setSelectedUsers([u._id])
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                        selected ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}>
                      <Avatar name={u.hoTen} avatar={u.avatar} size={8} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{u.hoTen}</p>
                        <p className="text-xs text-gray-400">{u.vaiTro === 'admin' ? 'Admin' : u.chucVu || 'Huynh trưởng'}</p>
                      </div>
                      {selected && <Check size={15} className="text-red-600 dark:text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              disabled={selectedUsers.length === 0 || createRoom.isPending}
              onClick={() => createRoom.mutate({ memberIds: selectedUsers, isGroup, name: groupName })}
              className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {createRoom.isPending ? 'Đang tạo...' : isGroup ? 'Tạo nhóm' : 'Bắt đầu chat'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
