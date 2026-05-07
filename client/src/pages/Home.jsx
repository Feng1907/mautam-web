import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import {
  Clock, Newspaper, Images, BookOpen, LogIn, ChevronRight,
} from 'lucide-react';

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

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const { t }    = useTranslation();


  return (
    <main className="relative flex-1" style={{ background: '#fdfbf7', fontFamily: SANS }}>
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
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-[#3d0000]/50 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
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
            <Link to="/gio-le"
              className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'white', color: '#8B0000' }}
            >
              {t('home.viewLiturgy')}
            </Link>
            {[
              { to: '/tin-tuc',  label: t('home.news')     },
              { to: '/thu-vien', label: t('nav.gallery')   },
              ...(user ? [{ to: '/lop-hoc', label: t('home.classes') }] : []),
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white border border-white/50 hover:bg-white/15 transition-all hover:-translate-y-0.5"
                style={{ backdropFilter: 'blur(6px)' }}
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
                  className="flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background: cfg.bg, borderColor: cfg.border, backdropFilter: 'blur(8px)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.accent; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.accent}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span className="text-3xl mb-2 select-none">{cfg.icon}</span>
                  <p className="font-bold text-sm text-[#3d1515]" style={{ fontFamily: SERIF }}>
                    {t(`nganh.${key}`)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`nganh.desc.${key}`)}</p>
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

            <p className="text-gray-600 text-sm leading-relaxed ml-8" style={{ fontFamily: SANS }}>
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
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: SANS }}>
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
          BENTO GRID — 4 Quick Links
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />
          <h2 className="text-xl font-bold text-[#3d1515] shrink-0" style={{ fontFamily: SERIF }}>
            Khám Phá
          </h2>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(212,175,55,0.4), transparent)' }} />
        </div>

        {/* Bento layout:
            Desktop: [GioLe lớn 2×1] [TinTuc] [ThuVien]
                     [         ...  ] [LopHoc/Login       ]
            Mobile: column                                 */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ gridAutoRows: 'minmax(160px, auto)' }}
        >
          {/* Giờ Lễ — lớn, span 2 hàng trên lg */}
          <motion.div variants={fadeUp} className="lg:row-span-2">
            <Link
              to="/gio-le"
              className="flex flex-col h-full p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 group"
              style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(139,0,0,0.05)', minHeight: '200px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B0000'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(139,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,0,0,0.05)'; }}
            >
              {/* Decorative watermark chìm */}
              <span className="absolute top-4 right-4 text-[80px] select-none pointer-events-none"
                    style={{ opacity: 0.04, color: '#8B0000', lineHeight: 1 }}
                    aria-hidden="true">🕯️</span>

              <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.15)' }}>
                <Clock className="w-6 h-6" style={{ color: '#8B0000' }} />
              </div>

              <h3
                className="font-bold text-[#3d1515] mb-2 group-hover:text-[#8B0000] transition-colors"
                style={{ fontFamily: SERIF, fontSize: '1.2rem' }}
              >
                {t('home.liturgyLink')}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{t('home.liturgyDesc')}</p>

              {/* Mini liturgy preview */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#f0e0c0' }}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Hôm nay</p>
                <div className="flex gap-2 flex-wrap">
                  {(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']).map((d, i) => (
                    <span
                      key={d}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: i === new Date().getDay() ? '#8B0000' : 'rgba(139,0,0,0.06)',
                        color: i === new Date().getDay() ? 'white' : '#8B0000',
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-[#8B0000] group-hover:gap-2 transition-all">
                Xem giờ lễ <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Tin Tức */}
          <motion.div variants={fadeUp}>
            <Link
              to="/tin-tuc"
              className="flex flex-col h-full p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 group"
              style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(37,99,235,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,0.04)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                   style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <Newspaper className="w-5 h-5" style={{ color: '#2563eb' }} />
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

          {/* Thư Viện */}
          <motion.div variants={fadeUp}>
            <Link
              to="/thu-vien"
              className="flex flex-col h-full p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 group"
              style={{ ...glassStyle, boxShadow: '0 2px 12px rgba(212,175,55,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(212,175,55,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(212,175,55,0.05)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                   style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Images className="w-5 h-5" style={{ color: '#D4AF37' }} />
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

          {/* Lớp học / Login */}
          <motion.div variants={fadeUp}>
            <Link
              to={user ? '/lop-hoc' : '/login'}
              className="flex flex-col h-full p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 group"
              style={{
                ...glassStyle,
                borderStyle: user ? 'solid' : 'dashed',
                borderColor: user ? '#e5d5b5' : 'rgba(229,213,181,0.5)',
                boxShadow: '0 2px 12px rgba(22,163,74,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = user ? '#16a34a' : '#6b7280'; e.currentTarget.style.boxShadow = `0 8px 28px ${user ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)'}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = user ? '#e5d5b5' : 'rgba(229,213,181,0.5)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(22,163,74,0.04)'; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                   style={{ background: `${user ? 'rgba(22,163,74' : 'rgba(107,114,128'},0.08)`, border: `1px solid ${user ? 'rgba(22,163,74' : 'rgba(107,114,128'},0.15)` }}>
                {user
                  ? <BookOpen className="w-5 h-5" style={{ color: '#16a34a' }} />
                  : <LogIn    className="w-5 h-5" style={{ color: '#6b7280' }} />
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
