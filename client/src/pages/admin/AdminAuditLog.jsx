import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Clock, Monitor, ChevronDown } from 'lucide-react';
import { SkeletonTable } from '../../components/Skeleton';
import api from '../../services/api';

// ─── Action badge ─────────────────────────────────────────────────────────────
const ACTION_META = {
  create:  { label: 'Thêm',      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',       dot: 'bg-blue-500' },
  update:  { label: 'Sửa',       bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',   dot: 'bg-amber-500' },
  delete:  { label: 'Xóa',       bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',           dot: 'bg-red-500' },
  grant:   { label: 'Cấp quyền', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',dot: 'bg-purple-500' },
  login:   { label: 'Đăng nhập', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
  export:  { label: 'Xuất',      bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',           dot: 'bg-sky-500' },
};

// ─── Role badge ───────────────────────────────────────────────────────────────
const ROLE_META = {
  admin:        { label: 'Admin',        cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
  huynhtruong:  { label: 'Huynh trưởng', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  dutruong:     { label: 'Dự trưởng',    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' },
  giaoly:       { label: 'Giáo lý viên', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  user:         { label: 'Phụ huynh',   cls: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400' },
};

const getRoleMeta = (user) => {
  if (!user) return ROLE_META.user;
  if (user.vaiTro === 'admin') return ROLE_META.admin;
  if (user.vaiTro === 'giaoly') {
    if (user.chucVu === 'huynhtruong') return ROLE_META.huynhtruong;
    if (user.chucVu === 'dutruong')    return ROLE_META.dutruong;
    return ROLE_META.giaoly;
  }
  return ROLE_META.user;
};

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ['bg-red-400','bg-blue-500','bg-emerald-500','bg-amber-400','bg-purple-500','bg-pink-400','bg-teal-500','bg-orange-400'];
const avatarBg   = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials   = (name = '') => name.split(' ').filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('');

// ─── Mock log generator seeded by user list ───────────────────────────────────
const TARGETS_BY_ROLE = {
  admin:       ['Cấu hình hệ thống', 'Năm học 2025–2026', 'Tài khoản mới', 'Quyền Huynh trưởng', 'Bài viết thông báo', 'Xuất toàn đoàn'],
  huynhtruong: ['Lớp Thiếu Nhi 1', 'Lớp Nghĩa Sĩ 2', 'Điểm danh tuần 18', 'Bảng điểm HK1', 'Đoàn sinh mới', 'Lịch lễ tuần 42'],
  dutruong:    ['Lớp Ấu Nhi 2A', 'Lớp Xưng Tội 3B', 'Điểm CC đoàn sinh', 'Bài viết sự kiện', 'Avatar đoàn sinh', 'Điểm miệng HK2'],
  giaoly:      ['Lớp Chiên Non', 'Điểm danh Chúa Nhật', 'Bảng điểm HK2', 'Email phụ huynh', 'Đoàn sinh #47', 'Lớp Thêm Sức 2'],
  user:        ['Hồ sơ cá nhân', 'Thông tin liên hệ'],
};

const buildMockLogs = (users) => {
  if (!users.length) return [];
  const actions = ['create', 'update', 'delete', 'grant', 'login', 'export'];
  return Array.from({ length: 40 }, (_, i) => {
    const user   = users[i % users.length];
    const role   = user.vaiTro === 'admin' ? 'admin' : (user.chucVu || user.vaiTro || 'user');
    const targets = TARGETS_BY_ROLE[role] ?? TARGETS_BY_ROLE.user;
    return {
      id:        i + 1,
      userId:    user._id,
      user,
      action:    actions[i % actions.length],
      target:    targets[(i * 3) % targets.length],
      ip:        `192.168.1.${10 + (i % 25)}`,
      device:    ['Chrome / Windows', 'Safari / iOS', 'Firefox / Mac', 'Chrome / Android'][i % 4],
      timestamp: new Date(Date.now() - i * 3_600_000 * (1 + (i % 3))).toISOString(),
    };
  });
};

const fmt = (iso) =>
  new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAGE_SIZE = 12;

// ─── User Avatar cell ─────────────────────────────────────────────────────────
const UserCell = ({ user, onClick }) => {
  if (!user) return <span className="text-gray-400 text-xs italic">Không rõ</span>;
  const roleMeta = getRoleMeta(user);
  return (
    <button
      onClick={() => onClick(user._id)}
      className="flex items-center gap-2.5 group text-left"
      title={`Xem hồ sơ ${user.hoTen}`}
    >
      {user.avatar ? (
        <img src={user.avatar} alt=""
          className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm shrink-0 group-hover:ring-2 group-hover:ring-red-400 transition" />
      ) : (
        <div className={`w-8 h-8 rounded-full ${avatarBg(user.hoTen)} flex items-center justify-center text-white text-[11px] font-bold shrink-0 group-hover:ring-2 group-hover:ring-red-400 transition`}>
          {initials(user.hoTen)}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 dark:text-slate-200 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-tight">
          {user.hoTen}
        </p>
        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none mt-0.5 ${roleMeta.cls}`}>
          {roleMeta.label}
        </span>
      </div>
    </button>
  );
};

// ─── User filter dropdown ─────────────────────────────────────────────────────
const UserDropdown = ({ users, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = users.find(u => u._id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-3 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-200 min-w-44"
      >
        {selected ? (
          <span className="flex-1 text-left truncate text-gray-800 dark:text-slate-200 text-[13px] font-medium">{selected.hoTen}</span>
        ) : (
          <span className="flex-1 text-left text-gray-400 dark:text-slate-500 text-[13px]">Tất cả người dùng</span>
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-3.5 py-2.5 text-[13px] text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition border-b border-gray-100 dark:border-slate-700"
          >
            Tất cả người dùng
          </button>
          <div className="max-h-52 overflow-y-auto no-scrollbar divide-y divide-gray-50 dark:divide-slate-700/50">
            {users.map(u => {
              const rm = getRoleMeta(u);
              return (
                <button key={u._id}
                  onClick={() => { onChange(u._id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition ${value === u._id ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                >
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    : <div className={`w-6 h-6 rounded-full ${avatarBg(u.hoTen)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>{initials(u.hoTen)}</div>
                  }
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 dark:text-slate-200 truncate leading-tight">{u.hoTen}</p>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${rm.cls}`}>{rm.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAuditLog() {
  const navigate = useNavigate();
  const [users, setUsers]           = useState([]);
  const [logs,  setLogs]            = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [page, setPage]             = useState(1);

  // Fetch real users, then build mock logs seeded by them
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users');
        const list = res.data?.data ?? res.data ?? [];
        setUsers(list);
        // Replace with: const logRes = await api.get('/audit-logs'); setLogs(logRes.data)
        setLogs(buildMockLogs(list));
      } catch {
        setLogs(buildMockLogs([]));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => logs.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.user?.hoTen?.toLowerCase().includes(q) || l.target.toLowerCase().includes(q);
    const matchA = !filterAction || l.action === filterAction;
    const matchU = !filterUserId || l.userId === filterUserId;
    return matchQ && matchA && matchU;
  }), [logs, search, filterAction, filterUserId]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToUser = (userId) => navigate(`/admin/nguoi-dung?highlight=${userId}`);

  const resetFilters = () => { setSearch(''); setFilterAction(''); setFilterUserId(''); setPage(1); };
  const hasFilter = search || filterAction || filterUserId;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title text-xl">Lịch sử Hoạt động</h1>
          <p className="text-sm text-gray-400 mt-0.5">Theo dõi mọi thao tác trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
          <Download size={14} />Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Text search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên hoặc đối tượng..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        {/* User dropdown */}
        <UserDropdown users={users} value={filterUserId} onChange={v => { setFilterUserId(v); setPage(1); }} />

        {/* Action filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(1); }}
            className="pl-8 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-200 appearance-none cursor-pointer"
          >
            <option value="">Tất cả hành động</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {hasFilter && (
          <button onClick={resetFilters}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition px-1">
            Xóa bộ lọc ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={8} cols={5} /> : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[130px_180px_110px_1fr_155px] gap-3 px-5 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <span>Thời gian</span>
              <span>Người thực hiện</span>
              <span>Hành động</span>
              <span>Đối tượng</span>
              <span>Thiết bị · IP</span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-700/40">
              {paged.length === 0 && (
                <p className="text-center py-14 text-sm text-gray-400">Không tìm thấy kết quả phù hợp</p>
              )}
              {paged.map(log => {
                const meta = ACTION_META[log.action] ?? ACTION_META.update;
                return (
                  <div key={log.id}
                    className="grid grid-cols-1 md:grid-cols-[130px_180px_110px_1fr_155px] gap-x-3 gap-y-1 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-slate-700/25 transition items-center">

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock size={10} className="shrink-0" />
                      {fmt(log.timestamp)}
                    </div>

                    {/* User cell — clickable */}
                    <UserCell user={log.user} onClick={goToUser} />

                    {/* Action badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold w-fit ${meta.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                      {meta.label}
                    </span>

                    {/* Target */}
                    <span className="text-[12px] text-gray-600 dark:text-slate-300 truncate">{log.target}</span>

                    {/* Device */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Monitor size={10} className="shrink-0" />
                      <span className="truncate">{log.device} · {log.ip}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination + summary */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-400">{filtered.length} kết quả</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${p === page ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-400'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
