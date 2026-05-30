import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Scroll, Music2, BookOpen, Cross, FlameIcon,
  Quote, ChevronRight, ChevronLeft, CalendarDays, Sun,
  Copy, Check, Share2, Search, Loader2, X,
} from 'lucide-react';
import { DEFAULT_OG_IMAGE, pageUrl } from '../utils/seo';

const API = import.meta.env.VITE_API_URL || '';

// ── Màu phụng vụ — light + dark variants ─────────────────────────────────────
const ACCENT = {
  do:    { text: 'text-red-700 dark:text-red-400',       border: 'border-red-300 dark:border-red-700',       bg: 'bg-red-50 dark:bg-red-950/40',       bar: 'bg-red-500'    },
  trang: { text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-300 dark:border-amber-700',   bg: 'bg-amber-50 dark:bg-amber-950/40',   bar: 'bg-amber-400'  },
  tim:   { text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-950/40', bar: 'bg-purple-500' },
  hong:  { text: 'text-pink-700 dark:text-pink-400',     border: 'border-pink-300 dark:border-pink-700',     bg: 'bg-pink-50 dark:bg-pink-950/40',     bar: 'bg-pink-400'   },
  xanh:  { text: 'text-green-700 dark:text-green-400',   border: 'border-green-300 dark:border-green-700',   bg: 'bg-green-50 dark:bg-green-950/40',   bar: 'bg-green-500'  },
};

// ── Section metadata ───────────────────────────────────────────────────────────
const SECTION_META = {
  baidoc1: { label: 'Bài Đọc 1',        Icon: Scroll,     hue: '#3b82f6' },
  dapca:   { label: 'Đáp Ca',            Icon: Music2,     hue: '#22c55e' },
  baidoc2: { label: 'Bài Đọc 2',        Icon: BookOpen,   hue: '#a855f7' },
  tunghoe: { label: 'Tung Hô Tin Mừng', Icon: FlameIcon,  hue: '#f59e0b' },
  phucam:  { label: 'Phúc Âm',          Icon: Cross,      hue: '#ef4444' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const toISODate  = (d) => d.toISOString().slice(0, 10);
const addDays    = (isoDate, n) => { const d = new Date(isoDate + 'T00:00:00'); d.setDate(d.getDate() + n); return toISODate(d); };
const getNextSunday = (from = new Date()) => { const d = new Date(from); const day = d.getDay(); if (day === 0) return toISODate(d); d.setDate(d.getDate() + (7 - day)); return toISODate(d); };
const THU_VN     = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
const fmtDateLabel = (iso) => { const d = new Date(iso + 'T00:00:00'); return `${THU_VN[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth()+1} năm ${d.getFullYear()}`; };

// ── Skeleton ───────────────────────────────────────────────────────────────────
const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const useDebouncedValue = (value, delay = 450) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const HighlightText = ({ text = '', query = '' }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return <>{text}</>;

  const parts = String(text).split(new RegExp(`(${escapeRegExp(cleanQuery)})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === cleanQuery.toLowerCase()
          ? <mark key={index} className="rounded bg-amber-200/80 px-0.5 text-stone-900">{part}</mark>
          : part
      )}
    </>
  );
};

const SearchResults = ({ query, results, loading, error, onSelect, onClear }) => {
  const active = query.trim().length >= 2;
  if (!active) return null;

  return (
    <div className="mb-5 rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-700 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 dark:text-slate-500">Kết quả tìm kiếm</p>
          <p className="text-sm text-stone-600 dark:text-slate-300">
            Tu khoa: <span className="font-semibold text-stone-900 dark:text-slate-100">{query}</span>
          </p>
        </div>
        <button type="button" onClick={onClear}
          className="h-8 w-8 rounded-full border border-stone-200 dark:border-slate-600 flex items-center justify-center text-stone-400 hover:text-red-600 hover:border-red-200 transition"
          aria-label="Xoá tìm kiếm">
          <X size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-stone-400">
          <Loader2 size={16} className="animate-spin" />
          Dang tim...
        </div>
      ) : error ? (
        <p className="px-4 py-5 text-sm text-red-600">{error}</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-stone-400">Khong tim thay noi dung phu hop.</p>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-slate-700">
          {results.map((item) => {
            const snippet = stripHtml(
              item.keyVerse ||
              item.sections?.find((section) => section.text || section.html)?.text ||
              item.sections?.find((section) => section.html)?.html ||
              ''
            );

            return (
              <button type="button" key={item._id} onClick={() => onSelect(item.date)}
                className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-slate-700/60 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 dark:text-slate-100 line-clamp-1">
                      <HighlightText text={item.title || item.tinMungTen || 'Loi Chua'} query={query} />
                    </p>
                    {snippet && (
                      <p className="mt-1 text-sm text-stone-500 dark:text-slate-400 line-clamp-2">
                        <HighlightText text={snippet} query={query} />
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">{item.date}</p>
                    {item.score != null && (
                      <p className="mt-1 text-[10px] text-stone-400">score {Number(item.score).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SkeletonLine = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${w} ${h} rounded bg-stone-200 dark:bg-slate-700 animate-pulse`} />
);

const SkeletonSection = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-slate-700 animate-pulse shrink-0" />
      <div className="space-y-1 flex-1">
        <SkeletonLine w="w-24" h="h-3" /><SkeletonLine w="w-36" h="h-3" />
      </div>
    </div>
    <SkeletonLine /><SkeletonLine /><SkeletonLine w="w-5/6" /><SkeletonLine w="w-4/5" /><SkeletonLine /><SkeletonLine w="w-3/4" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#fdfaf5] dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-md px-6 sm:px-10 py-8 space-y-8">
    <div className="w-16 h-1 rounded-full bg-stone-200 dark:bg-slate-700 animate-pulse mb-6" />
    <SkeletonSection />
    <hr className="border-stone-200 dark:border-slate-700" />
    <SkeletonSection />
    <hr className="border-stone-200 dark:border-slate-700" />
    <SkeletonSection />
  </div>
);

// ── CopyButton ─────────────────────────────────────────────────────────────────
const CopyButton = ({ text, label = 'Sao chép' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button onClick={handleCopy}
      className={['inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition',
        copied
          ? 'bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
          : 'bg-white dark:bg-slate-700 border-stone-200 dark:border-slate-600 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-600',
      ].join(' ')}
      title={label}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Đã sao chép!' : label}
    </button>
  );
};

// ── ShareButton ────────────────────────────────────────────────────────────────
const ShareButton = ({ title, text }) => {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const handleShare = async () => {
    if (canShare) { try { await navigator.share({ title, text, url: window.location.href }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${window.location.href}`); alert('Đã sao chép liên kết để chia sẻ!'); }
  };
  return (
    <button onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white dark:bg-slate-700 border-stone-200 dark:border-slate-600 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-600 transition"
      title="Chia sẻ"
    >
      <Share2 size={12} /> Chia sẻ
    </button>
  );
};

// Thêm <sup> cho số câu/chương mà không phá HTML tags hiện có
const formatVerseNums = (html = '', color = '#8B0000') =>
  html.replace(/<[^>]+>|(\d+)/g, (match, num) =>
    num
      ? `<sup style="font-size:0.62em;font-style:normal;font-weight:700;color:${color};margin:0 2px;vertical-align:super;line-height:0;">${num}</sup>`
      : match
  );

// ── ReadingSection ─────────────────────────────────────────────────────────────
const ReadingSection = ({ sec, idx }) => {
  const m = SECTION_META[sec.key] || SECTION_META.baidoc1;
  const plainForCopy = [sec.label, sec.trich ? `(${sec.trich})` : '', '', sec.noidung].filter(Boolean).join('\n');

  const isTungHoe = sec.key === 'tunghoe';
  const numColor  = isTungHoe ? '#92400e' : m.hue;
  const richHtml  = sec.noidung ? formatVerseNums(sec.noidung, numColor) : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + idx * 0.12, duration: 0.4, ease: 'easeOut' }}
    >
      {idx > 0 && <hr className="border-stone-200 dark:border-slate-700 my-6" />}

      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: m.hue + '22', color: m.hue }}>
            <m.Icon size={15} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: m.hue }}>
              {sec.label}
            </span>
            {sec.trich && (
              <p className="text-xs text-stone-500 dark:text-slate-400 italic leading-tight mt-0.5">{sec.trich}</p>
            )}
          </div>
        </div>
        {sec.noidung && <CopyButton text={plainForCopy} label="Sao chép" />}
      </div>

      {richHtml ? (
        <div
          className={`text-[16px] leading-loose text-justify ${
            isTungHoe
              ? 'text-amber-800 dark:text-amber-400'
              : 'text-stone-800 dark:text-slate-200'
          }`}
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(richHtml) }}
        />
      ) : (
        <p className="text-sm text-stone-400 dark:text-slate-500 italic">Nội dung chưa có.</p>
      )}
    </motion.article>
  );
};

// ── ReadingProgress ────────────────────────────────────────────────────────────
const ReadingProgress = ({ accentBar }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => { const el = document.documentElement; const tot = el.scrollHeight - el.clientHeight; setPct(tot > 0 ? Math.round((el.scrollTop / tot) * 100) : 0); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200 dark:bg-slate-700">
      <motion.div className={`h-full origin-left ${accentBar}`}
        style={{ scaleX: pct / 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

// ── MiniCalendar ───────────────────────────────────────────────────────────────
const MiniCalendar = ({ selectedDate, onSelect }) => {
  const todayIso = toISODate(new Date());

  // viewMonth điều khiển tháng đang hiển thị (tách khỏi selectedDate)
  const [viewYear,  setViewYear]  = useState(() => new Date(selectedDate + 'T00:00:00').getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate + 'T00:00:00').getMonth());
  const [syncedDate, setSyncedDate] = useState(selectedDate);

  // getDerivedStateFromProps pattern: khi selectedDate thay đổi từ ngoài,
  // cập nhật view ngay trong render (không dùng useEffect) để tránh cascading render.
  if (syncedDate !== selectedDate) {
    const d = new Date(selectedDate + 'T00:00:00');
    setSyncedDate(selectedDate);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (toISODate(next) <= todayIso) {
      if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1);
    }
  };

  // ── Tính ô lịch ──────────────────────────────────────────────────────────
  //   getDay(): 0=CN, 1=Hai, 2=Ba, 3=Tư, 4=Năm, 5=Sáu, 6=Bảy
  //   Header:  ['CN','2','3','4','5','6','7'] → cột 0=CN ... cột 6=Bảy
  //   Ví dụ: ngày 1 là Thứ Sáu → getDay()=5 → đặt 5 ô null trước ✓
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0–6
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName      = new Date(viewYear, viewMonth, 1)
    .toLocaleString('vi-VN', { month: 'long', year: 'numeric' });

  const cells = [
    ...Array(firstDayOfWeek).fill(null),          // ô trống đầu tháng
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1), // ngày 1..N
  ];
  while (cells.length % 7 !== 0) cells.push(null); // padding cuối hàng

  const makeIso = (d) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const canGoNext = new Date(viewYear, viewMonth + 1, 1) <= new Date(todayIso + 'T00:00:00');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-sm p-4">
      {/* Header tháng + điều hướng */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-full text-stone-400 dark:text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-700 transition text-sm">
          ‹
        </button>
        <p className="text-xs font-bold capitalize tracking-wider text-stone-600 dark:text-slate-300">
          {monthName}
        </p>
        <button onClick={nextMonth} disabled={!canGoNext}
          className="w-6 h-6 flex items-center justify-center rounded-full text-stone-400 dark:text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-700 transition text-sm disabled:opacity-30">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {/* Header thứ — CN đầu tiên khớp với getDay()=0 */}
        {['CN','2','3','4','5','6','7'].map(h => (
          <span key={h} className="text-[9px] font-bold text-stone-400 dark:text-slate-500 pb-1">{h}</span>
        ))}

        {/* Ô lịch */}
        {cells.map((d, i) => {
          const iso     = d ? makeIso(d) : null;
          const isToday = iso === todayIso;
          const isSel   = iso === selectedDate;
          const isFut   = iso ? iso > todayIso : false;
          return (
            <button key={i} disabled={!d || isFut} onClick={() => iso && onSelect(iso)}
              className={[
                'text-[11px] w-6 h-6 flex items-center justify-center rounded-full mx-auto transition',
                !d           ? 'invisible' :
                isSel && isToday ? 'bg-red-600 text-white font-bold' :
                isSel        ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-bold' :
                isToday      ? 'ring-1 ring-red-400 text-red-600 dark:text-red-400 font-bold' :
                isFut        ? 'text-stone-300 dark:text-slate-600 cursor-not-allowed' :
                               'text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer',
              ].join(' ')}
            >
              {d ?? ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ tinMungTen, keyVerse, accent, selectedDate, onSelect, allSections }) => {
  const fullText = allSections.map(s => `【${s.label}】${s.trich ? ` (${s.trich})` : ''}\n${s.noidung}`).join('\n\n---\n\n');
  return (
    <motion.aside className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
    >
      <MiniCalendar selectedDate={selectedDate} onSelect={onSelect} />

      {keyVerse && (
        <div className={`rounded-2xl p-4 border ${accent.border} ${accent.bg}`}>
          <div className={`flex items-center gap-1.5 mb-2 ${accent.text}`}>
            <Quote size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">Câu Vàng Hôm Nay</span>
          </div>
          <p className={`text-[15px] leading-relaxed italic ${accent.text}`}
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            "{keyVerse}"
          </p>
        </div>
      )}

      {allSections.length > 0 && (
        <div className="rounded-2xl p-4 border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-3">
            Chia sẻ cho Huynh Trưởng
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={fullText} label="Sao chép tất cả" />
            <ShareButton title={tinMungTen || 'Lời Chúa hôm nay'} text={fullText} />
          </div>
        </div>
      )}
    </motion.aside>
  );
};

// ── Nút điều hướng dùng chung ──────────────────────────────────────────────────
const NavBtn = ({ onClick, disabled, title, children }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className="w-9 h-9 rounded-full border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition flex items-center justify-center text-stone-500 dark:text-slate-400 shadow-sm disabled:opacity-30">
    {children}
  </button>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const LoiChua = () => {
  const navigate  = useNavigate();
  const todayIso  = toISODate(new Date());
  const [date, setDate] = useState(todayIso);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 450);

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['loiChua', date],
    queryFn: () => api.get(`/loi-chua?date=${date}`).then(r => r.data.success ? r.data.data : Promise.reject(r.data.message)),
    staleTime: 4 * 60 * 60 * 1000, // 4 giờ — Lời Chúa thay đổi theo ngày
    retry: 3,
  });
  const error = queryError ? (queryError?.message || 'Không tải được dữ liệu.') : null;

  useEffect(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const runSearch = async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Khong tim kiem duoc');
        setSearchResults(json.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSearchResults([]);
          setSearchError(err.message || 'Loi tim kiem');
        }
      } finally {
        if (!ctrl.signal.aborted) setSearchLoading(false);
      }
    };

    runSearch();
    return () => ctrl.abort();
  }, [debouncedSearch]);

  const isToday  = date === todayIso;
  const mauKey   = data?.mauKey || 'xanh';
  const accent   = ACCENT[mauKey] || ACCENT.xanh;
  const sections = data?.sections || [];

  return (
    <>
      <Helmet>
        <title>Lời Chúa Hôm Nay | Mẫu Tâm</title>
        <link rel="canonical" href={pageUrl('/loi-chua')} />
        <meta property="og:title" content="Lời Chúa Hôm Nay | Mẫu Tâm" />
        <meta property="og:description" content="Đọc Lời Chúa hằng ngày, bài đọc phụng vụ và Tin Mừng hôm nay." />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <ReadingProgress accentBar={accent.bar} />

      <main className="flex-1 bg-stone-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between mb-6 flex-wrap gap-3"
          >
            <div className="flex items-center gap-3">
              <NavBtn onClick={() => navigate('/gio-le')} title="Quay lại">
                <ArrowLeft size={16} />
              </NavBtn>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">
                  Phụng Vụ Lời Chúa
                </p>
                <h1 className="text-xl font-bold text-stone-900 dark:text-slate-100 leading-tight"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  {loading
                    ? <span className="inline-block w-48 h-5 bg-stone-200 dark:bg-slate-700 rounded animate-pulse" />
                    : (data?.name || 'Lời Chúa hôm nay')}
                </h1>
                <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{fmtDateLabel(date)}</p>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accent.text} ${accent.border} ${accent.bg}`}>
              {loading
                ? <span className="inline-block w-20 h-3 bg-current opacity-20 rounded animate-pulse" />
                : (data?.seasonName || 'Mùa Thường Niên')}
            </span>
          </motion.div>

          {/* ── Điều hướng ngày ── */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="flex items-center gap-2 mb-5 flex-wrap"
          >
            <NavBtn onClick={() => setDate(d => addDays(d, -1))} title="Ngày trước">
              <ChevronLeft size={16} />
            </NavBtn>

            <input type="date" value={date} max={todayIso}
              onChange={e => e.target.value && setDate(e.target.value)}
              className="h-9 px-3 text-sm border border-stone-200 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 outline-none focus:border-red-400 transition"
            />

            <NavBtn onClick={() => setDate(d => addDays(d, 1))} disabled={date >= todayIso} title="Ngày sau">
              <ChevronRight size={16} />
            </NavBtn>

            {!isToday && (
              <button onClick={() => setDate(todayIso)}
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition">
                <CalendarDays size={13} /> Hôm nay
              </button>
            )}

            <button onClick={() => setDate(getNextSunday())}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
              title="Chúa Nhật gần nhất">
              <Sun size={13} /> Chúa Nhật
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="mb-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm trong kho Lời Chúa..."
                className="w-full h-11 rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-11 text-sm text-stone-800 dark:text-slate-100 outline-none focus:border-red-400 dark:focus:border-red-500 transition shadow-sm"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
                  aria-label="Xoá tìm kiếm">
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-stone-400 dark:text-slate-500">
              Tìm kiếm bài đọc theo từ khoá — nhập tối thiểu 2 ký tự.
            </p>
          </motion.div>

          <SearchResults
            query={debouncedSearch}
            results={searchResults}
            loading={searchLoading}
            error={searchError}
            onSelect={(isoDate) => {
              setDate(isoDate);
              setSearchTerm('');
              setSearchResults([]);
            }}
            onClear={() => {
              setSearchTerm('');
              setSearchResults([]);
              setSearchError('');
            }}
          />

          {/* ── 2-col layout ── */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">

            {/* Paper */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <SkeletonCard />
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fdfaf5] dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-md px-6 sm:px-10 py-12 text-center">
                    <BookOpen size={40} className="text-stone-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-stone-500 dark:text-slate-400 font-semibold mb-1">Không tải được Lời Chúa</p>
                    <p className="text-xs text-stone-400 dark:text-slate-500 mb-4">{error}</p>
                    <button onClick={() => refetch()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
                      Thử lại
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="bg-[#fdfaf5] dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-md px-6 sm:px-10 py-8">
                    <div className={`h-1 w-16 rounded-full mb-6 ${accent.bar}`} />

                    {/* Thông báo khi bài chưa được đăng cho ngày yêu cầu */}
                    {data?.actualDate && !data.actualDate.includes(`${String(new Date(date + 'T00:00:00').getDate()).padStart(2,'0')}/${String(new Date(date + 'T00:00:00').getMonth()+1).padStart(2,'0')}`) && (
                      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                        <CalendarDays size={15} className="shrink-0 mt-0.5" />
                        <span>
                          Lời Chúa ngày <strong>{fmtDateLabel(date)}</strong> chưa được cập nhật.
                          Đang hiển thị bài gần nhất: <strong>{data.actualDate}</strong>.
                        </span>
                      </div>
                    )}

                    {sections.length > 0 ? (
                      sections.map((sec, i) => <ReadingSection key={sec.key} sec={sec} idx={i} />)
                    ) : (
                      <div className="py-12 text-center">
                        <BookOpen size={40} className="text-stone-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={1} />
                        <p className="text-sm text-stone-500 dark:text-slate-400 font-semibold mb-1">
                          Đang cập nhật Lời Chúa cho ngày này từ TGPSG
                        </p>
                        <p className="text-xs text-stone-400 dark:text-slate-500">
                          Vui lòng thử lại sau hoặc chọn ngày khác.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-stone-300 dark:text-slate-600 text-center mt-8 pt-4 border-t border-stone-100 dark:border-slate-700">
                      Dữ liệu phụng vụ từ tgpsaigon.net · cập nhật hàng ngày
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sidebar */}
            <Sidebar
              tinMungTen={data?.tinMungTen}
              keyVerse={data?.keyVerse}
              accent={accent}
              selectedDate={date}
              onSelect={setDate}
              allSections={sections}
            />
          </div>
        </div>
      </main>

      {/* voice-jesus: lời Chúa Giêsu — đỏ sáng trong dark mode */}
      <style>{`
        .voice-jesus { color: #b91c1c; font-style: italic; }
        .dark .voice-jesus { color: #fca5a5; }
      `}</style>
    </>
  );
};

export default LoiChua;
