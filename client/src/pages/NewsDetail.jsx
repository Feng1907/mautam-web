import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CalendarDays, Clock, User } from 'lucide-react';
import api from '../services/api';
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from '../utils/seo';

// ── Font constants ─────────────────────────────────────────────────────────────
const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS  = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

// ── Category config ────────────────────────────────────────────────────────────
const LOAI_CFG = {
  tintuc:       { label: 'Tin tức',   pill: 'bg-sky-100/90 text-sky-700 border-sky-200'         },
  thongbao:     { label: 'Thông báo', pill: 'bg-white/90 text-gray-600 border-gray-200'          },
  thongbaokhan: { label: '🔔 Khẩn',   pill: 'bg-red-100/90 text-red-700 border-red-200'          },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

const readingTime = (html = '') => {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180)) + ' phút đọc';
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonArticle = () => (
  <main className="flex-1 page-container max-w-3xl" style={{ fontFamily: SANS }}>
    <div className="animate-pulse">
      {/* breadcrumb */}
      <div className="h-4 w-28 rounded-full bg-gray-200 mb-6" />
      {/* hero image */}
      <div className="w-full rounded-2xl bg-gray-200 mb-7" style={{ aspectRatio: '16/7' }} />
      {/* category + title */}
      <div className="h-5 w-20 rounded-full bg-gray-200 mb-4" />
      <div className="h-9 w-4/5 rounded-lg bg-gray-300 mb-2" />
      <div className="h-9 w-3/5 rounded-lg bg-gray-200 mb-6" />
      {/* meta bar */}
      <div className="flex gap-3 mb-8">
        <div className="h-4 w-24 rounded-full bg-gray-200" />
        <div className="h-4 w-20 rounded-full bg-gray-200" />
        <div className="h-4 w-16 rounded-full bg-gray-200" />
      </div>
      {/* body lines */}
      {[100, 90, 95, 80, 100, 70, 88].map((w, i) => (
        <div key={i} className={`h-4 rounded-full bg-gray-100 mb-3`} style={{ width: `${w}%` }} />
      ))}
    </div>
  </main>
);

// ── Reading progress bar ───────────────────────────────────────────────────────
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 origin-left z-50"
      style={{ scaleX, background: 'linear-gradient(to right, #8B0000, #D4AF37)' }}
    />
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const NewsDetail = () => {
  const { id } = useParams();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}`).then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
    retry: 3,
  });

  if (isLoading) return <SkeletonArticle />;

  if (isError || !post) return (
    <main className="flex-1 page-container max-w-3xl flex flex-col items-center justify-center py-24">
      <span className="text-5xl mb-4 opacity-20 select-none">✝</span>
      <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>
        Không tìm thấy bài viết.
      </p>
      <Link to="/tin-tuc"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline">
        <ChevronLeft size={15} /> Quay lại tin tức
      </Link>
    </main>
  );

  const ogImage  = toAbsoluteUrl(post.anhNen || post.anhDaiDien) || DEFAULT_OG_IMAGE;
  const loaiCfg  = LOAI_CFG[post.loai] ?? LOAI_CFG.tintuc;
  const minutes  = readingTime(post.noiDung || '');

  return (
    <>
      <ReadingProgress />

      <main
        className="flex-1 page-container max-w-3xl"
        style={{ fontFamily: SANS, background: '#fdfbf7' }}
      >
        <Helmet>
          <title>{post.tieuDe} | Mẫu Tâm</title>
          <meta property="og:title"       content={post.tieuDe} />
          <meta property="og:description" content={post.tomTat || ''} />
          <meta property="og:image"       content={ogImage} />
          <meta property="og:type"        content="article" />
        </Helmet>

        {/* Breadcrumb */}
        <Link
          to="/tin-tuc"
          className="inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline mb-6 group"
        >
          <ChevronLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Tin tức &amp; Thông báo
        </Link>

        {/* Hero image */}
        {post.anhDaiDien ? (
          <motion.div
            className="w-full overflow-hidden rounded-2xl mb-7 shadow-md"
            style={{ aspectRatio: '16/7' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <img
              src={post.anhDaiDien}
              alt={post.tieuDe}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <motion.div
            className="w-full overflow-hidden rounded-2xl mb-7 flex items-center justify-center"
            style={{
              aspectRatio: '16/7',
              background: 'linear-gradient(135deg, #3d0a0a 0%, #4A0000 50%, #350808 100%)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <span className="text-white/10 text-9xl select-none">✝</span>
          </motion.div>
        )}

        {/* Category badge */}
        <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-sm mb-4 ${loaiCfg.pill}`}>
          {loaiCfg.label}
        </span>

        {/* Title */}
        <motion.h1
          className="leading-tight mb-5 text-[#3d1515]"
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontVariantLigatures: 'none',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {post.tieuDe}
        </motion.h1>

        {/* Meta bar */}
        <div
          className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pb-5 mb-7 border-b"
          style={{ borderColor: '#f0e0c0', fontFamily: SANS }}
        >
          {post.tacGia?.hoTen && (
            <span className="flex items-center gap-1.5 font-medium text-[#5a1a1a]">
              <User size={13} className="text-[#D4AF37]" />
              {post.tacGia.hoTen}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays size={12} />
            {fmtDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {minutes}
          </span>
        </div>

        {/* Summary (if present) */}
        {post.tomTat && (
          <p
            className="text-base leading-relaxed italic text-gray-500 border-l-4 pl-4 mb-7"
            style={{ borderColor: '#D4AF37', fontFamily: SERIF }}
          >
            {post.tomTat}
          </p>
        )}

        {/* Article body */}
        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: post.noiDung }}
        />

        {/* Footer divider */}
        <div className="mt-10 pt-6 border-t flex items-center gap-3" style={{ borderColor: '#f0e0c0' }}>
          <span className="text-[#D4AF37] text-lg select-none">✝</span>
          <span className="text-xs text-gray-300" style={{ fontFamily: SANS }}>
            Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
          </span>
        </div>

        {/* Back link */}
        <Link
          to="/tin-tuc"
          className="inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline mt-5 group"
        >
          <ChevronLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Xem tất cả tin tức
        </Link>
      </main>
    </>
  );
};

export default NewsDetail;
