import { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, Monitor, User } from 'lucide-react';
import { SkeletonTable } from '../../components/Skeleton';
import api from '../../services/api';

// ─── Action badge config ───────────────────────────────────────────────────────
const ACTION_META = {
  create:  { label: 'Thêm',     bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',   dot: 'bg-blue-500' },
  update:  { label: 'Sửa',      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', dot: 'bg-amber-500' },
  delete:  { label: 'Xóa',      bg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',       dot: 'bg-red-500' },
  grant:   { label: 'Cấp quyền',bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400', dot: 'bg-purple-500' },
  login:   { label: 'Đăng nhập',bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
  export:  { label: 'Xuất',     bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',       dot: 'bg-sky-500' },
};

// ─── Mock data (replace với API call thực) ────────────────────────────────────
const MOCK_LOGS = Array.from({ length: 32 }, (_, i) => {
  const actions = ['create', 'update', 'delete', 'grant', 'login', 'export'];
  const targets = ['Đoàn sinh Nguyễn Văn A', 'Lớp Thiếu Nhi 1', 'Bài viết #12', 'Tài khoản glv@mautam.org', 'Bảng điểm HK1', 'Lịch lễ tuần 42'];
  const users = ['Admin Phong', 'GLV Huyền', 'Admin Tùng', 'GLV Linh'];
  const d = new Date(Date.now() - i * 3600000 * (1 + Math.random() * 4));
  return {
    id: i + 1,
    timestamp: d.toISOString(),
    user: users[i % users.length],
    userInitial: users[i % users.length].split(' ').pop()[0],
    action: actions[i % actions.length],
    target: targets[i % targets.length],
    ip: `192.168.1.${10 + (i % 20)}`,
    device: ['Chrome / Windows', 'Safari / iOS', 'Firefox / Mac', 'Chrome / Android'][i % 4],
  };
});

const PAGE_SIZE = 12;

const fmt = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const AVATAR_COLORS = ['bg-red-400','bg-blue-400','bg-emerald-500','bg-amber-400','bg-purple-400','bg-pink-400'];
const avatarBg = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    // Simulate API delay — replace with: api.get('/audit-logs')
    const t = setTimeout(() => { setLogs(MOCK_LOGS); setLoading(false); }, 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.user.toLowerCase().includes(q) || l.target.toLowerCase().includes(q);
    const matchA = !filterAction || l.action === filterAction;
    return matchQ && matchA;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Lịch sử Hoạt động</h1>
          <p className="text-sm text-gray-400 mt-0.5">Theo dõi mọi thao tác trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
          <Download size={15} />Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên người dùng hoặc đối tượng..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(1); }}
            className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-200 appearance-none"
          >
            <option value="">Tất cả hành động</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={8} cols={5} /> : (
          <>
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[auto_160px_120px_1fr_160px] gap-4 px-5 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span>Thời gian</span>
              <span>Người thực hiện</span>
              <span>Hành động</span>
              <span>Đối tượng</span>
              <span>Thiết bị / IP</span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {paged.length === 0 && (
                <p className="text-center py-12 text-sm text-gray-400">Không tìm thấy kết quả</p>
              )}
              {paged.map(log => {
                const meta = ACTION_META[log.action] ?? ACTION_META.update;
                return (
                  <div key={log.id}
                    className="grid grid-cols-1 md:grid-cols-[auto_160px_120px_1fr_160px] gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition text-sm items-center">
                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-gray-400 text-[12px] min-w-36">
                      <Clock size={11} />
                      {fmt(log.timestamp)}
                    </div>
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarBg(log.user)}`}>
                        {log.userInitial}
                      </div>
                      <span className="text-gray-700 dark:text-slate-200 truncate font-medium text-[12px]">{log.user}</span>
                    </div>
                    {/* Action badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                    {/* Target */}
                    <span className="text-gray-600 dark:text-slate-300 text-[12px] truncate">{log.target}</span>
                    {/* Device */}
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Monitor size={11} />
                      <span className="truncate">{log.device} · {log.ip}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-400">{filtered.length} kết quả</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
