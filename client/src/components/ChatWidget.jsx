import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Trash2, ChevronDown, Minus, Paperclip, Mic, MicOff,
  Copy, Check, ArrowDown, Plus, MessageSquare, ChevronLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';
const MAX_SIZE_MB    = 5;
const BOT_LOGO_SRC   = '/logos/logos doan thieu nhi MT.jpg';
const STREAM_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '') + '/api/chat/stream';

// ── Time formatter ────────────────────────────────────────────────────────────
const fmtRelative = (date) => {
  const diffH = (Date.now() - new Date(date)) / 36e5;
  if (diffH < 1)  return 'Vừa xong';
  if (diffH < 24) return `${Math.floor(diffH)} giờ trước`;
  if (diffH < 48) return 'Hôm qua';
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// ── Bible verse intent ────────────────────────────────────────────────────────
const BIBLE_VERSE_RE = /^((?:\d\s*)?[A-ZÀ-Ỹa-zà-ỹ]{1,4})\s+(\d{1,3})(?:[,;](\d{1,3}(?:-\d{1,3})?))?\.?\s*$/;
const expandBibleIntent = (text) => {
  const m = text.trim().match(BIBLE_VERSE_RE);
  if (!m) return text;
  const ref = `${m[1]} ${m[2]}${m[3] ? `,${m[3]}` : ''}`;
  return `Giải thích câu Kinh Thánh ${ref} cho em hiểu: bối cảnh, ý nghĩa và áp dụng vào cuộc sống.`;
};

// ── Suggestion parser ─────────────────────────────────────────────────────────
const SUGGESTION_RE = /\[GỢI Ý:\s*"([^"]+)"\s*(?:\|\s*"([^"]+)")?\s*(?:\|\s*"([^"]+)")?\s*\]\s*$/;
const parseSuggestions = (text = '') => {
  const m = text.match(SUGGESTION_RE);
  if (!m) return { text, suggestions: [] };
  return { text: text.slice(0, m.index).trimEnd(), suggestions: [m[1], m[2], m[3]].filter(Boolean) };
};

// ── Message helpers ───────────────────────────────────────────────────────────
const toApiMessage = (msg) => ({
  role: msg.role,
  parts: [{ text: String(msg.parts?.[0]?.text || '').trim() }],
});

const normalizeAssistantName = (text = '') =>
  String(text).replace(/Huynh\s*Ảo/gi, 'Trợ lý Xứ Đoàn');

const buildApiHistory = (messages, userText) => {
  const clean = messages
    .filter((msg, i) => i > 0 && !msg.isError)
    .map(toApiMessage)
    .filter((m) => (m.role === 'user' || m.role === 'model') && m.parts[0].text);

  const turns = [];
  for (let i = 0; i < clean.length - 1; i++) {
    if (clean[i].role === 'user' && clean[i + 1].role === 'model') {
      turns.push(clean[i], clean[i + 1]); i++;
    }
  }
  return [...turns, { role: 'user', parts: [{ text: userText }] }];
};

const serializeMessages = (messages) =>
  messages.filter(m => m.role === 'user' || m.role === 'model').map(m => ({
    id: m.id, role: m.role,
    text: m.parts?.[0]?.text || '',
    fileName: m.fileName || null,
    suggestions: m.suggestions || [],
    isError: !!m.isError,
    ts: m.ts || new Date().toISOString(),
  }));

const deserializeMessages = (raw = []) =>
  raw.map(m => ({
    id: m.id || Date.now() + Math.random(),
    role: m.role,
    parts: [{ text: m.text || '' }],
    fileName: m.fileName || null,
    suggestions: m.suggestions || [],
    isError: !!m.isError,
    ts: m.ts,
  }));

const fileIcon = (type) => {
  if (type?.startsWith('image/'))    return '🖼️';
  if (type === 'application/pdf')    return '📄';
  if (type?.includes('wordprocess')) return '📝';
  return '📃';
};
const fmtSize = (b) => b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

// ── Greeting ──────────────────────────────────────────────────────────────────
const GREETING = `Chào các em! 👋 Anh là **Trợ lý Xứ Đoàn** của Xứ Đoàn Anrê Phú Yên 🕊️

Anh có thể giúp các em về:
- 📖 Giải thích Kinh Thánh (Cựu Ước & Tân Ước)
- ✝️ Giáo lý, Bí tích, đời sống đức tin
- 🏫 Sinh hoạt, lịch lễ, sự kiện xứ đoàn
- 🙏 Giải đáp thắc mắc đức tin

Các em cứ thoải mái hỏi nhé! 😊`;

const firstName = (name = '') => name.trim().split(/\s+/).slice(-1)[0] || '';
const buildGreeting = (user) => {
  if (!user) return GREETING;
  const name = firstName(user.hoTen);
  return `Chào ${name || user.hoTen || 'anh/chị'}! 👋\n\nAnh là **Trợ lý Xứ Đoàn** của Xứ Đoàn Anrê Phú Yên.\n\nAnh có thể giải thích Kinh Thánh, giải đáp giáo lý, tra lịch sinh hoạt và hỗ trợ nhiều hơn!`;
};

// ── Quick actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '📖', label: 'Lời Chúa',   text: 'Lời Chúa hôm nay là gì? Cho em nghe một đoạn Kinh Thánh ý nghĩa.' },
  { icon: '🕐', label: 'Giờ lễ',     text: 'Cho anh/chị hỏi giờ lễ hôm nay là mấy giờ?' },
  { icon: '✝️', label: 'Kinh Thánh', text: 'Giải thích câu Kinh Thánh Ga 3,16 cho em hiểu với?' },
  { icon: '📅', label: 'Sự kiện',    text: 'Xứ đoàn mình có sự kiện gì sắp tới không?' },
];

// ── Markdown renderer ─────────────────────────────────────────────────────────
const parseInline = (text) => {
  if (!text) return null;
  const result = []; let rest = text; let key = 0;
  const PATTERNS = [
    { re: /\*\*(.*?)\*\*/, El: 'strong' },
    { re: /\*(.*?)\*/,     El: 'em' },
    { re: /_(.*?)_/,       El: 'em' },
    { re: /`([^`]+)`/,     El: 'code' },
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
    const { El } = earliest.p; const inner = earliest.match[1];
    if (El === 'code') result.push(<code key={key++} className="bg-gray-100 px-1 py-0.5 rounded text-[11.5px] font-mono text-[#8B0000]">{inner}</code>);
    else if (El === 'strong') result.push(<strong key={key++} className="font-bold">{inner}</strong>);
    else result.push(<em key={key++} className="italic">{inner}</em>);
    rest = rest.slice(earliest.index + earliest.match[0].length);
  }
  return result;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n'); const elements = []; let listItems = []; let listType = null;
  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(<Tag key={`l-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-4 my-1 space-y-0.5`}>{listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}</Tag>);
    listItems = []; listType = null;
  };
  lines.forEach((line, i) => {
    const numM = line.match(/^(\d+)\.\s+(.*)/);
    const bulM = line.match(/^[-•]\s+(.*)/);
    if (numM) { if (listType !== 'ol') { flushList(); listType = 'ol'; } listItems.push(numM[2]); return; }
    if (bulM) { if (listType !== 'ul') { flushList(); listType = 'ul'; } listItems.push(bulM[1]); return; }
    flushList();
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) { elements.push(<p key={i} className="font-bold text-[#3d1515] mt-2 mb-0.5">{parseInline(h2[1])}</p>); return; }
    if (!line.trim()) { elements.push(<div key={i} className="h-1.5" />); return; }
    elements.push(<p key={i} className="leading-relaxed">{parseInline(line)}</p>);
  });
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
};

// ── Extract user name from messages ───────────────────────────────────────────
const extractUserName = (msgs) => {
  const patterns = [
    /(?:tên\s+(?:mình|tôi|em|con|anh|chị)\s+là|mình\s+tên|em\s+tên)\s+([A-ZÀ-Ỹa-zà-ỹ][a-zà-ỹ]{1,15})/i,
    /(?:tôi\s+là|mình\s+là|em\s+là)\s+([A-ZÀ-ỸA-ZÀ-Ỹ][a-zà-ỹ]{1,15})/i,
  ];
  for (const msg of msgs) {
    if (msg.role !== 'user') continue;
    const t = msg.parts[0]?.text || '';
    for (const re of patterns) { const m = t.match(re); if (m?.[1]) return m[1]; }
  }
  return null;
};

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <button onClick={copy} title={copied ? 'Đã sao chép' : 'Sao chép'}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
};

// ── Typing dots ───────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map(i => (
      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
    ))}
  </div>
);

// ── Bot bubble ────────────────────────────────────────────────────────────────
const BotBubble = ({ msg, onSuggestionClick }) => {
  const text = msg.parts[0]?.text || '';
  const { isStreaming, suggestions = [] } = msg;
  return (
    <div className="flex flex-col gap-1.5 max-w-[85%]">
      <div className={`group relative rounded-2xl px-3.5 py-2.5 text-[13px] rounded-tl-sm shadow-sm ${msg.isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-[#e5d5b5] text-gray-700'}`}>
        {isStreaming && !text ? <TypingDots /> : (
          <>
            {renderMarkdown(text)}
            {isStreaming && <span className="inline-block w-0.5 h-3.5 bg-[#8B0000] ml-0.5 animate-pulse align-middle" />}
          </>
        )}
        {!isStreaming && !msg.isError && text && (
          <div className="absolute -bottom-3 right-1"><CopyButton text={text} /></div>
        )}
      </div>
      {suggestions.length > 0 && !isStreaming && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-[#D4AF37]/60 bg-amber-50/70 text-[#5a1a1a] hover:bg-amber-100 hover:border-[#D4AF37] transition-all leading-tight text-left">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Bot avatar ────────────────────────────────────────────────────────────────
const BotAvatar = ({ typing = false, large = false }) => (
  <div className={`${large ? 'w-11 h-11' : 'w-8 h-8'} rounded-full bg-white flex items-center justify-center shrink-0 shadow-md ring-1 ring-[#D4AF37]/45 select-none overflow-hidden ${typing ? 'animate-pulse' : ''}`}>
    <img src={BOT_LOGO_SRC} alt="Logo" className="w-full h-full rounded-full object-cover" draggable="false" />
  </div>
);

// ── Conversations panel ───────────────────────────────────────────────────────
const ConversationsPanel = ({ conversations, activeConvId, onSelect, onNew, onDelete, loading }) => (
  <div className="flex-1 overflow-y-auto px-2 py-2" style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}>
    <button onClick={onNew}
      className="w-full flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl border border-dashed border-[#D4AF37]/70 text-[12px] font-semibold text-[#8B0000] hover:bg-amber-50 transition">
      <Plus size={14} /> Cuộc trò chuyện mới
    </button>

    {loading ? (
      <div className="flex justify-center py-8 text-[#8B0000]"><TypingDots /></div>
    ) : conversations.length === 0 ? (
      <p className="text-center text-[11px] text-gray-400 py-8">Chưa có cuộc trò chuyện nào</p>
    ) : conversations.map(conv => (
      <div key={conv._id}
        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl mb-1 cursor-pointer transition-all ${conv._id === activeConvId ? 'bg-amber-50 border border-[#D4AF37]/40' : 'hover:bg-gray-50 border border-transparent'}`}
        onClick={() => onSelect(conv._id)}>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-gray-700 truncate">{conv.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fmtRelative(conv.updatedAt)}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(conv._id); }}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition">
          <Trash2 size={12} />
        </button>
      </div>
    ))}
  </div>
);

// ── Minimized pill ────────────────────────────────────────────────────────────
const MinimizedPill = ({ userName, hasNew, onExpand }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
    className="fixed bottom-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-lg cursor-pointer select-none"
    style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }} onClick={onExpand}>
    <BotAvatar />
    <div className="min-w-0">
      <p className="text-white font-bold text-[12px] leading-tight">Trợ lý Xứ Đoàn {userName ? `· ${userName}` : ''}</p>
      {hasNew && <p className="text-white/70 text-[10px]">Có tin nhắn mới 💬</p>}
    </div>
    <ChevronDown size={14} className="text-white/60 rotate-180" />
  </motion.div>
);

// ── Confirm delete ────────────────────────────────────────────────────────────
const ConfirmDelete = ({ onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
    className="absolute right-0 top-10 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-52">
    <p className="text-xs text-gray-600 mb-2.5 leading-snug">Xoá cuộc trò chuyện này?</p>
    <div className="flex gap-2">
      <button onClick={onConfirm} className="flex-1 text-[11px] font-semibold bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 transition">Xoá</button>
      <button onClick={onCancel}  className="flex-1 text-[11px] font-semibold bg-gray-100 text-gray-600 rounded-lg py-1.5 hover:bg-gray-200 transition">Huỷ</button>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ChatWidget() {
  const { user } = useAuth();

  const [open,        setOpen]        = useState(false);
  const [minimized,   setMinimized]   = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [streaming,   setStreaming]   = useState(false);
  const [hasNew,      setHasNew]      = useState(false);
  const [showConvPanel, setShowConvPanel] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvId,  setActiveConvId]  = useState(null);
  const [convLoading,   setConvLoading]   = useState(false);
  const [showDeleteConv, setShowDeleteConv] = useState(false);
  const [listening,     setListening]     = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showScrollBtn, setShowScrollBtn]  = useState(false);
  const [attachedFile,    setAttachedFile]    = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const fileInputRef   = useRef(null);
  const recognitionRef = useRef(null);
  const voiceBaseRef   = useRef('');
  const messagesRef    = useRef(null);
  const abortRef       = useRef(null);
  const initialized    = useRef(false);

  const greetingText = useMemo(() => buildGreeting(user), [user]);
  const userName     = useMemo(() => extractUserName(messages), [messages]);

  const makeGreeting = useCallback(() =>
    [{ id: 0, role: 'model', parts: [{ text: greetingText }] }],
  [greetingText]);

  // ── Load conversation ───────────────────────────────────────────────────────
  const loadConv = useCallback(async (id) => {
    setActiveConvId(id);
    setShowConvPanel(false);
    try {
      const res = await api.get(`/chat/conversations/${id}`);
      const msgs = deserializeMessages(res.data.messages);
      setMessages(msgs.length > 0 ? msgs : makeGreeting());
    } catch {
      setMessages(makeGreeting());
    }
  }, [makeGreeting]);

  // ── Create new conversation ─────────────────────────────────────────────────
  const handleNewConversation = useCallback(async () => {
    setShowConvPanel(false);
    try {
      const res = await api.post('/chat/conversations');
      const conv = res.data.conversation;
      setActiveConvId(conv._id);
      setConversations(prev => [conv, ...prev]);
      setMessages(makeGreeting());
    } catch {
      setMessages(makeGreeting());
    }
  }, [makeGreeting]);

  // ── Init on open ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) { initialized.current = false; return; }
    if (initialized.current) {
      if (!minimized) { setHasNew(false); setTimeout(() => inputRef.current?.focus(), 180); }
      return;
    }
    initialized.current = true;
    setHasNew(false);
    setConvLoading(true);

    api.get('/chat/conversations')
      .then(async (res) => {
        const convs = res.data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) {
          await loadConv(convs[0]._id);
        } else {
          await handleNewConversation();
        }
      })
      .catch(() => {
        setMessages(makeGreeting());
      })
      .finally(() => {
        setConvLoading(false);
        setTimeout(() => inputRef.current?.focus(), 180);
      });
  }, [open, minimized, loadConv, handleNewConversation, makeGreeting]);

  // ── Save conversation after exchange ───────────────────────────────────────
  const saveConv = useCallback((msgs) => {
    if (!activeConvId) return;
    api.post(`/chat/conversations/${activeConvId}/save`, { messages: serializeMessages(msgs) })
      .then(res => {
        const title = res.data.title;
        if (title) {
          setConversations(prev =>
            prev.map(c => c._id === activeConvId ? { ...c, title, updatedAt: new Date().toISOString() } : c)
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          );
        }
      })
      .catch(() => {});
  }, [activeConvId]);

  // ── Delete conversation ─────────────────────────────────────────────────────
  const handleDeleteConv = useCallback(async (id) => {
    try {
      await api.delete(`/chat/conversations/${id}`);
      const remaining = conversations.filter(c => c._id !== id);
      setConversations(remaining);
      if (id === activeConvId) {
        if (remaining.length > 0) {
          await loadConv(remaining[0]._id);
        } else {
          await handleNewConversation();
        }
      }
    } catch { /* ignore */ }
  }, [conversations, activeConvId, loadConv, handleNewConversation]);

  // ── Voice recognition ───────────────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }
    const r = new SR(); r.lang = 'vi-VN'; r.interimResults = true; r.continuous = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0]?.transcript || '').join(' ').trim();
      setInput(`${voiceBaseRef.current}${voiceBaseRef.current && t ? ' ' : ''}${t}`);
    };
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    recognitionRef.current = r;
    return () => { recognitionRef.current?.abort?.(); recognitionRef.current = null; };
  }, []);

  // ── Auto scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!minimized && !showScrollBtn) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, minimized, showScrollBtn]);

  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const userText = expandBibleIntent((text ?? input).trim());
    if ((!userText && !attachedFile) || loading || streaming) return;

    setInput(''); setLoading(true);

    const fileToSend = attachedFile; const previewToSend = attachedPreview;
    setAttachedFile(null); setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMsg = {
      id: Date.now(), role: 'user',
      parts: [{ text: userText || `[Tệp đính kèm: ${fileToSend?.name}]` }],
      displayText: fileToSend ? `${userText ? userText + '\n' : ''}📎 ${fileToSend.name}` : userText,
      filePreview: previewToSend, fileName: fileToSend?.name,
    };
    setMessages(prev => [...prev, userMsg]);
    const history = buildApiHistory(messages, userText || `[Tệp đính kèm: ${fileToSend?.name}]`);

    try {
      // File upload — non-streaming
      if (fileToSend) {
        const fd = new FormData();
        fd.append('messages', JSON.stringify(history));
        fd.append('file', fileToSend);
        const res = await api.post('/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) {
          const { text: cleanText, suggestions } = parseSuggestions(res.data.text || '');
          const botMsg = { id: Date.now(), role: 'model', parts: [{ text: cleanText }], suggestions };
          setMessages(prev => { const next = [...prev, botMsg]; saveConv(next); return next; });
        } else {
          setMessages(prev => [...prev, { id: Date.now(), role: 'model', parts: [{ text: normalizeAssistantName(res.data.message || 'Trợ lý Xứ Đoàn đang gặp sự cố. Thử lại nhé! 🙏') }], isError: true }]);
        }
        return;
      }

      // Streaming
      const msgId = Date.now() + 1;
      setMessages(prev => [...prev, { id: msgId, role: 'model', parts: [{ text: '' }], isStreaming: true }]);
      setLoading(false); setStreaming(true);

      const token = localStorage.getItem('token');
      abortRef.current = new AbortController();
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (response.status === 401) throw new Error('AUTH_REQUIRED');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader(); const decoder = new TextDecoder();
      let fullText = ''; let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              fullText += parsed.text;
              setMessages(prev => prev.map(m => m.id === msgId ? { ...m, parts: [{ text: fullText }] } : m));
            }
          } catch (pe) { if (pe.message && !pe.message.includes('JSON')) throw pe; }
        }
      }

      const { text: cleanText, suggestions } = parseSuggestions(fullText);
      setMessages(prev => {
        const next = prev.map(m => m.id === msgId ? { ...m, parts: [{ text: cleanText }], isStreaming: false, suggestions } : m);
        saveConv(next);
        return next;
      });
      if (!open || minimized) setHasNew(true);
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
        return;
      }
      const msg = err.message === 'AUTH_REQUIRED'
        ? 'Vui lòng **đăng nhập** để dùng Trợ lý Xứ Đoàn nhé! 🙏'
        : normalizeAssistantName(err.response?.data?.message || err.message || 'Không kết nối được. Vui lòng thử lại sau! 🙏');
      setMessages(prev => {
        const hasPlaceholder = prev.some(m => m.isStreaming);
        if (hasPlaceholder) return prev.map(m => m.isStreaming ? { ...m, parts: [{ text: msg }], isStreaming: false, isError: true } : m);
        return [...prev, { id: Date.now(), role: 'model', parts: [{ text: msg }], isError: true }];
      });
    } finally {
      setLoading(false); setStreaming(false); abortRef.current = null;
    }
  }, [input, loading, streaming, messages, open, minimized, attachedFile, attachedPreview, saveConv]);

  const cancelStream = () => abortRef.current?.abort();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') setShowDeleteConv(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { alert(`Tệp quá lớn! Tối đa ${MAX_SIZE_MB}MB.`); e.target.value = ''; return; }
    setAttachedFile(file);
    if (file.type.startsWith('image/')) { const r = new FileReader(); r.onload = (ev) => setAttachedPreview(ev.target.result); r.readAsDataURL(file); }
    else setAttachedPreview(null);
  };

  const removeFile = () => { setAttachedFile(null); setAttachedPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const startVoice = () => {
    if (!voiceSupported || loading || streaming || !recognitionRef.current) return;
    voiceBaseRef.current = input.trim();
    try { recognitionRef.current.start(); setListening(true); } catch { setListening(false); }
  };
  const stopVoice = () => { recognitionRef.current?.stop?.(); setListening(false); };

  const isEmpty = messages.length <= 1;

  return (
    <>
      {/* Minimized pill */}
      <AnimatePresence>
        {open && minimized && <MinimizedPill userName={userName} hasNew={hasNew} onExpand={() => setMinimized(false)} />}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            className="fixed top-24 bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-[#e5d5b5]"
            style={{ background: '#fdfbf7' }}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-[#e5d5b5] shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }}>

              {showConvPanel ? (
                <>
                  <button onClick={() => setShowConvPanel(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
                    <ChevronLeft size={16} />
                  </button>
                  <p className="flex-1 text-white font-bold text-sm">Cuộc trò chuyện</p>
                </>
              ) : (
                <>
                  <BotAvatar large />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight">
                      Trợ lý Xứ Đoàn {userName ? <span className="font-normal opacity-75">· {userName}</span> : ''}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${streaming ? 'bg-yellow-300 animate-pulse' : 'bg-green-400'}`} />
                      <p className="text-white/60 text-[10px]">{streaming ? 'Đang trả lời...' : 'Trực tuyến'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-0.5">
                {!showConvPanel && (
                  <button onClick={() => setShowConvPanel(true)} title="Danh sách cuộc trò chuyện"
                    className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition">
                    <MessageSquare size={14} />
                  </button>
                )}
                {!showConvPanel && (
                  <button onClick={() => setShowDeleteConv(s => !s)} title="Xoá cuộc trò chuyện này"
                    className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={() => setMinimized(true)} title="Thu nhỏ"
                  className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition">
                  <Minus size={14} />
                </button>
                <button onClick={() => { setOpen(false); setShowConvPanel(false); }} title="Đóng"
                  className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition">
                  <X size={15} />
                </button>
              </div>

              <AnimatePresence>
                {showDeleteConv && (
                  <ConfirmDelete
                    onConfirm={async () => { setShowDeleteConv(false); if (activeConvId) await handleDeleteConv(activeConvId); }}
                    onCancel={() => setShowDeleteConv(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Body — conversations panel OR messages */}
            <AnimatePresence mode="wait">
              {showConvPanel ? (
                <motion.div key="conv-panel" className="flex flex-col flex-1 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}>
                  <ConversationsPanel
                    conversations={conversations}
                    activeConvId={activeConvId}
                    loading={convLoading}
                    onSelect={loadConv}
                    onNew={handleNewConversation}
                    onDelete={handleDeleteConv}
                  />
                </motion.div>
              ) : (
                <motion.div key="messages" className="flex flex-col flex-1 overflow-hidden"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}>

                  {/* Messages */}
                  <div ref={messagesRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth"
                    style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}
                    onClick={() => setShowDeleteConv(false)}
                    onScroll={handleScroll}>

                    {convLoading ? (
                      <div className="flex justify-center items-center h-full text-[#8B0000]"><TypingDots /></div>
                    ) : messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <BotAvatar />}
                        {msg.role === 'user' ? (
                          <div className="max-w-[82%] flex flex-col gap-1.5 items-end">
                            {msg.filePreview && <img src={msg.filePreview} alt="Ảnh đính kèm" className="max-w-45 rounded-xl border border-white/20 shadow-sm object-cover" />}
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
                          <BotBubble msg={msg} onSuggestionClick={(s) => sendMessage(s)} />
                        )}
                      </div>
                    ))}

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

                  {/* Scroll to bottom */}
                  <AnimatePresence>
                    {showScrollBtn && (
                      <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        onClick={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowScrollBtn(false); }}
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#e5d5b5] shadow-md text-[11px] text-gray-500 hover:text-[#8B0000] hover:border-[#D4AF37] transition-all">
                        <ArrowDown size={12} /> Xuống dưới
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Quick actions */}
                  <AnimatePresence>
                    {isEmpty && !loading && !streaming && !convLoading && (
                      <motion.div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        {QUICK_ACTIONS.map((qa, i) => (
                          <button key={i} onClick={() => sendMessage(qa.text)}
                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-[#e5d5b5] bg-white text-gray-600 hover:border-[#D4AF37] hover:text-[#8B0000] hover:bg-amber-50/50 transition-all">
                            <span>{qa.icon}</span>{qa.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input */}
                  <div className="px-3 pb-3 pt-2 shrink-0 border-t border-[#e5d5b5]" style={{ background: '#fffcf9' }}>
                    <AnimatePresence>
                      {attachedFile && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 overflow-hidden">
                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-2">
                            {attachedPreview ? <img src={attachedPreview} alt="preview" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-amber-200" /> : <span className="text-xl leading-none shrink-0">{fileIcon(attachedFile.type)}</span>}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-[#5a1a1a] truncate">{attachedFile.name}</p>
                              <p className="text-[10px] text-gray-400">{fmtSize(attachedFile.size)}</p>
                            </div>
                            <button onClick={removeFile} className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><X size={13} /></button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-1.5 items-end">
                      <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={handleFileSelect} />
                      <button onClick={() => fileInputRef.current?.click()} disabled={loading || streaming}
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${attachedFile ? 'bg-amber-50 border-amber-300 text-[#8B0000]' : 'bg-white border-[#e5d5b5] text-gray-400 hover:text-[#8B0000] hover:border-[#D4AF37]'} disabled:opacity-40`}>
                        <Paperclip size={15} />
                      </button>
                      <button type="button" onPointerDown={startVoice} onPointerUp={stopVoice} onPointerCancel={stopVoice}
                        onPointerLeave={listening ? stopVoice : undefined}
                        disabled={loading || streaming || !voiceSupported}
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${listening ? 'bg-red-50 border-[#8B0000] text-[#8B0000] ring-4 ring-red-100' : 'bg-white border-[#e5d5b5] text-gray-400 hover:text-[#8B0000] hover:border-[#D4AF37]'} disabled:opacity-40`}>
                        {listening ? <MicOff size={15} /> : <Mic size={15} />}
                      </button>
                      <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder={attachedFile ? 'Thêm hướng dẫn...' : 'Nhắn tin cho Trợ lý Xứ Đoàn...'}
                        rows={1} disabled={loading}
                        className="flex-1 resize-none text-sm bg-white border border-[#e5d5b5] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition placeholder:text-gray-300 text-gray-700 disabled:opacity-60 max-h-28 overflow-y-auto"
                        style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}
                        onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px'; }} />
                      {streaming ? (
                        <button onClick={cancelStream} title="Dừng trả lời"
                          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                          <span className="w-3 h-3 rounded-sm bg-current" />
                        </button>
                      ) : (
                        <button onClick={() => sendMessage()} disabled={(!input.trim() && !attachedFile) || loading}
                          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
                          style={{ background: 'linear-gradient(135deg, #8B0000, #5a1010)' }}>
                          <Send size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-300 text-center mt-1.5">
                      Trợ lý Xứ Đoàn có thể mắc lỗi · Vấn đề quan trọng, hãy hỏi Cha sở hoặc Huynh trưởng
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <div className="fixed bottom-24 right-4 sm:bottom-5 sm:right-6 z-50">
        <motion.button
          onClick={() => { if (minimized) { setMinimized(false); setOpen(true); } else setOpen(o => !o); }}
          className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${open && !minimized ? 'text-white' : 'bg-white text-[#8B0000] ring-1 ring-[#D4AF37]/45'}`}
          style={{ background: (open && !minimized) ? 'linear-gradient(135deg, #5a1010, #3d0808)' : undefined }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
          <AnimatePresence mode="wait">
            {(open && !minimized) ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
                className="w-12 h-12 rounded-full bg-white overflow-hidden shadow-sm ring-1 ring-[#D4AF37]/45">
                <img src={BOT_LOGO_SRC} alt="Mở Trợ lý" className="w-full h-full rounded-full object-cover" draggable="false" />
              </motion.span>
            )}
          </AnimatePresence>
          {(hasNew && (!open || minimized)) && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-[8px] font-black text-white flex items-center justify-center">!</span>
          )}
          {!open && (
            <motion.div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white border border-[#e5d5b5] rounded-xl px-3 py-2 shadow-md whitespace-nowrap pointer-events-none"
              initial={{ opacity: 0, x: 8, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 2.5, duration: 0.3 }}>
              <p className="text-[11px] font-semibold text-[#3d1515]">Trợ lý Xứ Đoàn có thể giúp gì?</p>
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#e5d5b5] rotate-45" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </>
  );
}
