import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, FileText, Users, BookOpen,
  Link2, Calendar, GraduationCap, Download, Shield,
  History, HardDrive, Timer, ChevronRight, MoreHorizontal, X, ClipboardList,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin',            label: 'Dashboard',   Icon: LayoutDashboard, end: true },
      { to: '/admin/thong-ke',   label: 'Thống kê',    Icon: BarChart3 },
    ],
  },
  {
    label: 'Quản lý nội dung',
    items: [
      { to: '/admin/bai-viet',   label: 'Bài viết',    Icon: FileText   },
      { to: '/admin/nguoi-dung', label: 'Người dùng',  Icon: Users      },
      { to: '/admin/lop-hoc',    label: 'Lớp học',     Icon: BookOpen   },
      { to: '/admin/phu-huynh',  label: 'Phụ huynh',   Icon: Link2      },
      { to: '/admin/phan-cong',  label: 'Phân công',   Icon: ClipboardList },
      { to: '/admin/quiz',       label: 'Kiểm tra',    Icon: ClipboardList },
    ],
  },
  {
    label: 'Niên học',
    items: [
      { to: '/admin/nam-hoc',    label: 'Năm học',     Icon: Calendar        },
      { to: '/admin/nien-hoc',   label: 'Lên lớp',     Icon: GraduationCap   },
      { to: '/admin/export',     label: 'Xuất Excel',  Icon: Download        },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/phan-quyen', label: 'Phân quyền',  Icon: Shield    },
      { to: '/admin/lich-su',    label: 'Audit Logs',  Icon: History   },
      { to: '/admin/sao-luu',    label: 'Sao lưu',     Icon: HardDrive },
      { to: '/admin/su-kien',    label: 'Đếm ngược',   Icon: Timer     },
    ],
  },
];

const ALL_ITEMS   = NAV_GROUPS.flatMap(g => g.items);
const MOBILE_TABS = ALL_ITEMS.slice(0, 5);    // first 5 + "More" button = 6 slots
const MORE_ITEMS  = ALL_ITEMS.slice(5);

const linkCls = ({ isActive }) =>
  `group flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold tracking-wide rounded-lg transition-all relative ${
    isActive
      ? 'text-[#8B0000] bg-red-50 dark:text-red-400 dark:bg-red-950/50'
      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
  }`;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState({});
  const [moreOpen,  setMoreOpen]  = useState(false);
  const toggle = (label) => setCollapsed(p => ({ ...p, [label]: !p[label] }));

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50 dark:bg-slate-900" style={{ paddingTop: 64 }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 overflow-y-auto no-scrollbar">

        {/* Brand header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#8B0000] to-[#5a1010] flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-xs font-black select-none">MT</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-[#3d1515] dark:text-slate-100 leading-tight truncate">
                Quản trị Mẫu Tâm
              </p>
              <p className="text-[9px] text-gray-400 dark:text-slate-500 truncate">
                Xứ Đoàn Anrê Phú Yên
              </p>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <div className="flex-1 py-3">
          {NAV_GROUPS.map(group => {
            const isOpen = collapsed[group.label] !== true;
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggle(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[9px] font-black tracking-[0.18em] uppercase text-gray-300 dark:text-slate-600 hover:text-gray-400 transition"
                >
                  {group.label}
                  <ChevronRight size={9} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-0.5 px-2 pb-1">
                        {group.items.map(item => (
                          <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
                            {({ isActive }) => (
                              <>
                                {/* Active left border */}
                                {isActive && (
                                  <motion.span
                                    layoutId="sidebar-indicator"
                                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#8B0000]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                  />
                                )}
                                <item.Icon
                                  size={14}
                                  className={`shrink-0 transition-colors ${isActive ? 'text-[#8B0000]' : 'text-gray-300 group-hover:text-gray-500'}`}
                                />
                                {item.label}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex">
        {MOBILE_TABS.map(m => (
          <NavLink key={m.to} to={m.to} end={m.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[9px] font-bold transition ${
                isActive ? 'text-[#8B0000]' : 'text-gray-400'
              }`}>
            <m.Icon size={18} strokeWidth={isActive => isActive ? 2.2 : 1.8} />
            <span className="truncate w-full text-center px-0.5">{m.label}</span>
          </NavLink>
        ))}

        {/* More button */}
        {MORE_ITEMS.length > 0 && (
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-[9px] font-bold text-gray-400"
          >
            <MoreHorizontal size={18} strokeWidth={1.8} />
            <span>Thêm</span>
          </button>
        )}
      </div>

      {/* ── Mobile More drawer ── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl pb-safe"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">Menu quản trị</p>
                <button onClick={() => setMoreOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {MORE_ITEMS.map(item => (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1.5 p-3 rounded-xl text-[11px] font-semibold text-center transition ${
                        isActive
                          ? 'bg-red-50 text-[#8B0000] dark:bg-red-950/50 dark:text-red-400'
                          : 'bg-gray-50 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                    <item.Icon size={20} strokeWidth={1.8} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar p-6 pb-20 md:pb-6 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
