import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Clock, Newspaper, Images, BookOpen, LogIn, ChevronRight, Bell, Share2, Flame, ChevronLeft,
} from 'lucide-react';
import api from '../services/api';
import { DEFAULT_OG_IMAGE } from '../utils/seo';

// ── Design tokens ─────────────────────────────────────────────────────────────
const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS  = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

// ── Ngành config ──────────────────────────────────────────────────────────────
const NGANH_KEYS = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];
const NGANH_CFG  = {
  ChienNon: { icon: '🕊️', accent: '#ec4899', bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.25)',  slug: 'chien-non' },
  AuNhi:    { icon: '🌿', accent: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   slug: 'au-nhi'    },
  ThieuNhi: { icon: '⭐', accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  slug: 'thieu-nhi' },
  NghiaSi:  { icon: '🛡️', accent: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.25)',   slug: 'nghia-si'  },
  HiepSi:   { icon: '⚔️', accent: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)',  slug: 'hiep-si'   },
};

// ── Liturgical color config (static hôm nay — link sang trang GioLe để cập nhật thật) ──

// ── Framer variants ───────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

// Reveal dùng cho section header và block độc lập
const revealUp   = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const revealLeft = { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const VIEWPORT   = { once: true, margin: '-56px' };

// ── Cross watermark ───────────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    aria-hidden="true"
    style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.022, zIndex: 0, pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="home-cross" x="0" y="0" width="130" height="130" patternUnits="userSpaceOnUse">
        <rect x="59" y="22" width="12" height="86" rx="3.5" fill="#8B0000" />
        <rect x="30" y="44" width="70" height="12" rx="3.5" fill="#8B0000" />
        <circle cx="65" cy="17" r="7" fill="none" stroke="#8B0000" strokeWidth="2.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#home-cross)" />
  </svg>
);

// ── Glass card base styles ────────────────────────────────────────────────────
const glassStyle = {
  background: 'rgba(255,252,249,0.88)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderColor: '#e5d5b5',
};

// ── Tính countdown từ ISO date string (UTC+7 aware) ───────────────────────────
function calcCountdown(dateStr) {
  // dateStr: 'YYYY-MM-DD' hoặc 'YYYY-MM-DDTHH:MM'
  const target = new Date(dateStr.length === 10 ? dateStr + 'T23:59:59' : dateStr);
  const diff   = Math.max(0, target.getTime() - Date.now());
  const s      = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done:    diff <= 0,
  };
}

// ── CountdownStrip — fetch từ API, event queue tự động ───────────────────────
const AUTO_ROTATE_MS = 15_000; // 15 giây

const CountdownStrip = () => {
  const [events,  setEvents]  = useState([]);
  const [idx,     setIdx]     = useState(0);
  const [tick,    setTick]    = useState(null);
  const timerRef = useRef(null);
  const autoRef  = useRef(null);

  // Khởi động / reset auto-rotate, dừng khi chỉ 1 sự kiện
  const startAutoRotate = (total) => {
    clearInterval(autoRef.current);
    if (total <= 1) return;
    autoRef.current = setInterval(() => {
      setIdx(i => (i + 1) % total);
    }, AUTO_ROTATE_MS);
  };

  // Fetch danh sách sự kiện từ server
  useEffect(() => {
    api.get('/events')
      .then(r => {
        const now = Date.now();
        const upcoming = (r.data.data || [])
          .filter(e => new Date(e.date.length === 10 ? e.date + 'T23:59:59' : e.date).getTime() > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming);
        setIdx(0);
        startAutoRotate(upcoming.length);
      })
      .catch(() => {});
    return () => clearInterval(autoRef.current);
  }, []);

  // Countdown tick mỗi giây
  useEffect(() => {
    if (!events.length) return;
    const update = () => {
      const t = calcCountdown(events[idx].date);
      setTick(t);
      if (t.done && idx < events.length - 1) {
        setTimeout(() => setIdx(i => i + 1), 3000);
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, events]);

  // Bấm mũi tên thủ công → reset countdown 10 giây
  const goTo = (newIdx) => {
    setIdx(newIdx);
    startAutoRotate(events.length);
  };

  if (!events.length) return null;

  const ev  = events[idx];
  const pad = n => String(n).padStart(2, '0');
  const dateLabel = new Date(
    ev.date.length === 10 ? ev.date + 'T00:00:00' : ev.date
  ).toLocaleString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isDone = tick?.done ?? false;
  const units  = [
    { v: tick?.days    ?? 0, l: 'ngày'   },
    { v: tick?.hours   ?? 0, l: 'giờ'    },
    { v: tick?.minutes ?? 0, l: 'phút'   },
    { v: tick?.seconds ?? 0, l: 'giây'   },
  ];

  // Glassmorphism slim bar — absolute bottom Hero
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.45 }}
      className="absolute bottom-0 left-0 right-0 z-20"
      style={{
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        borderTop: '1px solid rgba(248,212,68,0.2)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4 flex-wrap">

        {/* Tên sự kiện — compact */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base select-none leading-none">{ev.icon}</span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] hidden sm:block"
            style={{ color: 'rgba(248,212,68,0.8)', fontFamily: SANS }}>
            {ev.name}
          </p>
          <span className="text-white/20 hidden sm:block">·</span>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: SANS }}>
            {dateLabel}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/15" />

        {/* Countdown digits / trạng thái đang diễn ra */}
        {isDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(248,212,68,0.15)', border: '1px solid rgba(248,212,68,0.35)' }}
          >
            <span className="text-sm select-none">🎉</span>
            <span className="text-sm font-bold" style={{ color: '#F8D444', fontFamily: SANS }}>
              Sự kiện đang diễn ra!
            </span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            {units.map((u, i) => (
              <div key={u.l} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <span className="font-bold text-base leading-none" style={{ color: 'rgba(248,212,68,0.35)' }}>:</span>
                )}
                <div className="flex flex-col items-center min-w-8">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={u.v}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0,  opacity: 1 }}
                      exit={{    y:  8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-black tabular-nums leading-none"
                      style={{
                        fontFamily: '"Be Vietnam Pro", "Inter", monospace',
                        fontSize: 'clamp(1.35rem, 3vw, 1.65rem)',
                        color: ev.color || '#F8D444',
                        textShadow: `0 0 14px ${ev.color || '#F8D444'}66`,
                      }}
                    >
                      {pad(u.v)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[8px] uppercase tracking-widest leading-none mt-0.5"
                    style={{ color: 'rgba(255,255,255,0.38)', fontFamily: SANS }}>
                    {u.l}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dot nav + progress bar */}
        {events.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => goTo((idx - 1 + events.length) % events.length)}
              className="text-white/35 hover:text-white/70 transition">
              <ChevronLeft size={11} />
            </button>

            {events.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="relative rounded-full overflow-hidden transition-all duration-300"
                style={{ width: i === idx ? 20 : 4, height: 4, background: 'rgba(255,255,255,0.22)' }}
              >
                {i === idx && (
                  <motion.span
                    key={idx}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: '#F8D444' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_ROTATE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}

            <button onClick={() => goTo((idx + 1) % events.length)}
              className="text-white/35 hover:text-white/70 transition">
              <ChevronRight size={11} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Giờ lễ cố định (giờ:phút, 24h) ─────────────────────────────────────────
const MASS_TIMES = [5, 18]; // 05:00, 18:00
function getNextMass() {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const next = MASS_TIMES.find(h => h > nowH) ?? MASS_TIMES[0];
  const hh   = String(Math.floor(next)).padStart(2, '0');
  const mm   = next % 1 === 0 ? '00' : String(Math.round((next % 1) * 60)).padStart(2, '0');
  const isPast = !MASS_TIMES.find(h => h > nowH);
  return { time: `${hh}:${mm}`, isNextDay: isPast };
}

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const { t }    = useTranslation();
  const nextMass = useMemo(() => getNextMass(), []);

  // Fetch Lời Chúa hôm nay
  const [loiChua, setLoiChua] = useState(null);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    api.get(`/loi-chua?date=${today}`)
      .then(r => setLoiChua(r.data.data))
      .catch(() => {});
  }, []);


  return (
    <main className="relative flex-1 bg-page" style={{ fontFamily: SANS, paddingTop: 0 }}>
      <Helmet>
        <title>Xứ Đoàn Anrê Phú Yên – Mẫu Tâm</title>
        <meta property="og:title" content="Xứ Đoàn Anrê Phú Yên – Mẫu Tâm" />
        <meta property="og:description" content="Website quản lý và truyền thông của Xứ Đoàn Anrê Phú Yên – Mẫu Tâm." />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <CrossWatermark />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          backgroundImage: 'url(/images/DAP_2149.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '55% 25%',
          backgroundAttachment: 'fixed',
          minHeight: '94svh',
        }}
      >
        {/* Gradient đỉnh: che Navbar để chữ menu trắng rõ trên nền ảnh */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: 90, background: 'linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, transparent 100%)' }} />
        {/* Gradient đáy: mờ dần xuống để nút bấm nổi trên ảnh */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 15%, rgba(10,0,0,0.18) 45%, rgba(60,0,0,0.55) 72%, rgba(90,0,0,0.80) 88%, rgba(100,0,0,0.90) 100%)' }} />
        {/* Vignette hai bên nhẹ */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%)' }} />
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

        {/* Đẩy phần text lên cao, chừa khoảng trống giữa cho gương mặt thở */}
        <div className="relative z-10 flex flex-col items-center justify-start text-center px-4 pt-24 pb-24">
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[10px] uppercase tracking-[0.38em] font-semibold mb-3"
            style={{ color: 'rgba(212,175,55,0.85)', fontFamily: SANS }}
          >
            {t('home.subtitle')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
            style={{ fontFamily: SERIF, fontSize: 'clamp(1.85rem, 4.5vw, 3.2rem)', fontWeight: 600,
                     color: 'white', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
            className="drop-shadow-2xl leading-tight mb-3"
          >
            {t('home.title')}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.32, duration: 0.45 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
            <span className="text-[#D4AF37] select-none">✝</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42, duration: 0.5 }}
            className="text-white/80 max-w-md mx-auto leading-relaxed drop-shadow mb-12"
            style={{ fontFamily: SERIF, fontSize: '1.05rem', fontStyle: 'italic' }}
          >
            {t('home.quote')}
          </motion.p>

          {/* CTA — nhỏ, nhẹ, không đè lên chủ thể ảnh */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.4 }}
            className="flex justify-center gap-2 flex-wrap"
          >
            <Link to="/gio-le"
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.45)',
                color: '#fff',
              }}
            >
              {t('home.viewLiturgy')}
            </Link>
            {[
              { to: '/tin-tuc',        label: t('home.news')   },
              { to: '/thu-vien',       label: t('nav.gallery') },
              { to: '/lich-su-cuu-do', label: 'Lịch Sử'        },
              ...(user ? [{ to: '/lop-hoc', label: t('home.classes') }] : []),
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 transition-all hover:-translate-y-0.5 hover:text-white"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Countdown glassmorphism đè lên đáy Hero */}
        <CountdownStrip />
      </section>

      {/* ══════════════════════════════════════════════════════
          5 NGÀNH
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container py-10">
        <motion.div
          variants={revealLeft} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
          <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
            {t('home.nganhTitle')}
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
        >
          {NGANH_KEYS.map(key => {
            const cfg = NGANH_CFG[key];
            return (
              <motion.div key={key} variants={fadeUp}>
                <Link
                  to={`/lop-hoc?nganh=${cfg.slug}`}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border group"
                  style={{
                    background: cfg.bg,
                    borderColor: cfg.border,
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = cfg.accent;
                    e.currentTarget.style.boxShadow = `0 12px 32px ${cfg.accent}35, 0 4px 12px ${cfg.accent}20`;
                    const icon = e.currentTarget.querySelector('[data-icon="nganh"]');
                    if (icon) {
                      icon.style.boxShadow = `0 0 18px ${cfg.accent}55, 0 0 6px ${cfg.accent}35`;
                      icon.style.background = `${cfg.accent}22`;
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = cfg.border;
                    e.currentTarget.style.boxShadow = 'none';
                    const icon = e.currentTarget.querySelector('[data-icon="nganh"]');
                    if (icon) {
                      icon.style.boxShadow = 'none';
                      icon.style.background = `${cfg.accent}14`;
                    }
                  }}
                >
                  {/* Icon với glow khi hover — style qua data-icon trong onMouseEnter parent */}
                  <div
                    data-icon="nganh"
                    className="flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                    style={{
                      background: `${cfg.accent}14`,
                      border: `1.5px solid ${cfg.accent}30`,
                      fontSize: '1.75rem',
                      lineHeight: 1,
                      transition: 'box-shadow 0.28s ease, background 0.2s ease',
                    }}
                  >
                    <span className="select-none">{cfg.icon}</span>
                  </div>
                  <p className="font-bold text-sm text-[#3d1515]" style={{ fontFamily: SERIF }}>
                    {t(`nganh.${key}`)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t(`nganh.desc.${key}`)}</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PATRON + LỜI CHÚA — 2 cột
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative z-10 py-12 px-4"
        style={{ borderTop: '1px solid #e5d5b5', borderBottom: '1px solid #e5d5b5' }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

          {/* ── Card Quan Thầy ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
            className="rounded-3xl p-7 border relative overflow-hidden"
            style={{ ...glassStyle, background: 'linear-gradient(135deg, rgba(139,0,0,0.06) 0%, rgba(255,252,249,0.95) 100%)' }}
          >
            {/* Watermark chữ thập chìm */}
            <span className="absolute -right-6 -bottom-6 select-none pointer-events-none"
                  style={{ fontSize: '10rem', opacity: 0.035, color: '#8B0000', fontFamily: SERIF, lineHeight: 1 }}
                  aria-hidden="true">✝</span>

            {/* Label */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] font-semibold mb-3" style={{ fontFamily: SANS }}>
              {t('home.patronSection')}
            </p>

            {/* Tên Chân Phước — EB Garamond, vàng đồng */}
            <div className="flex items-start gap-2 mb-1">
              {/* Nhành dương liễu — biểu tượng tử đạo */}
              <span className="text-2xl mt-0.5 select-none shrink-0" title="Nhành Dương Liễu — biểu tượng tử đạo" aria-hidden="true">🌿</span>
              <h2
                className="font-bold leading-tight"
                style={{ fontFamily: SERIF, fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', color: '#D4AF37', textShadow: '0 1px 6px rgba(212,175,55,0.2)' }}
              >
                {t('home.patronName')}
              </h2>
            </div>

            {/* Gold divider */}
            <div className="flex items-center gap-2 mb-4 ml-8">
              <div className="h-px w-10 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs select-none">✦</span>
              <div className="h-px w-6 bg-[#D4AF37]/40" />
            </div>

            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed ml-8" style={{ fontFamily: SANS }}>
              {t('home.patronDesc')}
            </p>

            {/* Quote */}
            <p
              className="mt-4 ml-8 font-semibold italic"
              style={{ fontFamily: SERIF, color: '#8B0000', fontSize: '0.95rem' }}
            >
              {t('home.quote')}
            </p>
          </motion.div>

          {/* ── Card Lời Chúa + Widget Phụng Vụ ── */}
          <div className="flex flex-col gap-4">

            {/* Lời Chúa card — fetch real data */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-3xl relative flex flex-col flex-1 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #fdf8ec 0%, #f8edcc 55%, #fdf8ec 100%)',
                border: '2px solid #D4AF37',
                boxShadow: '0 4px 28px rgba(212,175,55,0.15)',
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #D4AF37, #c8960a, #D4AF37)' }} />

              <div className="p-6 flex flex-col flex-1">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] text-lg select-none">✝</span>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] font-bold" style={{ fontFamily: SANS }}>
                      Lời Chúa Hôm Nay
                    </p>
                  </div>
                  {loiChua?.season && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(139,0,0,0.08)', color: '#8B0000', fontFamily: SANS }}>
                      {loiChua.season}
                    </span>
                  )}
                </div>

                {/* Key verse */}
                <blockquote className="flex-1 mb-4 relative pl-4"
                  style={{ borderLeft: '3px solid #D4AF37' }}>
                  <p className="text-[#2a0f0f] leading-loose"
                    style={{ fontFamily: SERIF, fontSize: '1.05rem', fontStyle: 'italic' }}
                    dangerouslySetInnerHTML={{
                      __html: (loiChua?.keyVerse || t('home.quote'))
                        .replace(
                          /(\d+)/g,
                          '<sup style="font-size:0.65em;font-style:normal;font-weight:700;color:#8B0000;margin:0 1px;vertical-align:super;line-height:0;">$1</sup>'
                        )
                    }}
                  />
                  {loiChua?.tinMungTen && (
                    <p className="text-[#8B0000] text-[11px] mt-2.5 font-bold uppercase tracking-widest not-italic"
                      style={{ fontFamily: SANS }}>
                      — {loiChua.tinMungTen}
                    </p>
                  )}
                </blockquote>

                {/* Footer: đọc thêm + share */}
                <div className="flex items-center justify-between gap-2 pt-3"
                  style={{ borderTop: '1px solid rgba(212,175,55,0.3)' }}>
                  <Link to="/loi-chua"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#8B0000] hover:gap-2.5 transition-all"
                    style={{ fontFamily: SANS }}>
                    Đọc đầy đủ <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Share buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 mr-0.5" style={{ fontFamily: SANS }}>Chia sẻ:</span>

                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/loi-chua')}&quote=${encodeURIComponent((loiChua?.keyVerse || t('home.quote')) + (loiChua?.tinMungTen ? ' — ' + loiChua.tinMungTen : ''))}`}
                      target="_blank" rel="noopener noreferrer"
                      title="Chia sẻ lên Facebook"
                      className="flex items-center justify-center w-7 h-7 rounded-full transition hover:scale-110"
                      style={{ background: '#1877F2' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    {/* Zalo */}
                    <a
                      href={`https://zalo.me/share/url?url=${encodeURIComponent(window.location.origin + '/loi-chua')}&title=${encodeURIComponent('Lời Chúa Hôm Nay — ' + (loiChua?.tinMungTen || 'Mẫu Tâm'))}`}
                      target="_blank" rel="noopener noreferrer"
                      title="Chia sẻ lên Zalo"
                      className="flex items-center justify-center w-7 h-7 rounded-full transition hover:scale-110"
                      style={{ background: '#0068FF' }}
                    >
                      <span className="text-white font-black text-[10px] leading-none">Z</span>
                    </a>

                    {/* Copy link */}
                    <button
                      title="Sao chép liên kết"
                      onClick={() => navigator.clipboard?.writeText(window.location.origin + '/loi-chua')}
                      className="flex items-center justify-center w-7 h-7 rounded-full transition hover:scale-110"
                      style={{ background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.2)' }}
                    >
                      <Share2 size={11} style={{ color: '#8B0000' }} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Widget Lịch Phụng Vụ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.35, delay: 0.15 }}
            >
              <Link
                to="/gio-le"
                className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 group"
                style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(139,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B0000'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,0,0,0.05)'; }}
              >
                {/* Màu áo lễ indicator */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                     style={{ background: 'rgba(139,0,0,0.08)', border: '1px solid rgba(139,0,0,0.15)' }}>
                  <span className="text-2xl select-none" title="Lịch Phụng Vụ">🕯️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5" style={{ fontFamily: SANS }}>
                    Lịch Phụng Vụ hôm nay
                  </p>
                  <p className="font-semibold text-[#3d1515] text-sm truncate" style={{ fontFamily: SERIF }}>
                    Xem giờ lễ & màu áo lễ
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5" style={{ fontFamily: SANS }}>
                    Giờ lễ cố định và lời Chúa trong ngày
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8B0000] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LỊCH SỬ XỨ ĐOÀN
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45 }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
            <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
              Lịch Sử Xứ Đoàn
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Nội dung lịch sử */}
            <div className="space-y-5">
              <p className="text-[#3d1515] leading-relaxed" style={{ fontFamily: SERIF, fontSize: '1.08rem' }}>
                Xứ Đoàn <strong>Anrê Phú Yên – Mẫu Tâm</strong> được thành lập với tinh thần
                noi gương Chân Phước Anrê Phú Yên — vị tử đạo trẻ tuổi đã dám sống và chết
                vì đức tin.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: SANS }}>
                Trải qua nhiều giai đoạn phát triển, xứ đoàn không ngừng lớn mạnh với
                5 ngành: Chiên Non, Ấu Nhi, Thiếu Nhi, Nghĩa Sĩ và Hiệp Sĩ — cùng nhau
                sống Tin Mừng và phục vụ cộng đoàn.
              </p>

              <Link
                to="/lich-su-cuu-do"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #8B0000, #6b0000)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(139,0,0,0.25)',
                }}
              >
                Khám phá Lịch Sử Cứu Độ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Timeline các mốc */}
            <div className="relative pl-6">
              {/* Đường dọc */}
              <div className="absolute left-2 top-2 bottom-2 w-px"
                style={{ background: 'linear-gradient(to bottom, #D4AF37, rgba(212,175,55,0.1))' }} />

              {[
                { year: 'Thành lập', desc: 'Xứ đoàn được thành lập, đặt dưới sự bảo trợ của Chân Phước Anrê Phú Yên.' },
                { year: 'Phát triển', desc: 'Hình thành 5 ngành với hàng trăm đoàn sinh tham gia sinh hoạt đức tin.' },
                { year: 'Hiện tại',  desc: 'Tiếp tục sứ mạng giáo dục đức tin, đồng hành với giới trẻ trong giáo xứ.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="relative mb-6 last:mb-0"
                >
                  {/* Dot */}
                  <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-[#D4AF37]"
                    style={{ background: '#fdf8ec' }} />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8B0000] mb-1"
                    style={{ fontFamily: SANS }}>{item.year}</p>
                  <p className="text-sm text-gray-600 leading-relaxed"
                    style={{ fontFamily: SANS }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BENTO GRID — 4 Quick Links
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container py-10">
        {/* CSS animations cho icon */}
        <style>{`
          @keyframes bento-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:0.85} }
          @keyframes bento-ring  { 0%{transform:rotate(-8deg)} 25%{transform:rotate(8deg)} 50%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} 100%{transform:rotate(0)} }
          @keyframes bento-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes bento-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          .bento-icon-pulse:hover .bento-ico { animation: bento-pulse 1.2s ease-in-out infinite; }
          .bento-icon-ring:hover  .bento-ico { animation: bento-ring  0.6s ease-in-out; }
          .bento-icon-float:hover .bento-ico { animation: bento-float 1.5s ease-in-out infinite; }
          .bento-icon-spin:hover  .bento-ico { animation: bento-spin  1.8s linear infinite; }
        `}</style>

        <motion.div
          variants={revealLeft} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
          <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
            Khám Phá
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
        </motion.div>

        {/*
          Bento 4 cột:
          [  Giờ Lễ — col 1-2, row 1-2  ] [ Tin Tức — col 3 ] [ Thư Viện — col 4 ]
          [                              ] [   Lớp Học / Login — col 3-4           ]
        */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ gridAutoRows: 'minmax(150px, auto)' }}
        >
          {/* ── Giờ Lễ — col 1-2, row 1-2 (lớn nhất) ── */}
          <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-2 lg:row-span-2 bento-icon-pulse">
            <Link to="/gio-le"
              className="relative flex flex-col h-full p-6 rounded-3xl border overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{ ...glassStyle, minHeight: 220, boxShadow: '0 2px 12px rgba(139,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B0000'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(139,0,0,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,0,0,0.05)'; }}
            >
              {/* Watermark */}
              <span className="absolute -right-4 -bottom-4 text-[120px] select-none pointer-events-none"
                style={{ opacity: 0.04, color: '#8B0000', lineHeight: 1 }} aria-hidden>🕯️</span>

              {/* Icon */}
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 shrink-0"
                style={{ background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.18)' }}>
                <Clock className="bento-ico w-6 h-6" style={{ color: '#8B0000' }} />
              </div>

              <h3 className="font-bold text-[#3d1515] mb-1 group-hover:text-[#8B0000] transition-colors"
                style={{ fontFamily: SERIF, fontSize: '1.25rem' }}>
                {t('home.liturgyLink')}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{t('home.liturgyDesc')}</p>

              {/* ── Widget Lễ tiếp theo ── */}
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3 mb-4"
                style={{ background: 'linear-gradient(135deg,rgba(139,0,0,0.08),rgba(139,0,0,0.04))', border: '1px solid rgba(139,0,0,0.12)' }}>
                <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: '#8B0000' }}>
                  <Bell className="w-4 h-4 text-white" style={{ animation: 'bento-ring 2.5s ease-in-out infinite' }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Lễ tiếp theo</p>
                  <p className="font-black text-[#8B0000] text-xl leading-none" style={{ fontFamily: SERIF }}>
                    {nextMass.time}
                    {nextMass.isNextDay && <span className="text-xs font-normal text-gray-400 ml-1">(ngày mai)</span>}
                  </p>
                </div>
              </div>

              {/* Thứ trong tuần */}
              <div className="flex gap-1.5 flex-wrap">
                {['CN','T2','T3','T4','T5','T6','T7'].map((d, i) => (
                  <span key={d} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: i === new Date().getDay() ? '#8B0000' : 'rgba(139,0,0,0.06)', color: i === new Date().getDay() ? 'white' : '#8B0000' }}>
                    {d}
                  </span>
                ))}
              </div>

              <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-[#8B0000] group-hover:gap-2 transition-all">
                Xem đầy đủ <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* ── Tin Tức — col 3 ── */}
          <motion.div variants={fadeUp} className="bento-icon-float">
            <Link to="/tin-tuc"
              className="flex flex-col h-full p-5 rounded-3xl border overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(37,99,235,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(37,99,235,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,0.04)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <Newspaper className="bento-ico w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <h3 className="font-bold text-[#3d1515] mb-1.5 group-hover:text-blue-700 transition-colors"
                style={{ fontFamily: SERIF, fontSize: '1.05rem' }}>
                {t('home.newsLink')}
              </h3>
              <p className="text-sm text-gray-500 flex-1">{t('home.newsDesc')}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-700 group-hover:gap-2 transition-all">
                Xem thêm <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* ── Thư Viện — col 4 ── */}
          <motion.div variants={fadeUp} className="bento-icon-spin">
            <Link to="/thu-vien"
              className="flex flex-col h-full p-5 rounded-3xl border overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(212,175,55,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(212,175,55,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(212,175,55,0.05)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Images className="bento-ico w-5 h-5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="font-bold text-[#3d1515] mb-1.5 group-hover:text-amber-700 transition-colors"
                style={{ fontFamily: SERIF, fontSize: '1.05rem' }}>
                {t('home.galleryLink')}
              </h3>
              <p className="text-sm text-gray-500 flex-1">{t('home.galleryDesc')}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-700 group-hover:gap-2 transition-all">
                Xem thêm <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* ── Lớp học / Login — col 3-4, row 2 ── */}
          <motion.div variants={fadeUp} className="sm:col-span-2 bento-icon-ring">
            <Link to={user ? '/lop-hoc' : '/login'}
              className="flex flex-col h-full p-5 rounded-3xl border overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                ...glassStyle,
                borderStyle: user ? 'solid' : 'dashed',
                borderColor: user ? '#e5d5b5' : 'rgba(229,213,181,0.5)',
                boxShadow: '0 2px 12px rgba(22,163,74,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = user ? '#16a34a' : '#6b7280'; e.currentTarget.style.boxShadow = `0 10px 32px ${user ? 'rgba(22,163,74,0.12)' : 'rgba(107,114,128,0.1)'}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = user ? '#e5d5b5' : 'rgba(229,213,181,0.5)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(22,163,74,0.04)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${user ? 'rgba(22,163,74' : 'rgba(107,114,128'},0.08)`, border: `1px solid ${user ? 'rgba(22,163,74' : 'rgba(107,114,128'},0.15)` }}>
                {user
                  ? <BookOpen className="bento-ico w-5 h-5" style={{ color: '#16a34a' }} />
                  : <LogIn    className="bento-ico w-5 h-5" style={{ color: '#6b7280' }} />
                }
              </div>
              <h3 className="font-bold text-[#3d1515] mb-1.5 group-hover:text-green-700 transition-colors"
                style={{ fontFamily: SERIF, fontSize: '1.05rem' }}>
                {user ? t('home.classesLink') : t('home.loginCta')}
              </h3>
              <p className="text-sm text-gray-500 flex-1">
                {user ? t('home.classesDesc') : t('home.loginDesc')}
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold group-hover:gap-2 transition-all"
                style={{ color: user ? '#16a34a' : '#6b7280' }}>
                {user ? 'Vào lớp học' : 'Đăng nhập'} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER ORNAMENT
      ══════════════════════════════════════════════════════ */}
      <motion.div
        variants={revealUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
        className="relative z-10 py-6 text-center" style={{ borderTop: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
          <span className="text-[#D4AF37]/60 text-lg select-none">✝</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-2 tracking-widest uppercase" style={{ fontFamily: SANS }}>
          Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
        </p>
      </motion.div>
    </main>
  );
};

export default Home;
