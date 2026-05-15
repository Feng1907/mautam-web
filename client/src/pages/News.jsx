import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Bell, BellRing, LayoutGrid, ArrowRight, CalendarDays, Clock } from 'lucide-react';
import api from '../services/api';
import { SkeletonNewsFeed } from '../components/Skeleton';
import { DEFAULT_OG_IMAGE } from '../utils/seo';

// ─── Font constants ───────────────────────────────────────────────────────────
const SERIF   = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS    = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

// ─── Filter config ────────────────────────────────────────────────────────────
const FILTERS = [
  { value: '',             label: 'Tất cả',   Icon: LayoutGrid },
  { value: 'tintuc',       label: 'Tin tức',  Icon: Newspaper  },
  { value: 'thongbao',     label: 'Thông báo',Icon: Bell       },
  { value: 'thongbaokhan', label: 'Khẩn',     Icon: BellRing   },
];

const LOAI_CFG = {
  tintuc:       { label: 'Tin tức',    pill: 'bg-sky-100/90 text-sky-700 border-sky-200',         grad: 'from-sky-900/40 to-blue-950/60' },
  thongbao:     { label: 'Thông báo',  pill: 'bg-white/90 text-gray-600 border-gray-200',         grad: 'from-gray-800/40 to-slate-900/60' },
  thongbaokhan: { label: '🔔 Khẩn',    pill: 'bg-red-100/90 text-red-700 border-red-200',         grad: 'from-red-900/60 to-rose-950/80' },
};
const defaultCfg = LOAI_CFG.tintuc;

// Gradient placeholders khi không có ảnh — theo từng loại
const PLACEHOLDER_GRADS = {
  tintuc:       'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
  thongbao:     'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
  thongbaokhan: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
  _default:     'linear-gradient(135deg, #3d1515 0%, #5c1e1e 50%, #3a0a0a 100%)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

const readingTime = (text = '') => {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180)) + ' phút đọc';
};

// ─── SVG pattern overlay (thánh giá mảnh) ────────────────────────────────────
const CrossPattern = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.04]"
    xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <pattern id="nc-cross" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect x="36.5" y="16" width="7" height="48" rx="2" fill="white" />
        <rect x="20" y="28" width="40" height="7" rx="2" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#nc-cross)" />
  </svg>
);

// ─── Hero Banner ──────────────────────────────────────────────────────────────
const HeroBanner = () => (
  <div className="relative overflow-hidden rounded-2xl mb-8" style={{ minHeight: 172 }}>
    {/* Mesh gradient background */}
    <div className="absolute inset-0" style={{
      background: `
        radial-gradient(ellipse at 15% 10%,  #8B0000 0%, transparent 55%),
        radial-gradient(ellipse at 85% 90%,  #4A0000 0%, transparent 55%),
        radial-gradient(ellipse at 75% 10%,  #6B0000 0%, transparent 40%),
        radial-gradient(ellipse at 20% 90%,  #5c1010 0%, transparent 45%),
        linear-gradient(145deg, #3d0a0a 0%, #4A0000 50%, #350808 100%)
      `,
    }} />

    {/* Pattern overlay */}
    <CrossPattern />

    {/* Vignette edges */}
    <div className="absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/25" />

    <div className="relative px-8 py-11 text-center">
      <p className="text-[#D4AF37]/75 text-[11px] tracking-[0.35em] uppercase mb-3 font-medium"
        style={{ fontFamily: SANS }}>
        Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
      </p>
      <h1 className="text-white leading-tight mb-2.5"
        style={{ fontFamily: SERIF, fontSize: 'clamp(1.65rem, 4vw, 2.5rem)', fontWeight: 700,
          letterSpacing: '-0.01em', fontVariantLigatures: 'none' }}>
        Tin Tức &amp; Thông Báo
      </h1>
      <p className="text-white/52 text-[13px] tracking-wide"
        style={{ fontFamily: SANS, fontWeight: 400, letterSpacing: '0.04em' }}>
        Cập nhật thông tin mới nhất từ Xứ Đoàn
      </p>
    </div>
  </div>
);

// ─── Featured Post (1st post, full-width horizontal) ─────────────────────────
const FeaturedCard = ({ post }) => {
  const cfg = LOAI_CFG[post.loai] ?? defaultCfg;
  const grad = PLACEHOLDER_GRADS[post.loai] ?? PLACEHOLDER_GRADS._default;
  const summary = post.tomTat || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mb-6"
    >
      <Link to={`/tin-tuc/${post._id}`}
        className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
        style={{
          background: 'rgba(255,252,249,0.9)',
          borderColor: '#e5d5b5',
          boxShadow: '0 2px 16px rgba(139,0,0,0.06)',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,0,0,0.14)'; e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(139,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.transform = ''; }}
      >
        {/* Image */}
        <div className="relative overflow-hidden sm:w-2/5 shrink-0" style={{ aspectRatio: '16/9' }}>
          {post.anhDaiDien ? (
            <img src={post.anhDaiDien} alt={post.tieuDe} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: grad }}>
              <span className="text-6xl opacity-15 select-none text-white">✝</span>
            </div>
          )}
          <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${cfg.pill}`}>
            {cfg.label}
          </span>
          {/* Featured badge */}
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#3d1515] uppercase tracking-wide">
            Nổi bật
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 sm:p-6 justify-center">
          <h2 className="font-bold leading-snug mb-3 line-clamp-2 group-hover:text-[#8B0000] transition-colors"
            style={{ fontFamily: SERIF, fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: '#3d1515',
              fontWeight: 700, fontVariantLigatures: 'none' }}>
            {post.tieuDe}
          </h2>
          {summary && (
            <p className="text-sm leading-relaxed line-clamp-3 mb-4"
              style={{ fontFamily: SANS, color: '#4A5568' }}>
              {summary}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0e0c0]/60">
            <div className="flex items-center gap-3 text-xs text-gray-400" style={{ fontFamily: SANS }}>
              <span className="flex items-center gap-1"><CalendarDays size={12} />{fmtDate(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{readingTime(summary + ' ' + post.tieuDe)}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8B0000] bg-[#8B0000]/8 px-3 py-1.5 rounded-full group-hover:bg-[#8B0000] group-hover:text-white transition-all duration-200">
              Đọc ngay <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Post Card (regular grid) ─────────────────────────────────────────────────
const PostCard = ({ post, index }) => {
  const cfg  = LOAI_CFG[post.loai] ?? defaultCfg;
  const grad = PLACEHOLDER_GRADS[post.loai] ?? PLACEHOLDER_GRADS._default;
  const summary = post.tomTat || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.38, ease: 'easeOut', delay: (index % 3) * 0.07 }}
    >
      <Link to={`/tin-tuc/${post._id}`}
        className="group flex flex-col overflow-hidden rounded-2xl border h-full transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
        style={{
          background: 'rgba(255,252,249,0.9)',
          borderColor: '#e5d5b5',
          boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 40px rgba(139,0,0,0.13)'; e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5d5b5'; e.currentTarget.style.transform = ''; }}
      >
        {/* Thumbnail 16:9 */}
        <div className="relative overflow-hidden bg-amber-50/50" style={{ aspectRatio: '16/9' }}>
          {post.anhDaiDien ? (
            <img src={post.anhDaiDien} alt={post.tieuDe} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: grad }}>
              <span className="text-5xl opacity-12 select-none text-white">✝</span>
            </div>
          )}
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${cfg.pill}`}>
            {cfg.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <h2 className="font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-[#8B0000] transition-colors"
            style={{ fontFamily: SERIF, fontSize: '1rem', color: '#3d1515',
              fontWeight: 600, fontVariantLigatures: 'none' }}>
            {post.tieuDe}
          </h2>
          {summary && (
            <p className="text-[13px] leading-relaxed line-clamp-2 flex-1 mb-3"
              style={{ fontFamily: SANS, color: '#4A5568' }}>
              {summary}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#f0e0c0]/50">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-[11px] text-gray-400" style={{ fontFamily: SANS }}>
                <CalendarDays size={10} />{fmtDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-300" style={{ fontFamily: SANS }}>
                <Clock size={9} />{readingTime(summary + ' ' + post.tieuDe)}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8B0000] bg-[#8B0000]/8 px-2.5 py-1 rounded-full group-hover:bg-[#8B0000] group-hover:text-white transition-all duration-200 shrink-0">
              Đọc <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function News() {
  const [loai, setLoai] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', loai],
    queryFn: () => api.get('/posts', { params: { loai: loai || undefined, limit: 20 } }).then(r => r.data.data),
  });

  const posts = data || [];
  const [featured, ...rest] = posts;

  return (
    <main className="relative flex-1 page-container min-h-screen bg-page" style={{ fontFamily: SANS }}>
      <Helmet>
        <title>Tin Tức | Mẫu Tâm</title>
        <meta property="og:title" content="Tin Tức | Mẫu Tâm" />
        <meta property="og:description" content="Tin tức và thông báo mới nhất từ Xứ Đoàn Anrê Phú Yên – Mẫu Tâm." />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <HeroBanner />

      {/* Pill filter bar */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {FILTERS.map(({ value, label, Icon }) => {
          const active = loai === value;
          return (
            <button key={value} onClick={() => setLoai(value)}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border font-medium transition-all duration-200 ${
                active
                  ? 'text-white border-[#8B0000] shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 border-[#e5d5b5] dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 hover:border-[#D4AF37] hover:text-[#5a1a1a] dark:hover:text-amber-300'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #8B0000, #5a1010)', fontFamily: SANS } : { fontFamily: SANS }}>
              <Icon size={13} />{label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {isLoading ? (
        <SkeletonNewsFeed />
      ) : isError ? (
        <div className="text-center py-24">
          <span className="text-5xl block mb-4 opacity-20">✝</span>
          <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>Không tải được bài viết. Vui lòng thử lại.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-5xl block mb-4 opacity-20">✝</span>
          <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>Chưa có bài viết nào.</p>
        </div>
      ) : (
        <>
          {/* Featured post */}
          {featured && <FeaturedCard post={featured} />}

          {/* Grid 3 cột */}
          {rest.length > 0 && (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <PostCard key={p._id} post={p} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
