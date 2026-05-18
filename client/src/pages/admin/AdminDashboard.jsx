import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  CalendarCheck, Users, BookOpen, CheckSquare, GraduationCap,
  FileText, LayoutGrid, Search, X, UserPlus, Bell, StickyNote as NoteIcon,
} from 'lucide-react';
import api from '../../services/api';
import { formatClassName } from '../../utils/formatClassName';
import {
  AddStudentModal, ExportDropdown, SendNotifyModal, StickyNote,
  QuickAttendanceModal,
} from '../../components/QuickActionWidgets';

// ── Config ngành ──────────────────────────────────────────────────────────────
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

// ── Màu áo Phụng vụ ──────────────────────────────────────────────────────────
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
  trang: { bg: 'bg-linear-to-br from-slate-50 to-gray-100 border border-gray-200', text: 'text-gray-700',    accent: 'text-gray-500',   dot: 'bg-gray-300',    label: 'Màu Trắng' },
  do:    { bg: 'bg-linear-to-br from-red-50 to-rose-100 border border-red-200',    text: 'text-red-800',     accent: 'text-red-500',    dot: 'bg-red-500',     label: 'Màu Đỏ'   },
  tim:   { bg: 'bg-linear-to-br from-purple-50 to-violet-100 border border-purple-200', text: 'text-purple-800', accent: 'text-purple-500', dot: 'bg-purple-500', label: 'Màu Tím'  },
  xanh:  { bg: 'bg-linear-to-br from-green-50 to-emerald-100 border border-green-200', text: 'text-green-800',  accent: 'text-green-500',  dot: 'bg-green-500',  label: 'Màu Xanh' },
  hong:  { bg: 'bg-linear-to-br from-pink-50 to-rose-100 border border-pink-200',  text: 'text-pink-800',    accent: 'text-pink-500',   dot: 'bg-pink-400',   label: 'Màu Hồng' },
};

// Avatar gradient
const GRADIENTS = [
  'from-red-400 to-rose-600',     'from-blue-400 to-indigo-600',
  'from-green-400 to-emerald-600','from-amber-400 to-orange-500',
  'from-purple-400 to-violet-600','from-pink-400 to-fuchsia-600',
  'from-teal-400 to-cyan-600',    'from-yellow-400 to-amber-500',
];
const avatarGradient = (name = '') =>
  GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length];

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
// Detect dark mode cho SVG (SVG không đọc được Tailwind dark: trực tiếp)
const useDark = () => document.documentElement.classList.contains('dark');

const SvgBarChart = ({ data }) => {
  const [, forceRender] = useState(0);
  useEffect(() => {
    // Re-render khi theme thay đổi để SVG cập nhật màu
    const obs = new MutationObserver(() => forceRender(n => n + 1));
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const dark = useDark();
  const gridColor  = dark ? '#334155' : '#f1f5f9';
  const tickColor  = dark ? '#64748b' : '#cbd5e1';
  const W = 280, H = 130, PAD = { top: 10, right: 8, bottom: 28, left: 28 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max    = Math.max(...data.map(d => d.value), 1);
  const barW   = Math.floor(innerW / data.length * 0.55);
  const gap    = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Y-axis ticks */}
      {[0, 0.5, 1].map(t => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill={tickColor}>
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * innerH, 2);
        const x    = PAD.left + gap * i + (gap - barW) / 2;
        const y    = PAD.top + innerH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={d.color} rx={3} opacity={0.85} />
            <text x={x + barW / 2} y={PAD.top + innerH + 14} textAnchor="middle" fontSize={9} fill={tickColor}>
              {d.label.length > 5 ? d.label.slice(0, 4) + '…' : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={9} fill={d.color} fontWeight="700">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
const SvgDonutChart = ({ data }) => {
  const R = 48, r = 30, cx = 70, cy = 60;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;

  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    const xi1 = cx + r * Math.cos(angle);
    const yi1 = cy + r * Math.sin(angle);
    angle -= sweep;
    const xi2 = cx + r * Math.cos(angle);
    const yi2 = cy + r * Math.sin(angle);
    angle += sweep;
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi1},${yi1} A${r},${r} 0 ${large},0 ${xi2},${yi2} Z`, color: d.color };
  });

  return (
    <svg viewBox="0 0 200 120" className="w-full" style={{ height: 120 }}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.88} />)}
      {/* Legend */}
      {data.map((d, i) => (
        <g key={i} transform={`translate(130, ${18 + i * 28})`}>
          <rect width={10} height={10} rx={3} fill={d.color} />
          <text x={14} y={9} fontSize={10} fill="#64748b">{d.label}</text>
          <text x={14} y={20} fontSize={9} fill="#94a3b8">{Math.round(d.value / (data.reduce((s,d)=>s+d.value,0)||1) * 100)}%</text>
        </g>
      ))}
    </svg>
  );
};


// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <Icon className="w-10 h-10 text-gray-200" strokeWidth={1.2} />
    <p className="text-sm text-gray-400 italic">{message}</p>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, to, iconCls, valCls }) => (
  <Link to={to} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition group shadow-sm dark:bg-slate-800 dark:border-slate-700">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 uppercase">{label}</p>
      <p className={`text-2xl font-black leading-tight ${valCls}`}>{value ?? '—'}</p>
    </div>
  </Link>
);

// ── Class Card ────────────────────────────────────────────────────────────────
const ClassCard = ({ lop }) => {
  const cfg = NGANH_CFG[lop.nhanh] || NGANH_CFG.ChienNon;
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md transition shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="mb-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
      </div>
      <p className="font-bold text-gray-800 text-sm leading-tight dark:text-slate-100">{formatClassName(lop.tenLop)}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        Sĩ số: <span className="text-emerald-700 font-bold">{lop.siSo ?? 0}</span>
        <span className="text-gray-400"> đoàn sinh</span>
      </p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {lop.huynhTruong?.hoTen
          ? <>HT: <span className="text-blue-600 font-medium">{lop.huynhTruong.hoTen}</span></>
          : lop.duTruong?.length > 0
            ? <>DT: <span className="text-sky-600 font-medium">{lop.duTruong.map(d => d.hoTen).join(', ')}</span></>
            : <span className="italic text-gray-300">Chưa phân công</span>
        }
      </p>
      <div className="flex gap-1.5 mt-2.5">
        <Link to={`/lop-hoc/${lop._id}`}
          className="flex-1 text-center text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 py-1 rounded transition">
          Xem
        </Link>
        <Link to="/admin/lop-hoc"
          className="flex-1 text-center text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 rounded transition">
          Phân công
        </Link>
      </div>
    </div>
  );
};

// ── Liturgy Card ──────────────────────────────────────────────────────────────
const fetchLiturgyToday = async () => {
  const dateStr = new Date().toISOString().split('T')[0];
  const month   = new Date().getMonth() + 1;
  const year    = new Date().getFullYear();
  const dd      = String(new Date().getDate()).padStart(2, '0');
  const mm      = String(month).padStart(2, '0');

  const [lcRes, feastsRes] = await Promise.allSettled([
    api.get(`/loi-chua?date=${dateStr}`),
    api.get('/liturgy/feasts', { params: { month, year } }),
  ]);

  const lc      = lcRes.value?.data?.data || null;
  const feasts  = feastsRes.value?.data?.feasts || [];
  const today   = feasts.find(f => f.ngay === `${dd}/${mm}`);
  const mauKey  = getLiturgicalColor(lc?.color || lc?.mau || lc?.liturgicalColor || '')
                  || today?.mauKey || 'xanh';

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
    queryFn:  fetchLiturgyToday,
    staleTime: 4 * 60 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse h-36 dark:bg-slate-800 dark:border-slate-700" />
  );

  const mau = MAU_AO_CARD[data?.mauKey] || MAU_AO_CARD.xanh;

  return (
    <div className={`rounded-2xl p-5 ${mau.bg} shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${mau.dot}`} />
        <p className={`text-[10px] font-black tracking-widest uppercase ${mau.accent}`}>
          Phụng Vụ Hôm Nay · {mau.label}
        </p>
      </div>
      <p className={`font-bold text-sm leading-snug mb-1 ${mau.text}`}>{data.tenLe}</p>
      {data.chuDe && (
        <p className={`text-xs italic opacity-80 mb-2 ${mau.text}`}>{data.chuDe}</p>
      )}
      {data.loiDoc && (
        <p className={`text-xs leading-relaxed line-clamp-3 opacity-70 ${mau.text}`}>
          "{data.loiDoc}"
        </p>
      )}
      <Link to="/gio-le" className={`inline-block mt-3 text-[10px] font-bold underline underline-offset-2 ${mau.accent}`}>
        Xem đầy đủ →
      </Link>
    </div>
  );
};

// ── Search Bar ────────────────────────────────────────────────────────────────
const GlobalSearch = ({ users, classes }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const debounceRef             = useRef(null);
  const wrapRef                 = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!val.trim()) { setResults([]); setOpen(false); return; }
      const q = val.toLowerCase();
      const userHits = users
        .filter(u => u.hoTen?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
        .slice(0, 4)
        .map(u => ({ type: 'user', id: u._id, label: u.hoTen, sub: u.email, to: '/admin/nguoi-dung' }));
      const classHits = classes
        .filter(c => formatClassName(c.tenLop).toLowerCase().includes(q))
        .slice(0, 3)
        .map(c => ({ type: 'class', id: c._id, label: formatClassName(c.tenLop), sub: NGANH_CFG[c.nhanh]?.label, to: `/lop-hoc/${c._id}` }));
      const combined = [...userHits, ...classHits];
      setResults(combined);
      setOpen(combined.length > 0);
    }, 220);
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm đoàn sinh, huynh trưởng, lớp..."
          className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
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
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                r.type === 'user' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}>
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

// ── Skeleton Dashboard ────────────────────────────────────────────────────────
const SkeletonDashboard = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="flex gap-3">
      <div className="h-9 flex-1 rounded-xl bg-gray-100 dark:bg-slate-700" />
      <div className="h-9 w-32 rounded-xl bg-gray-100 dark:bg-slate-700" />
      <div className="h-9 w-28 rounded-xl bg-gray-100 dark:bg-slate-700" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
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

  // kept for modal callbacks that add a student / send notification
  const refetchAll = () => {
    usersQ.refetch();
    classesQ.refetch();
    postsQ.refetch();
  };

  const byNganh = classes.reduce((acc, l) => {
    (acc[l.nhanh] = acc[l.nhanh] || []).push(l); return acc;
  }, {});

  const barData = NGANH_ORDER
    .filter(n => byNganh[n])
    .map(n => ({
      label: NGANH_CFG[n].label,
      value: byNganh[n].reduce((s, l) => s + (l.siSo ?? 0), 0),
      color: NGANH_CFG[n].barColor,
    }));

  const pieData = [
    { label: 'Đi đúng giờ',    value: 68, color: '#22c55e' },
    { label: 'Nghỉ có phép',    value: 20, color: '#eab308' },
    { label: 'Nghỉ không phép', value: 12, color: '#ef4444' },
  ];

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header: Search + Quick Actions ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <GlobalSearch users={users} classes={classes} />
        <div className="flex gap-2 flex-wrap sm:ml-auto">

          {/* Thêm Đoàn Sinh */}
          <button onClick={() => setShowAddStudent(true)}
            className="bg-linear-to-br from-blue-500 to-blue-700 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm text-xs font-semibold">
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Thêm Đoàn Sinh</span>
          </button>

          {/* Điểm danh nhanh */}
          <button onClick={() => setShowAttendance(true)}
            className="bg-linear-to-br from-green-500 to-emerald-700 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm text-xs font-semibold">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Điểm Danh Nhanh</span>
          </button>

          {/* Gửi Thông Báo */}
          <button onClick={() => setShowNotify(true)}
            className="bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm text-xs font-semibold">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Thông Báo Khẩn</span>
          </button>

          {/* Xuất Báo Cáo — dropdown */}
          <ExportDropdown classes={classes} users={users} />

          {/* Ghi Chú Nhanh */}
          <button onClick={() => setShowNote(true)}
            className="bg-linear-to-br from-yellow-400 to-amber-500 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm text-xs font-semibold">
            <NoteIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ghi Chú</span>
          </button>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <AddStudentModal
        open={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        classes={classes}
        onSuccess={refetchAll}
      />
      <QuickAttendanceModal
        open={showAttendance}
        onClose={() => setShowAttendance(false)}
        classes={classes}
      />
      <SendNotifyModal
        open={showNotify}
        onClose={() => setShowNotify(false)}
        onSuccess={refetchAll}
      />
      <StickyNote
        open={showNote}
        onClose={() => setShowNote(false)}
      />

      {/* ── 3 cột chính ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ══ CỘT 1 — NGƯỜI DÙNG ══════════════════════════════════════ */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="admin-section-title">Quản lý Người dùng</h2>
            <Link to="/admin/nguoi-dung" className="admin-compact-action inline-flex items-center justify-center whitespace-nowrap">
              + Tạo tài khoản
            </Link>
          </div>

          {/* Tabs mini */}
          <div className="flex gap-1 flex-wrap">
            {[
              { label: 'Tất cả',       filter: () => true },
              { label: 'Admin',        filter: u => u.vaiTro === 'admin' },
              { label: 'Huynh trưởng', filter: u => u.chucVu === 'huynhtruong' },
              { label: 'Dự trưởng',   filter: u => u.chucVu === 'dutruong' },
            ].map((t, i) => (
              <Link key={i} to="/admin/nguoi-dung"
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                  i === 0 ? 'bg-red-700 text-white border-red-700' : 'text-gray-500 border-gray-200 hover:border-red-300'
                }`}>
                {t.label} <span className="opacity-60">({users.filter(t.filter).length})</span>
              </Link>
            ))}
          </div>

          {/* Danh sách user */}
          <div className="flex flex-col gap-2">
            {users.length === 0 ? (
              <EmptyState icon={Users} message="Chưa có người dùng nào." />
            ) : users.slice(0, 6).map(u => {
              const vt   = VAI_TRO_CFG[u.vaiTro] || VAI_TRO_CFG.user;
              const cv   = u.chucVu ? CHUC_VU_CFG[u.chucVu] : null;
              const grad = avatarGradient(u.hoTen);
              return (
                <div key={u._id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.hoTen}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className={`w-9 h-9 rounded-full bg-linear-to-br ${grad} text-white font-bold text-sm items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}
                    style={{ display: u.avatar ? 'none' : 'flex' }}
                  >
                    {u.hoTen?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{u.hoTen}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vt.cls}`}>{vt.label}</span>
                      {cv && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cv.cls}`}>{cv.label}</span>}
                    </div>
                  </div>
                  <Link to="/admin/nguoi-dung"
                    className="shrink-0 text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg transition">
                    Sửa
                  </Link>
                </div>
              );
            })}
            {users.length > 6 && (
              <Link to="/admin/nguoi-dung" className="text-center text-xs text-red-600 hover:underline font-medium py-1">
                Xem thêm {users.length - 6} người dùng →
              </Link>
            )}
          </div>

          {/* Phụng vụ hôm nay */}
          <LiturgyCard />
        </section>

        {/* ══ CỘT 2 — LỚP HỌC ═════════════════════════════════════════ */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="admin-section-title">Quản lý Lớp học</h2>
            <Link to="/admin/lop-hoc" className="text-xs text-red-600 hover:underline font-medium">Xem tất cả →</Link>
          </div>

          {classes.length === 0 ? (
            <EmptyState icon={LayoutGrid} message="Chưa có lớp học nào." />
          ) : (
            <div className="flex flex-col gap-4">
              {NGANH_ORDER.filter(n => byNganh[n]).map(nhanh => {
                const cfg  = NGANH_CFG[nhanh];
                const lops = byNganh[nhanh];
                return (
                  <div key={nhanh}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      <p className="admin-section-title text-[10px]!">{cfg.label}</p>
                    </div>
                    <div className={`grid gap-2 ${lops.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {lops.map(lop => <ClassCard key={lop._id} lop={lop} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══ CỘT 3 — THỐNG KÊ, BIỂU ĐỒ, BÀI VIẾT ═══════════════════ */}
        <section className="flex flex-col gap-5">

          {/* Stat cards */}
          <div>
            <h2 className="admin-section-title mb-3">Tổng quan</h2>
            <div className="flex flex-col gap-2">
              <StatCard icon={LayoutGrid}    label="Lớp học"        value={stats.lopHoc}      to="/admin/lop-hoc"    iconCls="bg-blue-50 text-blue-600"      valCls="text-blue-700"   />
              <StatCard icon={GraduationCap} label="Tổng đoàn sinh" value={stats.doanSinh}    to="/admin/lop-hoc"    iconCls="bg-emerald-50 text-emerald-600" valCls="text-emerald-700" />
              <StatCard icon={CheckSquare}   label="Lớp có nhân sự" value={stats.lopCoNhanSu} to="/admin/lop-hoc"    iconCls="bg-teal-50 text-teal-600"      valCls="text-teal-700"   />
              <StatCard icon={Users}         label="Giáo lý viên"   value={stats.giaoly}      to="/admin/nguoi-dung" iconCls="bg-amber-50 text-amber-600"    valCls="text-amber-700"  />
              <StatCard icon={FileText}      label="Bài viết"       value={stats.baiviet}     to="/admin/bai-viet"   iconCls="bg-red-50 text-red-600"        valCls="text-red-700"    />
            </div>
          </div>

          {/* Bar chart: Đoàn sinh theo ngành */}
          {barData.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <p className="admin-section-title mb-3">Đoàn sinh theo Ngành</p>
              <SvgBarChart data={barData} />
            </div>
          )}

          {/* Donut chart: Tỉ lệ chuyên cần */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <p className="admin-section-title mb-1">Tỉ lệ Chuyên cần</p>
            <p className="text-[10px] text-gray-300 italic mb-2">Dữ liệu mẫu · kết nối API chuyên cần để cập nhật thật</p>
            <SvgDonutChart data={pieData} />
          </div>

          {/* Bài viết mới nhất */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="admin-section-title">Bài viết mới nhất</h2>
              <Link to="/admin/bai-viet" className="text-xs text-red-600 hover:underline font-medium">Xem tất cả →</Link>
            </div>
            {posts.length === 0 ? (
              <EmptyState icon={BookOpen} message="Chưa có bài viết hôm nay." />
            ) : (
              <div className="flex flex-col gap-2">
                {posts.map(p => (
                  <div key={p._id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate dark:text-slate-100">{p.tieuDe}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      p.daDang ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}>
                      {p.daDang ? '● Đã đăng' : '○ Nháp'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
