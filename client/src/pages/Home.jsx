import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import { useMemo } from 'react';
import {
  Clock, Newspaper, Images, BookOpen, LogIn, ChevronRight, Bell,
} from 'lucide-react';
import { DEFAULT_OG_IMAGE } from '../utils/seo';

// ── Design tokens ─────────────────────────────────────────────────────────────
const SERIF = '"EB Garamond", Lora, Georgia, serif';
const SANS  = '"Inter", system-ui, sans-serif';

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

// ── Giờ lễ cố định (giờ:phút, 24h) ─────────────────────────────────────────
const MASS_TIMES = [5, 17, 18.5]; // 05:00, 17:00, 18:30
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


  return (
    <main className="relative flex-1 bg-page" style={{ fontFamily: SANS }}>
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
          backgroundPosition: 'center 30%',
          backgroundAttachment: 'fixed',
          minHeight: '480px',
        }}
      >
        {/* Gradient chính: trong suốt ở trên → đỏ đậm xứ đoàn ở dưới */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(20,0,0,0.3) 40%, rgba(80,0,0,0.72) 75%, rgba(100,0,0,0.88) 100%)' }} />
        {/* Vignette nhẹ hai bên */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24">
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.35em] font-semibold mb-4"
            style={{ color: 'rgba(212,175,55,0.9)', fontFamily: SANS }}
          >
            {t('home.subtitle')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
            style={{ fontFamily: SERIF, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600,
                     color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            className="drop-shadow-2xl leading-tight mb-4"
          >
            {t('home.title')}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
            <span className="text-[#D4AF37] text-lg select-none">✝</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}
            className="text-white/85 max-w-lg mx-auto leading-relaxed drop-shadow mb-10"
            style={{ fontFamily: SERIF, fontSize: '1.15rem', fontStyle: 'italic' }}
          >
            {t('home.quote')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
            className="flex justify-center gap-3 flex-wrap"
          >
            {/* Nút chính — Glass trắng đặc hơn, nổi bật */}
            <Link to="/gio-le"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.55)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              {t('home.viewLiturgy')}
            </Link>
            {/* Các nút phụ — Glass mờ hơn */}
            {[
              { to: '/tin-tuc',        label: t('home.news')     },
              { to: '/thu-vien',       label: t('nav.gallery')   },
              { to: '/lich-su-cuu-do', label: 'Lịch Sử'          },
              ...(user ? [{ to: '/lop-hoc', label: t('home.classes') }] : []),
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1"
             style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      </section>

      {/* ══════════════════════════════════════════════════════
          5 NGÀNH
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
          <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
            {t('home.nganhTitle')}
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
        </div>

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

            {/* Lời Chúa card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: 0.08 }}
              className="rounded-3xl p-6 relative flex flex-col justify-between flex-1"
              style={{
                background: 'linear-gradient(135deg, #fdf8ec 0%, #f5e8c5 60%, #fdf8ec 100%)',
                border: '2px solid #D4AF37',
                boxShadow: '0 4px 24px rgba(212,175,55,0.1)',
              }}
            >
              <span className="absolute top-3 left-4 text-[#D4AF37]/25 text-3xl select-none" aria-hidden="true">✦</span>
              <span className="absolute bottom-3 right-4 text-[#D4AF37]/25 text-3xl select-none" aria-hidden="true">✦</span>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] font-semibold mb-3" style={{ fontFamily: SANS }}>
                  Lời Chúa
                </p>
                <blockquote
                  className="text-[#3d1515] leading-relaxed mb-3"
                  style={{ fontFamily: SERIF, fontSize: '1.15rem', fontStyle: 'italic' }}
                >
                  {t('home.quote')}
                </blockquote>
                <p className="text-[#8B0000]/70 text-xs tracking-widest uppercase" style={{ fontFamily: SANS }}>
                  Thánh Anrê Phú Yên
                </p>
              </div>

              <Link
                to="/gio-le"
                className="self-start mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#8B0000] hover:gap-2.5 transition-all"
                style={{ fontFamily: SANS }}
              >
                Đọc Lời Chúa hôm nay <ChevronRight className="w-3.5 h-3.5" />
              </Link>
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

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
          <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
            Khám Phá
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
        </div>

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
      <div className="relative z-10 py-6 text-center" style={{ borderTop: '1px solid #e5d5b5' }}>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
          <span className="text-[#D4AF37]/60 text-lg select-none">✝</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-2 tracking-widest uppercase" style={{ fontFamily: SANS }}>
          Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
        </p>
      </div>
    </main>
  );
};

export default Home;
