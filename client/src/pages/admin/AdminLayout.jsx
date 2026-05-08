import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
  const { t } = useTranslation();

  const MENU = [
    { to: '/admin',            labelKey: 'admin.menu.overview',   icon: '◈', end: true },
    { to: '/admin/bai-viet',   labelKey: 'admin.menu.posts',      icon: '✦' },
    { to: '/admin/nguoi-dung', labelKey: 'admin.menu.users',      icon: '◉' },
    { to: '/admin/lop-hoc',    labelKey: 'admin.menu.classes',    icon: '▣' },
    { to: '/admin/nam-hoc',    labelKey: 'admin.menu.schoolYear', icon: '📆' },
    { to: '/admin/nien-hoc',   labelKey: 'admin.menu.promotion',  icon: '⬆' },
    { to: '/admin/thong-ke',   labelKey: 'admin.menu.stats',      icon: '📊' },
    { to: '/admin/export',     labelKey: 'admin.menu.export',     icon: '⬇' },
  ];

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-widest transition rounded-lg ${
      isActive
        ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
    }`;

  return (
    <div className="flex-1 flex min-h-0 bg-gray-50 dark:bg-slate-900">
      {/* Sidebar dọc */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 bg-white border-r border-gray-100 pt-8 pb-4 gap-0.5 dark:bg-slate-800 dark:border-slate-700">
        <p className="px-4 pb-3 text-[10px] font-black tracking-[0.2em] text-gray-300 dark:text-slate-600 uppercase">
          Menu
        </p>
        {MENU.map(m => (
          <NavLink key={m.to} to={m.to} end={m.end} className={linkCls}>
            <span className="text-base leading-none">{m.icon}</span>
            {t(m.labelKey)}
          </NavLink>
        ))}
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex dark:bg-slate-800 dark:border-slate-700">
        {MENU.map(m => (
          <NavLink key={m.to} to={m.to} end={m.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-bold transition ${
                isActive ? 'text-red-600' : 'text-gray-400'
              }`}>
            <span className="text-lg leading-none">{m.icon}</span>
            <span className="truncate w-full text-center px-1">{t(m.labelKey)}</span>
          </NavLink>
        ))}
      </div>

      {/* Vùng nội dung */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6 pb-20 md:pb-6 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
