import { NavLink, Outlet } from 'react-router-dom';

const MENU = [
  { to: '/admin',          label: '📊 Tổng quan',  end: true },
  { to: '/admin/bai-viet', label: '📝 Bài viết' },
  { to: '/admin/nguoi-dung', label: '👥 Người dùng' },
  { to: '/admin/lop-hoc',  label: '🏫 Lớp học' },
];

const AdminLayout = () => {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-red-700 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <main className="flex-1 page-container">
      <div className="flex gap-2 items-center mb-6">
        <span className="text-red-700 font-bold text-lg">⚙</span>
        <h1 className="text-xl font-bold text-gray-800">Trang quản trị</h1>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 w-44 shrink-0">
          {MENU.map(m => (
            <NavLink key={m.to} to={m.to} end={m.end} className={linkCls}>
              {m.label}
            </NavLink>
          ))}
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden flex gap-1 mb-4 overflow-x-auto w-full">
          {MENU.map(m => (
            <NavLink
              key={m.to} to={m.to} end={m.end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  isActive ? 'bg-red-700 text-white border-red-700' : 'text-gray-600 border-gray-300'
                }`}
            >
              {m.label}
            </NavLink>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AdminLayout;
