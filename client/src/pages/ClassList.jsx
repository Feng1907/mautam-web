import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, BookOpen, ArrowRight, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { formatClassName } from '../utils/formatClassName';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Fonts ─────────────────────────────────────────────────────────────────────
const SERIF = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';
const SANS  = '"Inter", system-ui, sans-serif';


// ── Ngành config ──────────────────────────────────────────────────────────────
const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];

const SLUG_TO_KEY = {
  'chien-non': 'ChienNon', 'au-nhi': 'AuNhi',
  'thieu-nhi': 'ThieuNhi', 'nghia-si': 'NghiaSi', 'hiep-si': 'HiepSi',
};

const NGANH_META = {
  ChienNon: {
    label: 'Chiên Non', short: 'CN',
    accent: '#ec4899',
    pill:   'bg-pink-50 border-pink-200 text-pink-700',
    strip:  'bg-pink-400',
    activeBg: 'bg-pink-500', activeBorder: 'border-pink-500',
    glow:   'rgba(236,72,153,0.15)',
    icon:   '🕊️',
  },
  AuNhi: {
    label: 'Ấu Nhi', short: 'ẤN',
    accent: '#22c55e',
    pill:   'bg-green-50 border-green-200 text-green-700',
    strip:  'bg-green-400',
    activeBg: 'bg-green-500', activeBorder: 'border-green-500',
    glow:   'rgba(34,197,94,0.15)',
    icon:   '🌿',
  },
  ThieuNhi: {
    label: 'Thiếu Nhi', short: 'TN',
    accent: '#3b82f6',
    pill:   'bg-blue-50 border-blue-200 text-blue-700',
    strip:  'bg-blue-400',
    activeBg: 'bg-blue-500', activeBorder: 'border-blue-500',
    glow:   'rgba(59,130,246,0.15)',
    icon:   '⭐',
  },
  NghiaSi: {
    label: 'Nghĩa Sĩ', short: 'NS',
    accent: '#eab308',
    pill:   'bg-yellow-50 border-yellow-200 text-yellow-700',
    strip:  'bg-yellow-400',
    activeBg: 'bg-yellow-500', activeBorder: 'border-yellow-500',
    glow:   'rgba(234,179,8,0.15)',
    icon:   '🛡️',
  },
  HiepSi: {
    label: 'Hiệp Sĩ', short: 'HS',
    accent: '#f97316',
    pill:   'bg-orange-50 border-orange-200 text-orange-700',
    strip:  'bg-orange-400',
    activeBg: 'bg-orange-500', activeBorder: 'border-orange-500',
    glow:   'rgba(249,115,22,0.15)',
    icon:   '⚔️',
  },
};

// ── Watermark SVG ─────────────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    className="fixed inset-0 w-full h-full pointer-events-none select-none opacity-[0.022] z-0"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    style={{ position: 'fixed' }}
  >
    <defs>
      <pattern id="cl-cross" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect x="54" y="20" width="12" height="80" rx="3" fill="#8B0000" />
        <rect x="28" y="40" width="64" height="12" rx="3" fill="#8B0000" />
        <circle cx="60" cy="16" r="6" fill="none" stroke="#8B0000" strokeWidth="2.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cl-cross)" />
  </svg>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
    style={{
      background: 'rgba(255,252,249,0.9)',
      borderColor: '#e5d5b5',
      backdropFilter: 'blur(4px)',
    }}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
         style={{ background: color + '22' }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold leading-tight text-[#3d1515]"
         style={{ fontFamily: SANS }}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: SANS }}>{label}</p>
    </div>
  </div>
);

// ── Class Card ────────────────────────────────────────────────────────────────
const ClassCard = ({ lop, meta }) => {
  const htName  = lop.huynhTruong?.hoTen || null;
  const dtNames = (lop.duTruong || []).map(d => d.hoTen).filter(Boolean);

  // Xác định nhân sự hiển thị theo thứ tự ưu tiên
  let nhanSuLabel, nhanSuName, NhanSuIcon;
  if (htName) {
    nhanSuLabel = 'Huynh trưởng';
    nhanSuName  = htName;
    NhanSuIcon  = UserCheck;
  } else if (dtNames.length > 0) {
    nhanSuLabel = 'Dự trưởng';
    nhanSuName  = dtNames.join(', ');
    NhanSuIcon  = Users;
  } else {
    nhanSuLabel = null;
    nhanSuName  = null;
    NhanSuIcon  = null;
  }

  return (
    <Link
      to={`/lop-hoc/${lop._id}`}
      className="group flex flex-col flex-1 overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,252,249,0.92)',
        borderColor: '#e5d5b5',
        boxShadow: '0 2px 10px rgba(139,0,0,0.04)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = meta.accent;
        e.currentTarget.style.boxShadow = `0 8px 28px ${meta.glow}, 0 2px 10px rgba(139,0,0,0.06)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5d5b5';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(139,0,0,0.04)';
      }}
    >
      {/* Dải màu + ngành */}
      <div className="relative h-2" style={{ background: meta.accent }} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Icon ngành + tên lớp */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl select-none"
            style={{ background: meta.accent + '18' }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1 ${meta.pill}`}
            >
              {meta.label}
            </span>
            <h3
              className="font-bold leading-tight text-[#3d1515] line-clamp-1"
              style={{ fontFamily: SERIF, fontSize: '1.05rem' }}
            >
              {formatClassName(lop.tenLop)}
            </h3>
          </div>
        </div>

        {/* Thông tin nhân sự */}
        <div
          className="flex flex-col gap-1.5 pt-3 border-t"
          style={{ borderColor: '#f0e0c0', fontFamily: SANS }}
        >
          {/* Nhân sự phụ trách — hiển thị HT hoặc DT hoặc trống */}
          <div className="flex items-center gap-2 text-xs">
            {NhanSuIcon
              ? <NhanSuIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              : <UserCheck  className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            }
            {nhanSuLabel
              ? <>
                  <span className="text-gray-400 shrink-0">{nhanSuLabel}:</span>
                  <span className="font-semibold text-[#5a1a1a] truncate">{nhanSuName}</span>
                </>
              : <span className="italic text-gray-300">Chưa phân công nhân sự</span>
            }
          </div>

          {/* Dự trưởng bổ sung (chỉ hiện khi đã có HT và còn DT) */}
          {htName && dtNames.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-400 shrink-0">Dự trưởng:</span>
              <span className="text-gray-600 truncate">{dtNames.join(', ')}</span>
            </div>
          )}

          {/* Sĩ số */}
          {lop.siSo != null && (
            <div className="flex items-center gap-2 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-400">Sĩ số:</span>
              <span className="font-semibold text-[#5a1a1a]">{lop.siSo} đoàn sinh</span>
            </div>
          )}
        </div>

        {/* Nút Vào lớp */}
        <div className="flex justify-end mt-auto pt-1">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full text-white transition-all group-hover:gap-2.5"
            style={{ background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}cc 100%)` }}
          >
            Vào lớp <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── Ngành Tab ─────────────────────────────────────────────────────────────────
const NganhTab = ({ nganh, count, isActive, onClick }) => {
  const m = NGANH_META[nganh];
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl border-2 transition-all font-semibold select-none min-w-20 flex-1 sm:flex-none"
      style={{
        background: isActive ? m.accent : 'rgba(255,252,249,0.85)',
        borderColor: isActive ? m.accent : '#e5d5b5',
        color: isActive ? 'white' : m.accent,
        boxShadow: isActive ? `0 4px 16px ${m.glow}` : 'none',
        transform: isActive ? 'scale(1.04)' : 'scale(1)',
        fontFamily: SANS,
      }}
    >
      <span className="text-xl leading-none mb-0.5">{m.icon}</span>
      <span className="text-[11px] font-bold tracking-tight">{m.short}</span>
      <span
        className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-medium"
        style={{
          background: isActive ? 'rgba(255,255,255,0.25)' : m.accent + '18',
          color: isActive ? 'white' : m.accent,
        }}
      >
        {count} lớp
      </span>
    </button>
  );
};

// ── Trang ClassList ───────────────────────────────────────────────────────────
const ClassList = () => {
  const { t }         = useTranslation();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [activeNganh, setActiveNganh] = useState(
    () => SLUG_TO_KEY[searchParams.get('nganh')] ?? 'ChienNon'
  );

  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byNganh = useMemo(() =>
    classes.reduce((acc, lop) => {
      (acc[lop.nhanh] = acc[lop.nhanh] || []).push(lop);
      return acc;
    }, {}),
  [classes]);

  const activeLops = byNganh[activeNganh] || [];
  const meta       = NGANH_META[activeNganh];

  // Lọc theo search trong tab hiện tại
  const filtered = useMemo(() =>
    !search.trim()
      ? activeLops
      : activeLops.filter(l =>
          [l.tenLop, l.huynhTruong?.hoTen, ...(l.duTruong || []).map(d => d.hoTen)]
            .filter(Boolean)
            .some(s => s.toLowerCase().includes(search.toLowerCase()))
        ),
  [activeLops, search]);

  // Thống kê nhanh
  const totalClasses  = classes.length;
  const totalStudents = classes.reduce((sum, l) => sum + (l.siSo ?? 0), 0);
  const hasTeacher    = classes.filter(l => l.huynhTruong?.hoTen || (l.duTruong?.length > 0)).length;

  if (loading) return <LoadingSpinner />;

  const availableNganh = NGANH_ORDER.filter(n => byNganh[n]);

  return (
    <main
      className="relative flex-1 page-container min-h-screen"
      style={{ 
        background: '#fdfbf7', 
        fontFamily: SANS,
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        fontVariantLigatures: 'none'
      }}
    >
      <CrossWatermark />

      <div className="relative z-10">

        {/* ── Header dòng 1: Tiêu đề + Search ── */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <h1
            className="text-2xl font-bold text-[#3d1515] shrink-0"
            style={{ fontFamily: SERIF }}
          >
            {t('classList.title', 'Danh sách Lớp học')}
          </h1>

          {/* Search — flex-1 để lấp đầy khoảng trống */}
          <div className="relative flex-1 min-w-52">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#D4AF37' }}
            />
            <input
              className="w-full h-10 pl-10 pr-4 text-sm bg-white/80 outline-none transition"
              style={{
                borderRadius: '9999px',
                border: '1.5px solid #e5d5b5',
                color: '#3d1515',
                fontFamily: SANS,
                backdropFilter: 'blur(4px)',
              }}
              onFocus={e => (e.target.style.borderColor = '#D4AF37')}
              onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
              placeholder="Tìm lớp, Huynh trưởng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Stat cards ── */}
        {classes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard icon={BookOpen}   label="Tổng số lớp"      value={totalClasses}  color="#8B0000" />
            <StatCard icon={Users}      label="Tổng đoàn sinh"   value={totalStudents || '—'} color="#D4AF37" />
            <StatCard icon={UserCheck}  label="Lớp có HT phụ trách" value={hasTeacher}  color="#16a34a" />
          </div>
        )}

        {/* ── Ngành tabs ── */}
        {availableNganh.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {availableNganh.map(nganh => (
              <NganhTab
                key={nganh}
                nganh={nganh}
                count={byNganh[nganh]?.length ?? 0}
                isActive={nganh === activeNganh}
                onClick={() => { setActiveNganh(nganh); setSearch(''); }}
              />
            ))}
          </div>
        )}

        {/* ── Grid lớp học ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNganh}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl block mb-4 opacity-20 select-none">✝</span>
                <p className="text-gray-400 italic" style={{ fontFamily: SERIF }}>
                  {search ? `Không tìm thấy lớp nào với "${search}"` : t('classList.noClassInGroup', 'Ngành này chưa có lớp nào.')}
                </p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              >
                {filtered.map(lop => (
                  <motion.div
                    key={lop._id}
                    className="flex flex-col"
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      show:   { opacity: 1, y: 0, transition: { duration: 0.26, ease: 'easeOut' } },
                    }}
                  >
                    <ClassCard lop={lop} meta={meta} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tổng lớp của tab đang xem */}
        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-5 italic" style={{ fontFamily: SANS }}>
            {meta.icon} {meta.label} · {filtered.length} lớp
            {search && filtered.length !== activeLops.length && ` (lọc từ ${activeLops.length})`}
          </p>
        )}
      </div>
    </main>
  );
};

export default ClassList;
