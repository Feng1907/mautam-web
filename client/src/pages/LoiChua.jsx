import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Scroll, Music2, BookOpen, Cross, FlameIcon,
  Quote, ChevronRight, ChevronLeft, CalendarDays, Sun,
  Copy, Check, Share2,
} from 'lucide-react';

// ─── API base ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || '';

// ─── Màu phụng vụ (label được override bởi seasonName từ API) ────────────────
const ACCENT = {
  do:    { text: 'text-red-700',    border: 'border-red-300',    bg: 'bg-red-50',    bar: 'bg-red-500'    },
  trang: { text: 'text-amber-700',  border: 'border-amber-300',  bg: 'bg-amber-50',  bar: 'bg-amber-400'  },
  tim:   { text: 'text-purple-700', border: 'border-purple-300', bg: 'bg-purple-50', bar: 'bg-purple-500' },
  hong:  { text: 'text-pink-700',   border: 'border-pink-300',   bg: 'bg-pink-50',   bar: 'bg-pink-400'   },
  xanh:  { text: 'text-green-700',  border: 'border-green-300',  bg: 'bg-green-50',  bar: 'bg-green-500'  },
};

// ─── Section metadata ─────────────────────────────────────────────────────────
const SECTION_META = {
  baidoc1: { label: 'Bài Đọc 1',        Icon: Scroll,     hue: '#3b82f6' },
  dapca:   { label: 'Đáp Ca',            Icon: Music2,     hue: '#22c55e' },
  baidoc2: { label: 'Bài Đọc 2',        Icon: BookOpen,   hue: '#a855f7' },
  tunghoe: { label: 'Tung Hô Tin Mừng', Icon: FlameIcon,  hue: '#f59e0b' },
  phucam:  { label: 'Phúc Âm',          Icon: Cross,      hue: '#ef4444' },
};

// ─── Helpers ngày ─────────────────────────────────────────────────────────────
const toISODate = (d) => d.toISOString().slice(0, 10);

const getNextSunday = (from = new Date()) => {
  const d = new Date(from);
  const day = d.getDay();
  if (day === 0) return toISODate(d);
  d.setDate(d.getDate() + (7 - day));
  return toISODate(d);
};

const addDays = (isoDate, n) => {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

const THU_VN = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
const fmtDateLabel = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return `${THU_VN[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth()+1} năm ${d.getFullYear()}`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonLine = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${w} ${h} rounded bg-stone-200 animate-pulse`} />
);

const SkeletonSection = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse shrink-0" />
      <div className="space-y-1 flex-1">
        <SkeletonLine w="w-24" h="h-3" />
        <SkeletonLine w="w-36" h="h-3" />
      </div>
    </div>
    <SkeletonLine />
    <SkeletonLine />
    <SkeletonLine w="w-5/6" />
    <SkeletonLine w="w-4/5" />
    <SkeletonLine />
    <SkeletonLine w="w-3/4" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#fdfaf5] rounded-3xl border border-stone-200 shadow-md px-6 sm:px-10 py-8 space-y-8">
    <div className="w-16 h-1 rounded-full bg-stone-200 animate-pulse mb-6" />
    <SkeletonSection />
    <hr className="border-stone-200" />
    <SkeletonSection />
    <hr className="border-stone-200" />
    <SkeletonSection />
  </div>
);

// ─── Nút Sao chép ─────────────────────────────────────────────────────────────
const CopyButton = ({ text, label = 'Sao chép' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback: execCommand
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={[
        'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition',
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50',
      ].join(' ')}
      title={label}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Đã sao chép!' : label}
    </button>
  );
};

// ─── Nút Chia sẻ ─────────────────────────────────────────────────────────────
const ShareButton = ({ title, text }) => {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({ title, text, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${window.location.href}`);
      alert('Đã sao chép liên kết để chia sẻ!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white border-stone-200 text-stone-600 hover:bg-stone-50 transition"
      title="Chia sẻ"
    >
      <Share2 size={12} /> Chia sẻ
    </button>
  );
};

// ─── ReadingSection ───────────────────────────────────────────────────────────
const ReadingSection = ({ sec, idx }) => {
  const m = SECTION_META[sec.key] || SECTION_META.baidoc1;

  // Plain text để copy: bỏ thẻ HTML
  const plainForCopy = [
    sec.label,
    sec.trich ? `(${sec.trich})` : '',
    '',
    sec.noidung,
  ].filter(Boolean).join('\n');

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + idx * 0.12, duration: 0.4, ease: 'easeOut' }}
    >
      {idx > 0 && <hr className="border-stone-200 my-6" />}

      {/* Heading section */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: m.hue + '18', color: m.hue }}
          >
            <m.Icon size={15} />
          </span>
          <div>
            <span
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: m.hue }}
            >
              {sec.label}
            </span>
            {sec.trich && (
              <p className="text-xs text-stone-500 italic leading-tight mt-0.5">{sec.trich}</p>
            )}
          </div>
        </div>

        {/* Nút copy section */}
        {sec.noidung && <CopyButton text={plainForCopy} label="Sao chép" />}
      </div>

      {/* Nội dung */}
      {sec.noidung ? (
        <div
          className="text-stone-750 text-[16px] leading-loose text-justify"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          dangerouslySetInnerHTML={{ __html: sec.noidung }}
        />
      ) : (
        <p className="text-sm text-stone-400 italic">Nội dung chưa có.</p>
      )}
    </motion.article>
  );
};

// ─── ReadingProgressBar ───────────────────────────────────────────────────────
const ReadingProgress = ({ accentBar }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const tot = el.scrollHeight - el.clientHeight;
      setPct(tot > 0 ? Math.round((el.scrollTop / tot) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200">
      <motion.div
        className={`h-full origin-left ${accentBar}`}
        style={{ scaleX: pct / 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

// ─── MiniCalendar ─────────────────────────────────────────────────────────────
const MiniCalendar = ({ selectedDate, onSelect }) => {
  const sel   = new Date(selectedDate + 'T00:00:00');
  const today = new Date();
  const year  = sel.getFullYear();
  const month = sel.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = sel.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const makeIso = (d) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };
  const todayIso = toISODate(today);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
      <p className="text-xs font-bold capitalize tracking-wider text-stone-500 mb-3">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['CN','2','3','4','5','6','7'].map(d => (
          <span key={d} className="text-[9px] font-bold text-stone-400 pb-1">{d}</span>
        ))}
        {cells.map((d, i) => {
          const iso = d ? makeIso(d) : null;
          const isToday = iso === todayIso;
          const isSel   = iso === selectedDate;
          const isFut   = iso > todayIso;
          return (
            <button
              key={i}
              disabled={!d || isFut}
              onClick={() => iso && onSelect(iso)}
              className={[
                'text-[11px] w-6 h-6 flex items-center justify-center rounded-full mx-auto transition',
                !d ? '' :
                isSel && isToday ? 'bg-red-600 text-white font-bold' :
                isSel ? 'bg-red-100 text-red-700 font-bold' :
                isToday ? 'ring-1 ring-red-400 text-red-600 font-bold' :
                isFut  ? 'text-stone-300 cursor-not-allowed' :
                'text-stone-600 hover:bg-stone-100 cursor-pointer',
              ].join(' ')}
            >
              {d || ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ tinMungTen, keyVerse, accent, selectedDate, onSelect, allSections }) => {
  // Plain text toàn bộ để chia sẻ
  const fullText = allSections
    .map(s => `【${s.label}】${s.trich ? ` (${s.trich})` : ''}\n${s.noidung}`)
    .join('\n\n---\n\n');

  return (
    <motion.aside
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
    >
      {/* Lịch mini tương tác */}
      <MiniCalendar selectedDate={selectedDate} onSelect={onSelect} />

      {/* Câu vàng */}
      {keyVerse && (
        <div className={`rounded-2xl p-4 border ${accent.border} ${accent.bg}`}>
          <div className={`flex items-center gap-1.5 mb-2 ${accent.text}`}>
            <Quote size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">Câu Vàng Hôm Nay</span>
          </div>
          <p
            className={`text-[15px] leading-relaxed italic ${accent.text}`}
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            "{keyVerse}"
          </p>
        </div>
      )}

      {/* Nút Chia sẻ toàn bộ */}
      {allSections.length > 0 && (
        <div className="rounded-2xl p-4 border border-stone-200 bg-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
const LoiChua = () => {
  const navigate  = useNavigate();
  const todayIso  = toISODate(new Date());
  const [date,    setDate]   = useState(todayIso);
  const [data,    setData]   = useState(null);
  const [loading, setLoad]   = useState(true);
  const [error,   setError]  = useState(null);

  const load = useCallback(async (isoDate) => {
    setLoad(true);
    setData(null);
    setError(null);
    try {
      const res = await fetch(`${API}/api/loi-chua?date=${isoDate}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Không tải được dữ liệu.');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoad(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(date); }, [date, load]);

  const goSunday = () => setDate(getNextSunday());
  const isToday  = date === todayIso;

  const mauKey  = data?.mauKey || 'xanh';
  const accent  = ACCENT[mauKey] || ACCENT.xanh;
  const sections = data?.sections || [];

  return (
    <>
      <ReadingProgress accentBar={accent.bar} />

      <main className="flex-1 bg-stone-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between mb-6 flex-wrap gap-3"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/gio-le')}
                className="w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-100 transition flex items-center justify-center text-stone-500 shadow-sm"
                aria-label="Quay lại"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phụng Vụ Lời Chúa</p>
                <h1
                  className="text-xl font-bold text-stone-900 leading-tight"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  {loading ? (
                    <span className="inline-block w-48 h-5 bg-stone-200 rounded animate-pulse" />
                  ) : (
                    data?.name || 'Lời Chúa hôm nay'
                  )}
                </h1>
                <p className="text-xs text-stone-400 mt-0.5">{fmtDateLabel(date)}</p>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accent.text} ${accent.border} ${accent.bg}`}>
              {loading
                ? <span className="inline-block w-20 h-3 bg-current opacity-20 rounded animate-pulse" />
                : (data?.seasonName || 'Mùa Thường Niên')}
            </span>
          </motion.div>

          {/* ── Điều hướng ngày ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="flex items-center gap-2 mb-5 flex-wrap"
          >
            <button
              onClick={() => setDate(d => addDays(d, -1))}
              className="w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-100 transition flex items-center justify-center text-stone-500 shadow-sm"
              title="Ngày trước"
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              value={date}
              max={todayIso}
              onChange={e => e.target.value && setDate(e.target.value)}
              className="h-9 px-3 text-sm border border-stone-200 rounded-full bg-white text-stone-700 outline-none focus:border-red-400 transition"
            />

            <button
              onClick={() => setDate(d => addDays(d, 1))}
              disabled={date >= todayIso}
              className="w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-100 transition flex items-center justify-center text-stone-500 shadow-sm disabled:opacity-30"
              title="Ngày sau"
            >
              <ChevronRight size={16} />
            </button>

            {!isToday && (
              <button
                onClick={() => setDate(todayIso)}
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
              >
                <CalendarDays size={13} /> Hôm nay
              </button>
            )}

            <button
              onClick={goSunday}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
              title="Chúa Nhật gần nhất"
            >
              <Sun size={13} /> Chúa Nhật
            </button>
          </motion.div>

          {/* ── 2-col layout ── */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">

            {/* Cột trái — Paper */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fdfaf5] rounded-3xl border border-stone-200 shadow-md px-6 sm:px-10 py-12 text-center"
                  >
                    <BookOpen size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-stone-500 font-semibold mb-1">Không tải được Lời Chúa</p>
                    <p className="text-xs text-stone-400 mb-4">{error}</p>
                    <button
                      onClick={() => load(date)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Thử lại
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#fdfaf5] rounded-3xl border border-stone-200 shadow-md px-6 sm:px-10 py-8"
                  >
                    {/* Accent bar */}
                    <div className={`h-1 w-16 rounded-full mb-6 ${accent.bar}`} />

                    {sections.length > 0 ? (
                      sections.map((sec, i) => (
                        <ReadingSection key={sec.key} sec={sec} idx={i} />
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <BookOpen size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1} />
                        <p className="text-sm text-stone-500 font-semibold mb-1">
                          Đang cập nhật Lời Chúa cho ngày này từ TGPSG
                        </p>
                        <p className="text-xs text-stone-400">
                          Vui lòng thử lại sau hoặc chọn ngày khác.
                        </p>
                      </div>
                    )}

                    {/* Source footer */}
                    <p className="text-[10px] text-stone-300 text-center mt-8 pt-4 border-t border-stone-100">
                      Dữ liệu phụng vụ từ tgpsaigon.net · cập nhật hàng ngày
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cột phải */}
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

      {/* CSS cho voice-jesus */}
      <style>{`
        .voice-jesus {
          color: #b91c1c;
          font-style: italic;
        }
      `}</style>
    </>
  );
};

export default LoiChua;
