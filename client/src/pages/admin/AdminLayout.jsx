import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ChevronRight } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin',            label: 'Dashboard',      icon: '◈', end: true },
      { to: '/admin/thong-ke',   label: 'Thống kê',       icon: '📊' },
    ],
  },
  {
    label: 'Quản lý nội dung',
    items: [
      { to: '/admin/bai-viet',   label: 'Bài viết',       icon: '✦' },
      { to: '/admin/nguoi-dung',    label: 'Người dùng',     icon: '◉' },
      { to: '/admin/lop-hoc',       label: 'Lớp học',        icon: '▣' },
      { to: '/admin/phu-huynh',     label: 'Phụ huynh',      icon: '🔗' },
    ],
  },
  {
    label: 'Niên học',
    items: [
      { to: '/admin/nam-hoc',    label: 'Năm học',        icon: '📆' },
      { to: '/admin/nien-hoc',   label: 'Lên lớp',        icon: '⬆' },
      { to: '/admin/export',     label: 'Xuất Excel',     icon: '⬇' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/phan-quyen', label: 'Phân quyền',     icon: '🛡️' },
      { to: '/admin/lich-su',    label: 'Audit Logs',     icon: '🔍' },
      { to: '/admin/sao-luu',    label: 'Sao lưu',        icon: '💾' },
      { to: '/admin/su-kien',    label: 'Đếm ngược',      icon: '⏱️' },
    ],
  },
];

// Flat list for mobile tab bar (first 6 items)
const MOBILE_TABS = NAV_GROUPS.flatMap(g => g.items).slice(0, 6);

const linkCls = ({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold tracking-wide transition rounded-lg ${
    isActive
      ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
  }`;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (label) => setCollapsed(p => ({ ...p, [label]: !p[label] }));

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50 dark:bg-slate-900" style={{ paddingTop: 64 }}>
      {/* ── Sidebar dọc ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 pt-6 pb-4 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map(group => {
          const isOpen = collapsed[group.label] !== true;
          return (
            <div key={group.label} className="mb-3">
              <button
                onClick={() => toggle(group.label)}
                className="w-full flex items-center justify-between px-4 pb-1.5 text-[10px] font-black tracking-[0.18em] uppercase text-gray-300 dark:text-slate-600 hover:text-gray-400 transition"
              >
                {group.label}
                <ChevronRight size={10} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              {isOpen && (
                <div className="flex flex-col gap-0.5 px-2">
                  {group.items.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
                      <span className="text-[14px] leading-none w-4 text-center shrink-0">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex overflow-x-auto no-scrollbar">
        {MOBILE_TABS.map(m => (
          <NavLink key={m.to} to={m.to} end={m.end}
            className={({ isActive }) =>
              `flex-1 min-w-12 flex flex-col items-center py-2 gap-0.5 text-[9px] font-bold transition whitespace-nowrap ${
                isActive ? 'text-red-600' : 'text-gray-400'
              }`}>
            <span className="text-base leading-none">{m.icon}</span>
            <span className="truncate w-full text-center px-0.5">{m.label}</span>
          </NavLink>
        ))}
      </div>

      {/* ── Nội dung ── */}
      <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar p-6 pb-20 md:pb-6 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
