import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Scroll, Music2, BookOpen, Cross,
  Volume2, VolumeX, Quote, ChevronRight, ChevronLeft, CalendarDays, Sun,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Màu nhấn theo màu phụng vụ ─────────────────────────────────────────────

const ACCENT = {
  do:    { text: 'text-red-700',    border: 'border-red-400',   bg: 'bg-red-50',    ring: 'ring-red-200'   },
  trang: { text: 'text-amber-700',  border: 'border-amber-400', bg: 'bg-amber-50',  ring: 'ring-amber-200' },
  tim:   { text: 'text-purple-700', border: 'border-purple-400',bg: 'bg-purple-50', ring: 'ring-purple-200'},
  xanh:  { text: 'text-green-700',  border: 'border-green-400', bg: 'bg-green-50',  ring: 'ring-green-200' },
};

// ─── Metadata từng section ────────────────────────────────────────────────────

const SECTION_META = {
  baidoc1: { label: 'Bài Đọc 1', Icon: Scroll,   hue: '#3b82f6' },
  dapca:   { label: 'Đáp Ca',    Icon: Music2,   hue: '#22c55e' },
  baidoc2: { label: 'Bài Đọc 2', Icon: BookOpen, hue: '#a855f7' },
  phucam:  { label: 'Phúc Âm',   Icon: Cross,    hue: '#ef4444' },
};

// ─── Lịch mini ───────────────────────────────────────────────────────────────

const MiniCalendar = () => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=CN
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
      <p className="text-xs font-bold capitalize tracking-wider text-stone-500 mb-3">
        {monthName}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['CN','2','3','4','5','6','7'].map(d => (
          <span key={d} className="text-[9px] font-bold text-stone-400 pb-1">{d}</span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={[
              'text-[11px] w-6 h-6 flex items-center justify-center rounded-full mx-auto',
              d === today.getDate()
                ? 'bg-red-600 text-white font-bold'
                : d ? 'text-stone-600 hover:bg-stone-100' : '',
            ].join(' ')}
          >
            {d || ''}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Helpers ngày ────────────────────────────────────────────────────────────

const toISODate = (d) => d.toISOString().slice(0, 10);

// Chúa Nhật gần nhất (hôm nay nếu là CN, hoặc CN tới)
const getNextSunday = (from = new Date()) => {
  const d = new Date(from);
  const day = d.getDay();
  if (day === 0) return toISODate(d);
  d.setDate(d.getDate() + (7 - day));
  return toISODate(d);
};

const addDays = (isoDate, n) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

// ─── Fetch & parse ────────────────────────────────────────────────────────────

const fetchData = async (isoDate) => {
  try {
    const res = await fetch(`https://www.loichua.net/api/daily?date=${isoDate}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return null; }
};

const normalise = (raw) => {
  if (!raw) return null;
  const pick = (a, b) => raw[a] || raw[b];
  const toSec = (key, label, src) => src
    ? { key, label, trich: src.trich || src.title || '', noidung: src.noidung || src.text || '' }
    : null;

  const sections = [
    toSec('baidoc1', 'Bài Đọc 1', pick('baidoc1', 'reading1')),
    toSec('dapca',   'Đáp Ca',    pick('dapca',   'psalm')),
    toSec('baidoc2', 'Bài Đọc 2', pick('baidoc2', 'reading2')),
    toSec('phucam',  'Phúc Âm',   pick('phucam',  'gospel')),
  ].filter(Boolean).filter(s => s.noidung || s.trich);

  // câu vàng: dòng đầu tiên của Phúc Âm
  const phucam  = sections.find(s => s.key === 'phucam');
  const keyVerse = phucam?.noidung
    ? phucam.noidung.replace(/<[^>]+>/g, '').split('\n').filter(Boolean)[0]?.slice(0, 160)
    : '';

  return {
    name:      raw.name || raw.title || raw.liturgicalDay || 'Lời Chúa hôm nay',
    mauKey:    raw.color || 'xanh',
    sections,
    keyVerse,
    tinMungTen: phucam?.trich || '',
    imageUrl:  raw.image || raw.imageUrl || null,
  };
};

// ─── ReadingSection ───────────────────────────────────────────────────────────

const ReadingSection = ({ sec, idx, accent }) => {
  const m = SECTION_META[sec.key] || SECTION_META.baidoc1;
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + idx * 0.12, duration: 0.4, ease: 'easeOut' }}
    >
      {/* divider */}
      {idx > 0 && <hr className="border-stone-200 my-6" />}

      {/* section heading */}
      <div className="flex items-center gap-2.5 mb-4">
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

      {/* nội dung */}
      {sec.noidung ? (
        <div
          className="prose-lora text-stone-700 text-[15px] leading-[1.9] whitespace-pre-line"
          style={{ fontFamily: "'Lora', Georgia, serif" }}
          dangerouslySetInnerHTML={{ __html: sec.noidung }}
        />
      ) : (
        <p className="text-sm text-stone-400 italic">Nội dung chưa có.</p>
      )}
    </motion.article>
  );
};

// ─── AudioPlayer (stub — no real audio URL from API) ─────────────────────────

const AudioPlayer = ({ label }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-3 bg-stone-100 rounded-xl px-4 py-2.5 border border-stone-200">
      <button
        onClick={() => setPlaying(p => !p)}
        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center justify-center text-white shrink-0"
        aria-label={playing ? 'Dừng' : 'Nghe'}
      >
        {playing ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-600 truncate">{label}</p>
        <p className="text-[10px] text-stone-400">Audio — sắp ra mắt</p>
      </div>
      <div className="flex gap-0.5 items-end h-4">
        {[3,5,4,6,3,5,4].map((h, i) => (
          <span
            key={i}
            className={`w-0.5 rounded-full transition-all duration-300 ${playing ? 'bg-red-500' : 'bg-stone-300'}`}
            style={{ height: playing ? `${h * 2}px` : '4px', animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── ReadingProgressBar ───────────────────────────────────────────────────────

const ReadingProgress = () => {
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
        className="h-full bg-red-600 origin-left"
        style={{ scaleX: pct / 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const Sidebar = ({ imageUrl, tinMungTen, keyVerse, accent }) => (
  <motion.aside
    className="flex flex-col gap-4"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.25, duration: 0.45 }}
  >
    {/* Hình ảnh Tin Mừng */}
    <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 aspect-4/3 relative">
      {imageUrl ? (
        <img src={imageUrl} alt="Tin Mừng" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
          <BookOpen size={36} strokeWidth={1} />
          <p className="text-xs">{tinMungTen || 'Hình ảnh Tin Mừng'}</p>
        </div>
      )}
      {tinMungTen && (
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2">{tinMungTen}</p>
        </div>
      )}
    </div>

    {/* Lịch mini */}
    <MiniCalendar />

    {/* Câu vàng */}
    {keyVerse && (
      <div className={`rounded-2xl p-4 border ${accent.border} ${accent.bg}`}>
        <div className={`flex items-center gap-1.5 mb-2 ${accent.text}`}>
          <Quote size={13} />
          <span className="text-[10px] font-black uppercase tracking-widest">Câu vàng hôm nay</span>
        </div>
        <p
          className={`text-sm leading-relaxed italic ${accent.text}`}
          style={{ fontFamily: "'Lora', Georgia, serif" }}
        >
          "{keyVerse}"
        </p>
      </div>
    )}
  </motion.aside>
);

// ─── Fallback sections khi API lỗi ───────────────────────────────────────────

const FALLBACK_SECTIONS = [
  { key: 'baidoc1', label: 'Bài Đọc 1', trich: '', noidung: '' },
  { key: 'dapca',   label: 'Đáp Ca',    trich: '', noidung: '' },
  { key: 'phucam',  label: 'Phúc Âm',   trich: '', noidung: '' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const THU_VN = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];

const fmtDateLabel = (isoDate) => {
  const d = new Date(isoDate);
  return `${THU_VN[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};

const LoiChua = () => {
  const navigate  = useNavigate();
  const todayIso  = toISODate(new Date());
  const [date,    setDate]   = useState(todayIso);
  const [raw,     setRaw]    = useState(null);
  const [loading, setLoad]   = useState(true);

  const load = useCallback((isoDate) => {
    setLoad(true);
    setRaw(null);
    fetchData(isoDate).then(r => setRaw(normalise(r))).finally(() => setLoad(false));
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  const goSunday = () => setDate(getNextSunday());
  const isToday  = date === todayIso;

  const data    = raw;
  const mauKey  = data?.mauKey || 'xanh';
  const accent  = ACCENT[mauKey] || ACCENT.xanh;
  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ReadingProgress />

      <main className="flex-1 bg-stone-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Sticky header ── */}
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
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {data?.name || 'Lời Chúa hôm nay'}
                </h1>
                <p className="text-xs text-stone-400 mt-0.5">{fmtDateLabel(date)}</p>
              </div>
            </div>

            {/* Accent badge */}
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accent.text} ${accent.border} ${accent.bg}`}>
              {mauKey === 'do' ? 'Màu Đỏ' : mauKey === 'tim' ? 'Màu Tím' : mauKey === 'trang' ? 'Màu Trắng' : 'Thường Niên'}
            </span>
          </motion.div>

          {/* ── Điều hướng ngày ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="flex items-center gap-2 mb-4 flex-wrap"
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
              max={toISODate(new Date())}
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

          {/* ── Audio player ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mb-5"
          >
            <AudioPlayer label={data?.name || 'Lời Chúa hôm nay'} />
          </motion.div>

          {/* ── 2-col grid ── */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">

            {/* Cột trái — Paper */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-[#fdfaf5] rounded-3xl border border-stone-200 shadow-md px-6 sm:px-10 py-8"
            >
              {/* top accent line */}
              <div className={`h-1 w-16 rounded-full mb-6 ${accent.border.replace('border-', 'bg-')}`} />

              {data ? (
                sections.map((sec, i) => (
                  <ReadingSection key={sec.key} sec={sec} idx={i} accent={accent} />
                ))
              ) : (
                <div className="py-12 text-center">
                  <BookOpen size={40} className="text-stone-300 mx-auto mb-3" strokeWidth={1} />
                  <p className="text-sm text-stone-500 font-semibold mb-1">Không tải được Lời Chúa hôm nay</p>
                  <p className="text-xs text-stone-400">Vui lòng kiểm tra kết nối hoặc thử lại sau.</p>
                  <button
                    onClick={() => navigate('/gio-le')}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                  >
                    <ArrowLeft size={13} /> Về trang Giờ Lễ
                  </button>
                </div>
              )}

              {/* footer */}
              <p className="text-[10px] text-stone-300 text-center mt-8 pt-4 border-t border-stone-100">
                Dữ liệu phụng vụ từ loichua.net · cập nhật hàng ngày
              </p>
            </motion.div>

            {/* Cột phải */}
            <Sidebar
              imageUrl={data?.imageUrl}
              tinMungTen={data?.tinMungTen}
              keyVerse={data?.keyVerse}
              accent={accent}
            />
          </div>

        </div>
      </main>
    </>
  );
};

export default LoiChua;
