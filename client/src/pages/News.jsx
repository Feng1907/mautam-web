import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, Bell, BellRing, LayoutGrid, ArrowRight, CalendarDays } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Constants ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { value: '',            label: 'Tất cả',          Icon: LayoutGrid  },
  { value: 'tintuc',      label: 'Tin tức',          Icon: Newspaper   },
  { value: 'thongbao',    label: 'Thông báo',        Icon: Bell        },
  { value: 'thongbaokhan',label: 'Khẩn',             Icon: BellRing    },
];

const LOAI_CFG = {
  tintuc:       { label: 'Tin tức',   pill: 'bg-sky-100 text-sky-700 border-sky-200'        },
  thongbao:     { label: 'Thông báo', pill: 'bg-gray-100 text-gray-600 border-gray-200'     },
  thongbaokhan: { label: '🔔 Khẩn',   pill: 'bg-red-100 text-red-700 border-red-200'        },
};

const SERIF  = '"EB Garamond", Lora, Georgia, serif';
const SANS   = '"Inter", system-ui, sans-serif';

// ── Watermark Thánh giá SVG ────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.028]"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
  >
    <defs>
      <pattern id="news-cross" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect x="44" y="18" width="12" height="64" rx="3" fill="#8B0000" />
        <rect x="24" y="34" width="52" height="12" rx="3" fill="#8B0000" />
        <circle cx="50" cy="14" r="5" fill="none" stroke="#8B0000" strokeWidth="2.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#news-cross)" />
  </svg>
);

// ── Hero Banner ────────────────────────────────────────────────────────────────
const HeroBanner = () => (
  <div
    className="relative overflow-hidden rounded-2xl mb-8"
    style={{
      background: 'linear-gradient(135deg, #3d0a0a 0%, #8B0000 45%, #6e1a1a 100%)',
      minHeight: '160px',
    }}
  >
    {/* Church silhouette watermark */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M100 10 L100 40 M85 25 L115 25' stroke='white' stroke-width='4' stroke-linecap='round'/%3E%3Crect x='70' y='40' width='60' height='80' fill='white'/%3E%3Cpolygon points='70,40 100,15 130,40' fill='white'/%3E%3Crect x='85' y='90' width='30' height='30' fill='%238B0000'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px',
      }}
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/10" />

    <div className="relative px-8 py-10 text-center">
      <p className="text-[#D4AF37]/80 text-xs tracking-[0.3em] uppercase mb-3 font-medium" style={{ fontFamily: SANS }}>
        Xứ Đoàn Anrê Phú Yên · Mẫu Tâm
      </p>
      <h1
        className="text-white leading-tight mb-2"
        style={{ fontFamily: SERIF, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600 }}
      >
        Tin Tức &amp; Thông Báo
      </h1>
      <p className="text-white/60 text-sm mt-2" style={{ fontFamily: SANS }}>
        Cập nhật thông tin mới nhất từ Xứ Đoàn
      </p>
    </div>
  </div>
);

// ── Post Card ──────────────────────────────────────────────────────────────────
const PostCard = ({ post }) => {
  const cfg = LOAI_CFG[post.loai] || LOAI_CFG.tintuc;

  return (
    <Link
      to={`/tin-tuc/${post._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,252,249,0.85)',
        borderColor: '#e5d5b5',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#D4AF37';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5d5b5';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,0,0,0.05)';
      }}
    >
      {/* Ảnh đại diện */}
      <div className="relative overflow-hidden bg-amber-50" style={{ aspectRatio: '16/9' }}>
        {post.anhDaiDien ? (
          <img
            src={post.anhDaiDien}
            alt={post.tieuDe}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fdf6e3, #f5e6c8)' }}
          >
            <span className="text-5xl opacity-20 select-none">✝</span>
          </div>
        )}
        {/* Badge loại */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${cfg.pill}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 p-4">
        <h2
          className="font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-[#8B0000] transition-colors"
          style={{ fontFamily: SERIF, fontSize: '1.05rem', color: '#3d1515' }}
        >
          {post.tieuDe}
        </h2>
        {post.tomTat && (
          <p
            className="text-sm text-gray-500 line-clamp-2 flex-1 mb-3"
            style={{ fontFamily: SANS }}
          >
            {post.tomTat}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#f0e0c0]/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400" style={{ fontFamily: SANS }}>
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            {post.tacGia?.hoTen && (
              <span className="ml-1 text-gray-300">· {post.tacGia.hoTen}</span>
            )}
          </div>
          <span className="text-xs text-[#8B0000] font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            Đọc <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── Trang News ─────────────────────────────────────────────────────────────────
const News = () => {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [loai,    setLoai]    = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get('/posts', { params: { loai: loai || undefined, limit: 20 } })
      .then(r => setPosts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loai]);

  return (
    <main
      className="relative flex-1 page-container min-h-screen"
      style={{ background: '#fdfbf7', fontFamily: SANS }}
    >
      <CrossWatermark />

      <div className="relative">
        <HeroBanner />

        {/* Pill filter bar */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(({ value, label, Icon }) => {
            const active = loai === value;
            return (
              <button
                key={value}
                onClick={() => setLoai(value)}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border font-medium transition-all ${
                  active
                    ? 'text-white border-[#8B0000] shadow-sm'
                    : 'text-gray-600 border-[#e5d5b5] bg-white/70 hover:border-[#D4AF37] hover:text-[#5a1a1a]'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #8B0000, #6e1a1a)' } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Danh sách bài */}
        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4 opacity-20">✝</span>
            <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>Chưa có bài viết nào.</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {posts.map(p => (
              <motion.div
                key={p._id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
                }}
              >
                <PostCard post={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default News;
