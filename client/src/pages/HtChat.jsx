import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { Plus, Send, Users, X, Check, ChevronLeft, Trash2, Paperclip, FileText, MessageCircle } from 'lucide-react';
import HuynhTruongLogo from '../components/HuynhTruongLogo';
import HuynhTruongRoom from '../components/HuynhTruongRoom';
import { formatClassName } from '../utils/formatClassName';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const SERVER_URL = import.meta.env.VITE_API_URL || '';
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🙏', '😮'];

const avatarBg = (name = '') => {
  const colors = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  return colors[name.charCodeAt(0) % colors.length];
};

const fmtTime = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const diffDays = Math.floor((new Date() - dt) / 86400000);
  if (diffDays === 0) return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hôm qua';
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const fmtFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  if (room.isGroup) return formatClassName(room.classRef?.tenLop || room.name || 'Nhóm');
  const other = room.members?.find(m => (m._id || m) !== myId);
  return other?.hoTen || 'Chat';
}

function ReactionBar({ onReact }) {
  return (
    <div className="absolute bottom-full mb-1 left-0 flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full px-2 py-1 shadow-lg z-10">
      {QUICK_EMOJIS.map(e => (
        <button key={e} onClick={() => onReact(e)}
          className="text-base hover:scale-125 transition-transform leading-none p-0.5">
          {e}
        </button>
      ))}
    </div>
  );
}

export default function HtChatWidget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen]               = useState(false);
  const [activeRoom, setActiveRoom]   = useState(null);
  const [text, setText]               = useState('');
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName]     = useState('');
  const [isGroup, setIsGroup]         = useState(false);
  const [typingUser, setTypingUser]   = useState(null);
  const [hoveredMsg, setHoveredMsg]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);   // { file, preview, uploading }
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef      = useRef(null);
  const prevRoomRef    = useRef(null);
  const inputRef       = useRef(null);
  const fileInputRef   = useRef(null);
  const typingTimerRef = useRef(null);

  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);

  // Socket setup
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
    socket.on('htchat:message:deleted', ({ _id, room }) => {
      qc.setQueryData(['ht-messages', room], old =>
        old?.map(m => m._id === _id ? { ...m, deleted: true, text: '', attachments: [] } : m)
      );
    });
    socket.on('htchat:reaction', ({ msgId, reactions }) => {
      // update all loaded message caches
      qc.setQueriesData({ queryKey: ['ht-messages'] }, old =>
        old?.map(m => m._id === msgId ? { ...m, reactions } : m)
      );
    });
    socket.on('htchat:typing', ({ roomId, hoTen }) => {
      setTypingUser({ roomId, hoTen });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    return () => { socket.disconnect(); clearTimeout(typingTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Join/leave htchat room on socket when activeRoom changes
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
    mutationFn: ({ text: t, attachments }) =>
      api.post(`/ht-chat/rooms/${activeRoom}/messages`, { text: t, attachments }),
    onMutate: ({ text: t, attachments }) => {
      const opt = {
        _id: `opt-${Date.now()}`,
        room: activeRoom,
        sender: { _id: user._id, hoTen: user.hoTen, avatar: user.avatar },
        text: t,
        attachments: attachments || [],
        reactions: [],
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      qc.setQueryData(['ht-messages', activeRoom], old => [...(old || []), opt]);
      setText('');
      setPendingFile(null);
    },
    onSuccess: (res) => {
      qc.setQueryData(['ht-messages', activeRoom], old =>
        old?.map(m => m._optimistic ? res.data.data : m) || []
      );
      qc.invalidateQueries(['ht-rooms']);
    },
    onError: () => {
      qc.setQueryData(['ht-messages', activeRoom], old => old?.filter(m => !m._optimistic) || []);
    },
  });

  const deleteMsg = useMutation({
    mutationFn: (msgId) => api.delete(`/ht-chat/rooms/${activeRoom}/messages/${msgId}`),
    onSuccess: (_, msgId) => {
      qc.setQueryData(['ht-messages', activeRoom], old =>
        old?.map(m => m._id === msgId ? { ...m, deleted: true, text: '', attachments: [] } : m)
      );
      setConfirmDelete(null);
    },
  });

  const reactMsg = useMutation({
    mutationFn: ({ msgId, emoji }) =>
      api.post(`/ht-chat/rooms/${activeRoom}/messages/${msgId}/react`, { emoji }),
    onSuccess: (res, { msgId }) => {
      qc.setQueryData(['ht-messages', activeRoom], old =>
        old?.map(m => m._id === msgId ? { ...m, reactions: res.data.data } : m)
      );
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

  const handleTyping = (e) => {
    setText(e.target.value);
    if (activeRoom && socketRef.current) {
      socketRef.current.emit('htchat:typing', { roomId: activeRoom, hoTen: user.hoTen });
    }
  };

  // Firebase upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File tối đa 10MB'); return; }
    const isImage = file.type.startsWith('image/');
    const preview = isImage ? URL.createObjectURL(file) : null;
    setPendingFile({ file, preview, uploading: false, isImage });
    e.target.value = '';
  };

  const uploadAndSend = async () => {
    if (!activeRoom || sendMsg.isPending) return;
    if (!text.trim() && !pendingFile) return;

    let attachments = [];
    if (pendingFile) {
      setPendingFile(p => ({ ...p, uploading: true }));
      try {
        const path = `ht-chat/${activeRoom}/${Date.now()}_${pendingFile.file.name}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, pendingFile.file);
        const url = await new Promise((resolve, reject) => {
          task.on('state_changed', null, reject, async () => {
            resolve(await getDownloadURL(task.snapshot.ref));
          });
        });
        attachments = [{ url, fileName: pendingFile.file.name, fileType: pendingFile.isImage ? 'image' : 'file', fileSize: pendingFile.file.size }];
      } catch {
        setPendingFile(p => ({ ...p, uploading: false }));
        alert('Upload thất bại, thử lại');
        return;
      }
    }

    sendMsg.mutate({ text: text.trim(), attachments });
  };

  const handleSend = (e) => {
    e.preventDefault();
    uploadAndSend();
  };

  const activeRoomData = rooms.find(r => r._id === activeRoom);
  const totalUnread = rooms.reduce((s, r) => s + (r.unread || 0), 0);
  const classRooms = rooms.filter(r => r.classRef);
  const dmRooms    = rooms.filter(r => !r.classRef);
  const showTyping = typingUser && typingUser.roomId === activeRoom;

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
          : <HuynhTruongLogo symbol="flame" size={38} animated compact={false} title="Chat Huynh Trưởng" />
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
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: '#8B0000' }}>
            <div className="flex items-center gap-2">
              {activeRoom && (
                <button onClick={() => setActiveRoom(null)} className="text-white/70 hover:text-white transition mr-1">
                  <ChevronLeft size={18} />
                </button>
              )}
              <HuynhTruongLogo symbol="flame" size={18} animated={false} compact title="Chat Huynh Trưởng" />
              <span className="text-sm font-semibold text-white truncate max-w-40">
                {activeRoom && activeRoomData
                  ? <RoomName room={activeRoomData} myId={user._id} />
                  : 'Chat Huynh Trưởng'}
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
                  <button onClick={() => setShowNewRoom(true)} className="text-xs text-red-700 dark:text-red-400 font-semibold hover:underline">
                    Bắt đầu cuộc trò chuyện mới
                  </button>
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {/* Lớp của tôi */}
                  {classRooms.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Lớp của tôi</p>
                      {classRooms.map(room => (
                        <HuynhTruongRoom
                          key={room._id}
                          active={room._id === activeRoom}
                          onClick={() => handleSelectRoom(room._id)}
                          members={room.members || []}
                          unread={room.unread || 0}
                          density="compact"
                          className="rounded-xl!"
                          _name={formatClassName(room.classRef?.tenLop || room.name)}
                        />
                      ))}
                    </div>
                  )}

                  {/* DM & nhóm tự tạo */}
                  {dmRooms.length > 0 && (
                    <div className="space-y-0.5">
                      {classRooms.length > 0 && (
                        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Tin nhắn riêng</p>
                      )}
                      {dmRooms.map(room => {
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
            </div>
          )}

          {/* Messages */}
          {activeRoom && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" onClick={() => setHoveredMsg(null)}>
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-300 text-sm">Đang tải...</div>
                ) : messages.map(msg => {
                  const isMe = (msg.sender?._id || msg.sender) === user._id;
                  const hasReactions = msg.reactions?.some(r => r.users?.length > 0);

                  return (
                    <div key={msg._id}
                      className={`flex items-end gap-1.5 group ${isMe ? 'flex-row-reverse' : ''}`}
                      onMouseEnter={() => setHoveredMsg(msg._id)}
                      onMouseLeave={() => { if (confirmDelete !== msg._id) setHoveredMsg(null); }}
                    >
                      {!isMe && <Avatar name={msg.sender?.hoTen} avatar={msg.sender?.avatar} size={6} />}

                      <div className="relative max-w-[75%]">
                        {/* Reaction bar on hover */}
                        {hoveredMsg === msg._id && !msg.deleted && !msg._optimistic && (
                          <ReactionBar onReact={(emoji) => { reactMsg.mutate({ msgId: msg._id, emoji }); setHoveredMsg(null); }} />
                        )}

                        {/* Delete button for own messages */}
                        {isMe && hoveredMsg === msg._id && !msg.deleted && !msg._optimistic && (
                          <div className={`absolute top-0 ${isMe ? '-left-7' : '-right-7'} flex items-center`}>
                            {confirmDelete === msg._id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => deleteMsg.mutate(msg._id)}
                                  className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">Xóa</button>
                                <button onClick={() => setConfirmDelete(null)}
                                  className="text-[10px] bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded">Thôi</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDelete(msg._id)}
                                className="p-1 text-gray-300 hover:text-red-400 transition">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Bubble */}
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe ? 'bg-red-700 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-bl-sm'
                        } ${msg._optimistic ? 'opacity-60' : ''}`}>
                          {!isMe && msg.sender?.hoTen && (
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">{msg.sender.hoTen}</p>
                          )}

                          {msg.deleted ? (
                            <em className="text-xs opacity-50">Tin nhắn đã bị xóa</em>
                          ) : (
                            <>
                              {msg.text && (
                                <p className="leading-relaxed whitespace-pre-wrap wrap-break-word text-[13px]">{msg.text}</p>
                              )}
                              {msg.attachments?.map((att, i) => (
                                att.fileType === 'image' ? (
                                  <img key={i} src={att.url} alt={att.fileName}
                                    className="max-w-48 rounded-lg mt-1 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => setLightboxUrl(att.url)} />
                                ) : (
                                  <a key={i} href={att.url} target="_blank" rel="noreferrer"
                                    className={`flex items-center gap-2 mt-1 px-2 py-1.5 rounded-lg ${isMe ? 'bg-white/15 hover:bg-white/25' : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'} transition`}>
                                    <FileText size={14} className={isMe ? 'text-white/80' : 'text-gray-500'} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium truncate max-w-32">{att.fileName}</p>
                                      <p className="text-[10px] opacity-60">{fmtFileSize(att.fileSize)}</p>
                                    </div>
                                  </a>
                                )
                              ))}
                            </>
                          )}

                          <p className={`text-[10px] mt-0.5 text-right ${isMe ? 'text-red-200' : 'text-gray-400 dark:text-slate-500'}`}>
                            {fmtTime(msg.createdAt)}
                          </p>
                        </div>

                        {/* Reactions */}
                        {hasReactions && (
                          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {msg.reactions.filter(r => r.users?.length > 0).map(r => {
                              const iReacted = r.users?.some(u => (u._id || u) === user._id);
                              return (
                                <button key={r.emoji}
                                  onClick={() => reactMsg.mutate({ msgId: msg._id, emoji: r.emoji })}
                                  className={`flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full border transition ${
                                    iReacted ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-600 font-bold' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'
                                  }`}>
                                  <span>{r.emoji}</span>
                                  <span className="text-gray-600 dark:text-slate-300">{r.users.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {showTyping && (
                <div className="px-4 pb-1 shrink-0">
                  <p className="text-xs italic text-gray-400 dark:text-slate-500">{typingUser.hoTen} đang gõ...</p>
                </div>
              )}

              {/* Pending file preview */}
              {pendingFile && (
                <div className="px-3 pb-1 shrink-0">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-2">
                    {pendingFile.isImage
                      ? <img src={pendingFile.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      : <FileText size={20} className="text-gray-400 shrink-0" />
                    }
                    <p className="text-xs text-gray-600 dark:text-slate-300 truncate flex-1 min-w-0">{pendingFile.file.name}</p>
                    {pendingFile.uploading
                      ? <span className="text-xs text-blue-500 shrink-0">Đang tải...</span>
                      : <button onClick={() => setPendingFile(null)} className="text-gray-400 hover:text-red-500 transition shrink-0"><X size={14} /></button>
                    }
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-1.5 px-3 py-2.5 border-t border-gray-100 dark:border-slate-700 shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition shrink-0" title="Đính kèm file">
                  <Paperclip size={16} />
                </button>
                <input ref={inputRef}
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:border-red-400 transition"
                  maxLength={2000}
                />
                <button type="submit"
                  disabled={(!text.trim() && !pendingFile) || sendMsg.isPending || pendingFile?.uploading}
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
              <input className="input" placeholder="Tên nhóm" value={groupName} onChange={e => setGroupName(e.target.value)} />
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

      {/* ── Image lightbox ── */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl" />
          <button onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
