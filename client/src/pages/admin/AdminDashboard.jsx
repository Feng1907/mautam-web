import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  Users, CheckSquare, GraduationCap,
  FileText, LayoutGrid, Search, X, UserPlus, Bell, StickyNote as NoteIcon,
  CalendarCheck, TrendingUp, ChevronRight, ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { formatClassName } from '../../utils/formatClassName';
import {
  AddStudentModal, ExportDropdown, SendNotifyModal, StickyNote,
  QuickAttendanceModal,
} from '../../components/QuickActionWidgets';

// ── Config ngành ───────────────────────────────────────────────────────────────
const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', dot: 'bg-pink-400',   badge: 'bg-pink-50 border border-pink-200 text-pink-700',   barColor: '#ec4899' },
  AuNhi:    { label: 'Ấu Nhi',    dot: 'bg-green-500',  badge: 'bg-green-50 border border-green-200 text-green-700', barColor: '#22c55e' },
  ThieuNhi: { label: 'Thiếu Nhi', dot: 'bg-blue-500',   badge: 'bg-blue-50 border border-blue-200 text-blue-700',   barColor: '#3b82f6' },
  NghiaSi:  { label: 'Nghĩa Sĩ',  dot: 'bg-yellow-400', badge: 'bg-yellow-50 border border-yellow-200 text-yellow-700', barColor: '#eab308' },
  HiepSi:   { label: 'Hiệp Sĩ',   dot: 'bg-amber-700',  badge: 'bg-amber-50 border border-amber-200 text-amber-800',  barColor: '#b45309' },
};
const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];

const CHUC_VU_CFG = {
  huynhtruong: { label: 'Huynh trưởng', cls: 'bg-emerald-50 border border-emerald-200 text-emerald-700' },
  dutruong:    { label: 'Dự trưởng',    cls: 'bg-sky-50 border border-sky-200 text-sky-700'             },
};
const VAI_TRO_CFG = {
  admin:  { label: 'Admin',        cls: 'bg-red-50 border border-red-200 text-red-700'    },
  giaoly: { label: 'Giáo lý viên', cls: 'bg-blue-50 border border-blue-200 text-blue-700' },
  user:   { label: 'Phụ huynh',    cls: 'bg-gray-50 border border-gray-200 text-gray-600' },
};

// ── Màu áo Phụng vụ ───────────────────────────────────────────────────────────
const getLiturgicalColor = (key = '') => {
  switch (key.toLowerCase().trim()) {
    case 'white': case 'gold': case 'trang': return 'trang';
    case 'red':   case 'do':                 return 'do';
    case 'purple': case 'violet': case 'tim': return 'tim';
    case 'green': case 'xanh':               return 'xanh';
    case 'rose':  case 'hong':               return 'hong';
    default: return null;
  }
};

const MAU_AO_CARD = {
  trang: { bg: 'bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200', text: 'text-gray-700',    accent: 'text-gray-500',   dot: 'bg-gray-300',    label: 'Màu Trắng' },
  do:    { bg: 'bg-gradient-to-br from-red-50 to-rose-100 border border-red-200',    text: 'text-red-800',     accent: 'text-red-500',    dot: 'bg-red-500',     label: 'Màu Đỏ'   },
  tim:   { bg: 'bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200', text: 'text-purple-800', accent: 'text-purple-500', dot: 'bg-purple-500', label: 'Màu Tím'  },
  xanh:  { bg: 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200', text: 'text-green-800',  accent: 'text-green-500',  dot: 'bg-green-500',  label: 'Màu Xanh' },
  hong:  { bg: 'bg-gradient-to-br from-pink-50 to-rose-100 border border-pink-200',  text: 'text-pink-800',    accent: 'text-pink-500',   dot: 'bg-pink-400',   label: 'Màu Hồng' },
};

const GRADIENTS = [
  'from-red-400 to-rose-600',     'from-blue-400 to-indigo-600',
  'from-green-400 to-emerald-600','from-amber-400 to-orange-500',
  'from-purple-400 to-violet-600','from-pink-400 to-fuchsia-600',
  'from-teal-400 to-cyan-600',    'from-yellow-400 to-amber-500',
];
const avatarGradient = (name = '') =>
  GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
const useDark = () => document.documentElement.classList.contains('dark');

const SvgBarChart = ({ data }) => {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => forceRender(n => n + 1));
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const dark = useDark();
  const gridColor = dark ? '#334155' : '#f1f5f9';
  const tickColor = dark ? '#64748b' : '#cbd5e1';
  const W = 340, H = 140, PAD = { top: 10, right: 8, bottom: 28, left: 28 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max   = Math.max(...data.map(d => d.value), 1);
  const barW  = Math.floor(innerW / data.length * 0.55);
  const gap   = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 0.5, 1].map(t => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill={tickColor}>{Math.round(max * t)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * innerH, 2);
        const x = PAD.left + gap * i + (gap - barW) / 2;
        const y = PAD.top + innerH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={d.color} rx={3} opacity={0.85} />
            <text x={x + barW / 2} y={PAD.top + innerH + 14} textAnchor="middle" fontSize={9} fill={tickColor}>
              {d.label.length > 5 ? d.label.slice(0, 4) + '…' : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={9} fill={d.color} fontWeight="700">{d.value}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Donut Chart ────────────────────────────────────────────────────────────
const SvgDonutChart = ({ data }) => {
  const R = 48, r = 30, cx = 70, cy = 65;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle);
    const xi1 = cx + r * Math.cos(angle), yi1 = cy + r * Math.sin(angle);
    angle -= sweep;
    const xi2 = cx + r * Math.cos(angle), yi2 = cy + r * Math.sin(angle);
    angle += sweep;
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi1},${yi1} A${r},${r} 0 ${large},0 ${xi2},${yi2} Z`, color: d.color };
  });
  return (
    <svg viewBox="0 0 200 130" className="w-full" style={{ height: 130 }}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.88} />)}
      {data.map((d, i) => (
        <g key={i} transform={`translate(130, ${18 + i * 30})`}>
          <rect width={10} height={10} rx={3} fill={d.color} />
          <text x={14} y={9} fontSize={10} fill="#64748b">{d.label}</text>
          <text x={14} y={21} fontSize={9} fill="#94a3b8">{Math.round(d.value / (data.reduce((s,d)=>s+d.value,0)||1) * 100)}%</text>
        </g>
      ))}
    </svg>
  );
};

// ── Liturgy ────────────────────────────────────────────────────────────────────
const fetchLiturgyToday = async () => {
  const dateStr = new Date().toISOString().split('T')[0];
  const month = new Date().getMonth() + 1, year = new Date().getFullYear();
  const dd = String(new Date().getDate()).padStart(2, '0'), mm = String(month).padStart(2, '0');
  const [lcRes, feastsRes] = await Promise.allSettled([
    api.get(`/loi-chua?date=${dateStr}`),
    api.get('/liturgy/feasts', { params: { month, year } }),
  ]);
  const lc = lcRes.value?.data?.data || null;
  const feasts = feastsRes.value?.data?.feasts || [];
  const today = feasts.find(f => f.ngay === `${dd}/${mm}`);
  const mauKey = getLiturgicalColor(lc?.color || lc?.mau || lc?.liturgicalColor || '') || today?.mauKey || 'xanh';
  return {
    mauKey,
    tenLe:  lc?.name || lc?.title || lc?.liturgicalDay || today?.ten || 'Ngày Thường Niên',
    chuDe:  lc?.gospel?.title || lc?.phucam?.trich || lc?.tinmung || '',
    loiDoc: lc?.gospel?.content?.[0] || lc?.reading1 || '',
  };
};

const LiturgyCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['liturgy-today'],
    queryFn: fetchLiturgyToday,
    staleTime: 4 * 60 * 60 * 1000,
    retry: 2,
  });
  if (isLoading) return <div className="rounded-2xl p-5 h-36 animate-pulse bg-gray-100 dark:bg-slate-700" />;
  const mau = MAU_AO_CARD[data?.mauKey] || MAU_AO_CARD.xanh;
  return (
    <div className={`rounded-2xl p-5 ${mau.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${mau.dot}`} />
        <p className={`text-[10px] font-black tracking-widest uppercase ${mau.accent}`}>
          Phụng Vụ Hôm Nay · {mau.label}
        </p>
      </div>
      <p className={`font-bold text-sm leading-snug mb-1 ${mau.text}`}>{data.tenLe}</p>
      {data.chuDe && <p className={`text-xs italic opacity-80 mb-2 ${mau.text}`}>{data.chuDe}</p>}
      {data.loiDoc && <p className={`text-xs leading-relaxed line-clamp-3 opacity-70 ${mau.text}`}>"{data.loiDoc}"</p>}
      <Link to="/gio-le" className={`inline-flex items-center gap-1 mt-3 text-[10px] font-bold underline underline-offset-2 ${mau.accent}`}>
        Xem đầy đủ <ArrowRight size={10} />
      </Link>
    </div>
  );
};

// ── Global Search ──────────────────────────────────────────────────────────────
const GlobalSearch = ({ users, classes }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!val.trim()) { setResults([]); setOpen(false); return; }
      const q = val.toLowerCase();
      const userHits = users.filter(u => u.hoTen?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 4).map(u => ({ type: 'user', id: u._id, label: u.hoTen, sub: u.email, to: '/admin/nguoi-dung' }));
      const classHits = classes.filter(c => formatClassName(c.tenLop).toLowerCase().includes(q)).slice(0, 3).map(c => ({ type: 'class', id: c._id, label: formatClassName(c.tenLop), sub: NGANH_CFG[c.nhanh]?.label, to: `/lop-hoc/${c._id}` }));
      const combined = [...userHits, ...classHits];
      setResults(combined);
      setOpen(combined.length > 0);
    }, 220);
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={query} onChange={handleChange} onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm đoàn sinh, huynh trưởng, lớp..."
          className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500" />
        {query && (
          <button onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} to={r.to} onClick={clear}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition dark:hover:bg-slate-700">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${r.type === 'user' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                {r.type === 'user' ? <Users className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate dark:text-slate-100">{r.label}</p>
                <p className="text-xs text-gray-400 truncate">{r.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonDashboard = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="h-16 rounded-2xl bg-gray-100 dark:bg-slate-700" />
    <div className="grid grid-cols-5 gap-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-slate-700" />)}
    </div>
    <div className="grid grid-cols-2 gap-5">
      {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-slate-700" />)}
    </div>
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showNotify,     setShowNotify]     = useState(false);
  const [showNote,       setShowNote]       = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  const [usersQ, classesQ, postsQ] = useQueries({
    queries: [
      { queryKey: ['admin-users'],   queryFn: () => api.get('/users').then(r => r.data.data),                           staleTime: 2 * 60 * 1000, retry: 3 },
      { queryKey: ['admin-classes'], queryFn: () => api.get('/classes').then(r => r.data.data),                         staleTime: 2 * 60 * 1000, retry: 3 },
      { queryKey: ['admin-posts'],   queryFn: () => api.get('/posts', { params: { limit: 5 } }).then(r => r.data.data), staleTime: 2 * 60 * 1000, retry: 3 },
    ],
  });

  const users   = Array.isArray(usersQ.data)   ? usersQ.data   : [];
  const classes = Array.isArray(classesQ.data) ? classesQ.data : [];
  const posts   = Array.isArray(postsQ.data)   ? postsQ.data   : [];
  const loading = usersQ.isLoading || classesQ.isLoading || postsQ.isLoading;

  const stats = {
    lopHoc:      classes.length,
    giaoly:      users.filter(x => x.vaiTro === 'giaoly').length,
    baiviet:     posts.length,
    doanSinh:    classes.reduce((sum, c) => sum + (c.siSo ?? 0), 0),
    lopCoNhanSu: classes.filter(c => c.huynhTruong || c.duTruong?.length > 0).length,
  };

  const refetchAll = () => { usersQ.refetch(); classesQ.refetch(); postsQ.refetch(); };

  const byNganh = classes.reduce((acc, l) => { (acc[l.nhanh] = acc[l.nhanh] || []).push(l); return acc; }, {});

  const barData = NGANH_ORDER.filter(n => byNganh[n]).map(n => ({
    label: NGANH_CFG[n].label,
    value: byNganh[n].reduce((s, l) => s + (l.siSo ?? 0), 0),
    color: NGANH_CFG[n].barColor,
  }));

  const pieData = [
    { label: 'Đi đúng giờ',    value: 68, color: '#22c55e' },
    { label: 'Nghỉ có phép',    value: 20, color: '#eab308' },
    { label: 'Nghỉ không phép', value: 12, color: '#ef4444' },
  ];

  const STAT_CARDS = [
    { icon: LayoutGrid,    label: 'Lớp học',        value: stats.lopHoc,      to: '/admin/lop-hoc',    accent: '#3b82f6', accentBg: 'bg-blue-50 dark:bg-blue-900/20',    accentTxt: 'text-blue-600 dark:text-blue-400'    },
    { icon: GraduationCap, label: 'Tổng đoàn sinh', value: stats.doanSinh,    to: '/admin/lop-hoc',    accent: '#16a34a', accentBg: 'bg-emerald-50 dark:bg-emerald-900/20', accentTxt: 'text-emerald-600 dark:text-emerald-400' },
    { icon: CheckSquare,   label: 'Lớp có nhân sự', value: stats.lopCoNhanSu, to: '/admin/lop-hoc',    accent: '#0d9488', accentBg: 'bg-teal-50 dark:bg-teal-900/20',    accentTxt: 'text-teal-600 dark:text-teal-400'    },
    { icon: Users,         label: 'Giáo lý viên',   value: stats.giaoly,      to: '/admin/nguoi-dung', accent: '#c8960a', accentBg: 'bg-amber-50 dark:bg-amber-900/20',  accentTxt: 'text-amber-600 dark:text-amber-400'  },
    { icon: FileText,      label: 'Bài viết',        value: stats.baiviet,     to: '/admin/bai-viet',   accent: '#8b0000', accentBg: 'bg-red-50 dark:bg-red-900/20',      accentTxt: 'text-red-700 dark:text-red-400'      },
  ];

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Title + breadcrumb */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-black tracking-[0.18em] uppercase text-red-700 dark:text-red-400">Quản trị</span>
            <ChevronRight size={11} className="text-gray-300 dark:text-slate-600" />
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 dark:text-slate-500">Tổng quan</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-slate-100 leading-tight tracking-tight">
            Bảng điều khiển
          </h1>
          {user?.hoTen && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Chào mừng trở lại, <strong className="text-gray-700 dark:text-slate-200">{user.hoTen}</strong>
            </p>
          )}
        </div>

        {/* Search + actions */}
        <div className="flex flex-col gap-2 items-start sm:items-end">
          <GlobalSearch users={users} classes={classes} />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowAddStudent(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
              <UserPlus className="w-3.5 h-3.5" /> Thêm đoàn sinh
            </button>
            <button onClick={() => setShowAttendance(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition">
              <CalendarCheck className="w-3.5 h-3.5" /> Điểm danh
            </button>
            <button onClick={() => setShowNotify(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-gradient-to-br from-red-700 to-red-900 text-white shadow-sm hover:opacity-90 transition">
              <Bell className="w-3.5 h-3.5" /> Thông báo khẩn
            </button>
            <ExportDropdown classes={classes} users={users} />
            <button onClick={() => setShowNote(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
              <NoteIcon className="w-3.5 h-3.5" /> Ghi chú
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AddStudentModal open={showAddStudent} onClose={() => setShowAddStudent(false)} classes={classes} onSuccess={refetchAll} />
      <QuickAttendanceModal open={showAttendance} onClose={() => setShowAttendance(false)} classes={classes} />
      <SendNotifyModal open={showNotify} onClose={() => setShowNotify(false)} onSuccess={refetchAll} />
      <StickyNote open={showNote} onClose={() => setShowNote(false)} />

      {/* ── Stat cards — 5 cột ngang ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ icon: Icon, label, value, to, accentBg, accentTxt }) => (
          <Link key={to + label} to={to}
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm group">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg}`}>
                <Icon className={`w-4.5 h-4.5 ${accentTxt}`} size={18} />
              </div>
              <TrendingUp size={13} className="text-emerald-400 opacity-60" />
            </div>
            <div>
              <p className={`text-2xl font-black leading-none ${accentTxt}`}>{value ?? '—'}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      {barData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-gray-700 dark:text-slate-200">Đoàn sinh theo Ngành</p>
              <Link to="/admin/thong-ke" className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1">Chi tiết <ArrowRight size={11} /></Link>
            </div>
            <SvgBarChart data={barData} />
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-black text-gray-700 dark:text-slate-200 mb-1">Tỉ lệ Chuyên cần</p>
            <p className="text-[10px] text-gray-300 dark:text-slate-600 italic mb-3">Dữ liệu mẫu · kết nối API để cập nhật</p>
            <SvgDonutChart data={pieData} />
          </div>
        </div>
      )}

      {/* ── Content row: classes + users/liturgy ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Classes */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-gray-700 dark:text-slate-200">Lớp học theo Ngành</p>
            <Link to="/admin/lop-hoc" className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1">Xem tất cả <ArrowRight size={11} /></Link>
          </div>
          {classes.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-8">Chưa có lớp học nào.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {NGANH_ORDER.filter(n => byNganh[n]).map(nhanh => {
                const cfg = NGANH_CFG[nhanh];
                const lops = byNganh[nhanh];
                return (
                  <div key={nhanh}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{cfg.label}</p>
                    </div>
                    <div className={`grid gap-2 ${lops.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {lops.map(lop => (
                        <div key={lop._id}
                          className="border border-slate-100 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800/50 hover:border-current hover:shadow-sm transition group"
                          style={{ '--tw-border-opacity': 1 }}>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                          <p className="font-bold text-gray-800 dark:text-slate-100 text-sm mt-2 leading-tight">{formatClassName(lop.tenLop)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Sĩ số: <span className="text-emerald-600 font-bold">{lop.siSo ?? 0}</span></p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {lop.huynhTruong?.hoTen
                              ? <>HT: <span className="text-blue-600 font-medium">{lop.huynhTruong.hoTen}</span></>
                              : <span className="italic text-gray-300">Chưa phân công</span>}
                          </p>
                          <div className="flex gap-1.5 mt-2">
                            <Link to={`/lop-hoc/${lop._id}`} className="flex-1 text-center text-[10px] font-semibold bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 text-gray-600 dark:text-slate-300 py-1 rounded transition">Xem</Link>
                            <Link to="/admin/lop-hoc" className="flex-1 text-center text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700 dark:text-blue-400 py-1 rounded transition">Phân công</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users + Liturgy */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-gray-700 dark:text-slate-200">Người dùng gần đây</p>
              <Link to="/admin/nguoi-dung" className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1">Tất cả <ArrowRight size={11} /></Link>
            </div>
            <div className="flex flex-col gap-3">
              {users.slice(0, 5).map(u => {
                const vt = VAI_TRO_CFG[u.vaiTro] || VAI_TRO_CFG.user;
                const cv = u.chucVu ? CHUC_VU_CFG[u.chucVu] : null;
                const grad = avatarGradient(u.hoTen);
                return (
                  <div key={u._id} className="flex items-center gap-2.5">
                    {u.avatar
                      ? <img src={u.avatar} alt={u.hoTen} className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                      : null}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} text-white font-bold text-sm items-center justify-center shrink-0 ring-2 ring-white shadow-sm`} style={{ display: u.avatar ? 'none' : 'flex' }}>
                      {u.hoTen?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-slate-100 text-xs truncate">{u.hoTen}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vt.cls}`}>{vt.label}</span>
                        {cv && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cv.cls}`}>{cv.label}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {users.length > 5 && (
                <Link to="/admin/nguoi-dung" className="text-center text-xs text-red-600 hover:underline font-medium py-1">
                  Xem thêm {users.length - 5} người dùng →
                </Link>
              )}
            </div>
          </div>
          <LiturgyCard />
        </div>
      </div>

      {/* ── Posts table ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <p className="text-sm font-black text-gray-700 dark:text-slate-200">Bài viết mới nhất</p>
          <Link to="/admin/bai-viet" className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1">Xem tất cả <ArrowRight size={11} /></Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-10">Chưa có bài viết nào.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-700/30">
                <th className="text-left px-5 py-3 text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-500 w-full">Tiêu đề</th>
                <th className="text-left px-5 py-3 text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-500 whitespace-nowrap">Ngày đăng</th>
                <th className="text-left px-5 py-3 text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-500">Trạng thái</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800 dark:text-slate-200 max-w-xs truncate">{p.tieuDe}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${p.daDang ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.daDang ? 'bg-green-500' : 'bg-amber-400'}`} />
                      {p.daDang ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Link to="/admin/bai-viet" className="text-xs font-semibold text-red-600 hover:underline">Sửa</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
