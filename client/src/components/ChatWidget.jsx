import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Trash2, ChevronDown, Minus, Paperclip, Mic, MicOff,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

// ── File helpers ──────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';
const MAX_SIZE_MB    = 5;
const BOT_LOGO_SRC   = '/logos/logos doan thieu nhi MT.jpg';

const toApiMessage = (msg) => ({
  role: msg.role,
  parts: [{ text: String(msg.parts?.[0]?.text || '').trim() }],
});

const normalizeAssistantName = (text = '') =>
  String(text).replace(/Huynh\s*Ảo/gi, 'Trợ lý Xứ Đoàn');

const buildApiHistory = (messages, userText) => {
  const clean = messages
    .filter((msg, index) => index > 0 && !msg.isError)
    .map(toApiMessage)
    .filter((msg) => (msg.role === 'user' || msg.role === 'model') && msg.parts[0].text);

  const completedTurns = [];
  for (let i = 0; i < clean.length - 1; i += 1) {
    const userMsg = clean[i];
    const modelMsg = clean[i + 1];
    if (userMsg.role === 'user' && modelMsg.role === 'model') {
      completedTurns.push(userMsg, modelMsg);
      i += 1;
    }
  }

  return [
    ...completedTurns,
    { role: 'user', parts: [{ text: userText }] },
  ];
};

const fileIcon = (type) => {
  if (type?.startsWith('image/'))    return '🖼️';
  if (type === 'application/pdf')    return '📄';
  if (type?.includes('wordprocess')) return '📝';
  return '📃';
};

const fmtSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

// ── Câu hỏi gợi ý nhanh ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🕐', label: 'Giờ lễ hôm nay',        text: 'Cho anh/chị hỏi giờ lễ hôm nay là mấy giờ?' },
  { icon: '📖', label: 'Giáo lý cơ bản',         text: 'Giáo lý cơ bản của đạo Công giáo là gì?' },
  { icon: '🏫', label: 'Các ngành xứ đoàn',      text: 'Xứ đoàn mình có những ngành nào?' },
  { icon: '📅', label: 'Sự kiện sắp tới',        text: 'Xứ đoàn mình có sự kiện gì sắp tới không?' },
  { icon: '🙏', label: 'Ý nghĩa Thánh Lễ',       text: 'Thánh Lễ có ý nghĩa gì với người Công giáo?' },
  { icon: '🌿', label: 'Mùa phụng vụ hiện tại',  text: 'Hiện tại chúng ta đang ở mùa phụng vụ nào?' },
];

const GREETING = `Chào các em! 👋 Anh là **Trợ lý Xứ Đoàn** — trợ lý ảo của Xứ Đoàn Anrê Phú Yên 🕊️

Anh có thể giúp các em về:
- Giờ lễ & lịch sinh hoạt
- Giáo lý & Kinh Thánh
- Các ngành & hoạt động xứ đoàn
- Hỗ trợ tinh thần đức tin

Các em cứ thoải mái hỏi nhé! 😊`;

const firstName = (name = '') => name.trim().split(/\s+/).slice(-1)[0] || '';

const roleTitle = (user) => {
  if (!user) return '';
  if (user.vaiTro === 'admin') return 'Admin';
  if (user.chucVu === 'huynhtruong') return 'Trưởng';
  if (user.chucVu === 'dutruong') return 'Dự trưởng';
  if (user.vaiTro === 'giaoly') return 'anh/chị';
  if (user.vaiTro === 'PARENT') return 'quý phụ huynh';
  return '';
};

const buildGreeting = (user) => {
  if (!user) return GREETING;

  const title = roleTitle(user);
  const name = firstName(user.hoTen);
  const classNames = (user.lopPhuTrach || [])
    .map((lop) => lop?.tenLop || lop?.name)
    .filter(Boolean);

  if (user.vaiTro === 'giaoly' && classNames.length) {
    return `Chào ${title} ${name}! 👋

Hôm nay Trợ lý Xứ Đoàn đã sẵn sàng hỗ trợ lớp **${classNames.join(', ')}** của ${title.toLowerCase()}.

${title === 'Trưởng' ? 'Nếu có đoàn sinh vắng hoặc đi trễ, anh có thể giúp soạn tin nhắn nhắc phụ huynh thật nhanh.' : 'Anh có thể hỗ trợ tra lịch sinh hoạt, giáo lý, điểm danh và soạn thông báo cho phụ huynh.'}`;
  }

  return `Chào ${title ? `${title} ` : ''}${name || user.hoTen || 'anh/chị'}! 👋

Anh là **Trợ lý Xứ Đoàn** của Xứ Đoàn Anrê Phú Yên.

Anh có thể hỗ trợ tra lịch sinh hoạt, tin tức, giáo lý, điểm danh và soạn thông báo khi cần.`;
};

// ── Markdown renderer (bold, italic, code, bullet, numbered) ─────────────────
const parseInline = (text) => {
  if (!text) return null;
  const result = [];
  let rest = text;
  let key = 0;

  const PATTERNS = [
    { re: /\*\*(.*?)\*\*/, El: 'strong' },
    { re: /\*(.*?)\*/,     El: 'em'     },
    { re: /_(.*?)_/,       El: 'em'     },
    { re: /`([^`]+)`/,     El: 'code'   },
  ];

  let guard = 0;
  while (rest.length > 0 && guard++ < 200) {
    let earliest = { index: Infinity, p: null, match: null };
    for (const p of PATTERNS) {
      const m = rest.match(p.re);
      if (m && m.index < earliest.index) earliest = { index: m.index, p, match: m };
    }
    if (!earliest.match) { result.push(rest); break; }
    if (earliest.index > 0) result.push(rest.slice(0, earliest.index));
    const { El } = earliest.p;
    const inner = earliest.match[1];
    if (El === 'code') {
      result.push(<code key={key++} className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[11.5px] font-mono text-[#8B0000]">{inner}</code>);
    } else if (El === 'strong') {
      result.push(<strong key={key++} className="font-bold">{inner}</strong>);
    } else {
      result.push(<em key={key++} className="italic">{inner}</em>);
    }
    rest = rest.slice(earliest.index + earliest.match[0].length);
  }

  return result;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = (type) => {
    if (!listItems.length) return;
    const Tag = type === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} className={`${type === 'ol' ? 'list-decimal' : 'list-disc'} pl-4 my-1 space-y-0.5`}>
        {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </Tag>
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    // Numbered list: "1. " "2. "
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) { listItems.push(numMatch[2]); return; }

    // Bullet: "- " or "• "
    const bulletMatch = line.match(/^[-•]\s+(.*)/);
    if (bulletMatch) { flushList('ul'); listItems.push(bulletMatch[1]); return; }

    flushList(listItems.length ? 'ul' : null);

    // Heading: "## " or "### "
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) { elements.push(<p key={i} className="font-bold text-[#3d1515] mt-2 mb-0.5">{parseInline(h2[1])}</p>); return; }

    // Empty line = spacing
    if (!line.trim()) { elements.push(<div key={i} className="h-1.5" />); return; }

    elements.push(<p key={i} className="leading-relaxed">{parseInline(line)}</p>);
  });

  flushList(listItems.length ? 'ul' : null);
  return <div className="space-y-0.5">{elements}</div>;
};

// ── Trích tên người dùng từ lịch sử chat ─────────────────────────────────────
const extractUserName = (msgs) => {
  const patterns = [
    /(?:tên\s+(?:mình|tôi|em|con|anh|chị)\s+là|mình\s+tên|tôi\s+tên|em\s+tên|gọi\s+(?:mình|tôi|em)\s+(?:là|tên))\s+([A-ZÀ-Ỹa-zà-ỹ][a-zà-ỹ]{1,15})/i,
    /(?:tôi\s+là|mình\s+là|em\s+là|con\s+là)\s+([A-ZÀ-ỸA-ZÀ-Ỹ][a-zà-ỹ]{1,15})/i,
  ];
  for (const msg of msgs) {
    if (msg.role !== 'user') continue;
    const t = msg.parts[0]?.text || '';
    for (const re of patterns) {
      const m = t.match(re);
      if (m?.[1]) return m[1];
    }
  }
  return null;
};

// ── Typing effect hook ────────────────────────────────────────────────────────
// Reveals text progressively; speed adapts so total time ≈ 2–3s
const useTypingEffect = (fullText, enabled) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !fullText) { setDisplayed(fullText || ''); setDone(true); return; }
    setDisplayed('');
    setDone(false);

    const CHARS_PER_TICK = Math.max(3, Math.ceil(fullText.length / 80)); // ≈80 ticks → ~2.4s at 30ms
    const INTERVAL_MS    = 30;
    let pos = 0;

    const timer = setInterval(() => {
      pos = Math.min(pos + CHARS_PER_TICK, fullText.length);
      setDisplayed(fullText.slice(0, pos));
      if (pos >= fullText.length) { clearInterval(timer); setDone(true); }
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [fullText, enabled]);

  return { displayed, done };
};

// ── Typing indicator (dots while waiting for API) ─────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map(i => (
      <motion.span key={i}
        className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── Bubble đơn lẻ (tách ra để dùng typing effect) ────────────────────────────
const BotBubble = ({ msg }) => {
  const { displayed, done } = useTypingEffect(
    msg.parts[0]?.text,
    msg.isNew === true,
  );

  const text = msg.isNew ? displayed : (msg.parts[0]?.text || '');

  return (
    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] rounded-tl-sm shadow-sm ${
      msg.isError
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-white border border-[#e5d5b5] text-gray-700'
    }`}>
      {renderMarkdown(text)}
      {msg.isNew && !done && (
        <span className="inline-block w-0.5 h-3.5 bg-[#8B0000] ml-0.5 animate-pulse align-middle" />
      )}
    </div>
  );
};

// ── Avatar huynh ảo ───────────────────────────────────────────────────────────
const BotAvatar = ({ typing = false, large = false }) => (
  <div
    className={`${large ? 'w-11 h-11' : 'w-8 h-8'} rounded-full bg-white p-0 flex items-center justify-center shrink-0 shadow-md ring-1 ring-[#D4AF37]/45 select-none overflow-hidden ${
      typing ? 'animate-pulse ring-4 ring-[#D4AF37]/25' : ''
    }`}
  >
    <img
      src={BOT_LOGO_SRC}
      alt="Logo Xứ Đoàn"
      className="w-full h-full rounded-full object-cover object-center"
      draggable="false"
    />
  </div>
);

// ── Confirm xoá ──────────────────────────────────────────────────────────────
const ConfirmDelete = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -4 }}
    className="absolute right-0 top-10 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-52"
  >
    <p className="text-xs text-gray-600 mb-2.5 leading-snug">Xoá toàn bộ lịch sử chat?</p>
    <div className="flex gap-2">
      <button onClick={onConfirm}
        className="flex-1 text-[11px] font-semibold bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 transition">
        Xoá
      </button>
      <button onClick={onCancel}
        className="flex-1 text-[11px] font-semibold bg-gray-100 text-gray-600 rounded-lg py-1.5 hover:bg-gray-200 transition">
        Huỷ
      </button>
    </div>
  </motion.div>
);

// ── Minimized pill ───────────────────────────────────────────────────────────
const MinimizedPill = ({ userName, hasNew, onExpand }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="fixed bottom-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-lg cursor-pointer select-none"
    style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }}
    onClick={onExpand}
  >
    <BotAvatar />
    <div className="min-w-0">
      <p className="text-white font-bold text-[12px] leading-tight">
        Trợ lý Xứ Đoàn {userName ? `· ${userName}` : ''}
      </p>
      {hasNew && <p className="text-white/70 text-[10px]">Có tin nhắn mới 💬</p>}
    </div>
    <ChevronDown size={14} className="text-white/60 rotate-180" />
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ChatWidget() {
  const { user } = useAuth();
  const [open,       setOpen]       = useState(false);
  const [minimized,  setMinimized]  = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [hasNew,     setHasNew]     = useState(false);
  const [greeted,    setGreeted]    = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [listening,  setListening]  = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const [attachedFile,    setAttachedFile]    = useState(null); // File object
  const [attachedPreview, setAttachedPreview] = useState(null); // DataURL for images

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceBaseRef = useRef('');
  const greetingText = useMemo(() => buildGreeting(user), [user]);

  // Tên người dùng được trích từ lịch sử chat
  const userName = useMemo(() => extractUserName(messages), [messages]);

  // Lần đầu mở → hiện lời chào
  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      setMessages([{ role: 'model', parts: [{ text: greetingText }] }]);
    }
    if (open && !minimized) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [open, greeted, minimized, greetingText]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      setInput(`${voiceBaseRef.current}${voiceBaseRef.current && transcript ? ' ' : ''}${transcript}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
    };
  }, []);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, minimized]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setInput('');
    setLoading(true);
    setShowDelete(false);

    const fileToSend = attachedFile;
    const previewToSend = attachedPreview;
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const displayText = fileToSend
      ? `${userText ? userText + '\n' : ''}📎 ${fileToSend.name}`
      : userText;

    const userMsg = { role: 'user', parts: [{ text: userText || `[Tệp đính kèm: ${fileToSend?.name}]` }], displayText, filePreview: previewToSend, fileName: fileToSend?.name };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = buildApiHistory(messages, userText || `[Tệp đính kèm: ${fileToSend?.name}]`);

      let res;
      if (fileToSend) {
        const fd = new FormData();
        fd.append('messages', JSON.stringify(history));
        fd.append('file', fileToSend);
        res = await api.post('/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/chat', { messages: history });
      }

      if (res.data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'model', parts: [{ text: res.data.text }], isNew: true },
        ]);
        if (!open || minimized) setHasNew(true);
      } else {
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: normalizeAssistantName(res.data.message || 'Trợ lý Xứ Đoàn đang gặp sự cố. Thử lại nhé! 🙏') }],
          isError: true,
        }]);
      }
    } catch (err) {
      const msg = normalizeAssistantName(err.response?.data?.message || 'Không kết nối được. Vui lòng thử lại sau! 🙏');
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: msg }], isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open, minimized, attachedFile, attachedPreview]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { setShowDelete(false); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Tệp quá lớn! Tối đa ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachedPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAttachedPreview(null);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearHistory = () => {
    setMessages([{ role: 'model', parts: [{ text: greetingText }] }]);
    setShowDelete(false);
    setInput('');
    removeFile();
  };

  const startVoiceInput = () => {
    if (!voiceSupported || loading || !recognitionRef.current) return;
    voiceBaseRef.current = input.trim();
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  const isEmpty = messages.length <= 1;

  // ── Minimized pill ── (chỉ hiện header nhỏ)
  return (
    <>
      {/* ── Minimized pill ── */}
      <AnimatePresence>
        {open && minimized && (
          <MinimizedPill
            userName={userName}
            hasNew={hasNew}
            onExpand={() => setMinimized(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            className="fixed top-24 bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-[#e5d5b5]"
            style={{ background: '#fdfbf7' }}
            initial={{ opacity: 0, scale: 0.88, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* ── Header ── */}
            <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-[#e5d5b5] shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }}>
              <BotAvatar large />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">
                  Trợ lý Xứ Đoàn {userName ? <span className="font-normal opacity-75">· {userName}</span> : ''}
                </p>
                <p className="text-white/55 text-[10px]">Trợ lý Xứ Đoàn Anrê Phú Yên</p>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Xoá lịch sử */}
                <button
                  onClick={() => setShowDelete(s => !s)}
                  title="Xoá lịch sử chat"
                  className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition"
                >
                  <Trash2 size={14} />
                </button>

                {/* Thu nhỏ */}
                <button
                  onClick={() => setMinimized(true)}
                  title="Thu nhỏ"
                  className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition"
                >
                  <Minus size={14} />
                </button>

                {/* Đóng */}
                <button
                  onClick={() => setOpen(false)}
                  title="Đóng"
                  className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Confirm xoá dropdown */}
              <AnimatePresence>
                {showDelete && (
                  <ConfirmDelete
                    onConfirm={clearHistory}
                    onCancel={() => setShowDelete(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth"
              style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}
              onClick={() => setShowDelete(false)}
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && <BotAvatar />}
                  {msg.role === 'user' ? (
                    <div className="max-w-[82%] flex flex-col gap-1.5 items-end">
                      {/* File thumbnail hoặc badge */}
                      {msg.filePreview && (
                        <img src={msg.filePreview} alt="Ảnh đính kèm"
                          className="max-w-45 rounded-xl border border-white/20 shadow-sm object-cover" />
                      )}
                      {msg.fileName && !msg.filePreview && (
                        <div className="flex items-center gap-1.5 bg-[#6e1a1a] rounded-xl px-2.5 py-1.5 text-white text-[11px]">
                          <span>{fileIcon(attachedFile?.type)}</span>
                          <span className="max-w-35 truncate font-medium">{msg.fileName}</span>
                        </div>
                      )}
                      {msg.parts[0]?.text && msg.parts[0].text !== `[Tệp đính kèm: ${msg.fileName}]` && (
                        <div className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed bg-[#8B0000] text-white rounded-tr-sm">
                          {msg.parts[0].text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <BotBubble msg={msg} />
                  )}
                </div>
              ))}

              {/* Waiting dots while API call in progress */}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <BotAvatar typing />
                  <div className="bg-white border border-[#e5d5b5] text-[#8B0000] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick actions ── */}
            <AnimatePresence>
              {isEmpty && !loading && (
                <motion.div
                  className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {QUICK_ACTIONS.map((qa, i) => (
                    <button key={i} onClick={() => sendMessage(qa.text)}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-[#e5d5b5] bg-white text-gray-600 hover:border-[#D4AF37] hover:text-[#8B0000] hover:bg-amber-50/50 transition-all">
                      <span>{qa.icon}</span>{qa.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input ── */}
            <div className="px-3 pb-3 pt-2 shrink-0 border-t border-[#e5d5b5]" style={{ background: '#fffcf9' }}>

              {/* File preview strip */}
              <AnimatePresence>
                {attachedFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-2">
                      {/* Image thumbnail or file icon */}
                      {attachedPreview ? (
                        <img src={attachedPreview} alt="preview"
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-amber-200" />
                      ) : (
                        <span className="text-xl leading-none shrink-0">{fileIcon(attachedFile.type)}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#5a1a1a] truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-gray-400">{fmtSize(attachedFile.size)}</p>
                      </div>
                      <button onClick={removeFile}
                        className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                        <X size={13} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input row */}
              <div className="flex gap-1.5 items-end">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {/* Paperclip button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  title="Đính kèm tệp (PDF, Word, TXT, ảnh)"
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                    attachedFile
                      ? 'bg-amber-50 border-amber-300 text-[#8B0000]'
                      : 'bg-white border-[#e5d5b5] text-gray-400 hover:text-[#8B0000] hover:border-[#D4AF37]'
                  } disabled:opacity-40`}
                >
                  <Paperclip size={15} />
                </button>

                <button
                  type="button"
                  onPointerDown={startVoiceInput}
                  onPointerUp={stopVoiceInput}
                  onPointerCancel={stopVoiceInput}
                  onPointerLeave={listening ? stopVoiceInput : undefined}
                  disabled={loading || !voiceSupported}
                  title={voiceSupported ? 'Nhấn giữ để nói' : 'Trình duyệt chưa hỗ trợ nhập giọng nói'}
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                    listening
                      ? 'bg-red-50 border-[#8B0000] text-[#8B0000] ring-4 ring-red-100'
                      : 'bg-white border-[#e5d5b5] text-gray-400 hover:text-[#8B0000] hover:border-[#D4AF37]'
                  } disabled:opacity-40`}
                  aria-label="Nhấn giữ để nhập bằng giọng nói"
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedFile ? 'Thêm hướng dẫn cho Trợ lý Xứ Đoàn...' : 'Nhắn tin cho Trợ lý Xứ Đoàn...'}
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none text-sm bg-white border border-[#e5d5b5] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition placeholder:text-gray-300 text-gray-700 disabled:opacity-60 max-h-28 overflow-y-auto"
                  style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && !attachedFile) || loading}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }}
                >
                  <Send size={15} />
                </button>
              </div>

              <p className="text-[9px] text-gray-300 text-center mt-1.5">
                Trợ lý Xứ Đoàn có thể mắc lỗi · Vấn đề quan trọng, hãy hỏi Cha sở hoặc Huynh trưởng
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating bubble ── */}
      <div className="fixed bottom-24 right-4 sm:bottom-5 sm:right-6 z-50">
        <motion.button
          onClick={() => {
            if (minimized) { setMinimized(false); setOpen(true); }
            else setOpen(o => !o);
          }}
          className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
            open && !minimized
              ? 'text-white'
              : 'bg-white text-[#8B0000] ring-1 ring-[#D4AF37]/45'
          }`}
          style={{ background: (open && !minimized) ? 'linear-gradient(135deg, #5a1010, #3d0808)' : undefined }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label={open && !minimized ? 'Đóng chat' : 'Mở Trợ lý Xứ Đoàn'}
        >
          <AnimatePresence mode="wait">
            {(open && !minimized) ? (
              <motion.span key="close"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="open"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
                className="w-12 h-12 rounded-full bg-white overflow-hidden shadow-sm ring-1 ring-[#D4AF37]/45"
              >
                <img
                  src={BOT_LOGO_SRC}
                  alt="Mở Trợ lý Xứ Đoàn"
                  className="w-full h-full rounded-full object-cover object-center"
                  draggable="false"
                />
              </motion.span>
            )}
          </AnimatePresence>

          {!greeted && !open && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: '#8B0000' }} />
          )}
          {(hasNew && (!open || minimized)) && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-[8px] font-black text-white flex items-center justify-center">
              !
            </span>
          )}
        </motion.button>

        {!open && !greeted && (
          <motion.div
            className="absolute bottom-16 right-0 bg-white border border-[#e5d5b5] rounded-xl px-3 py-2 shadow-md whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.3 }}
          >
            <p className="text-[11px] font-semibold text-[#3d1515]">Trợ lý Xứ Đoàn có thể giúp gì?</p>
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-r border-b border-[#e5d5b5] rotate-45" />
          </motion.div>
        )}
      </div>
    </>
  );
}
