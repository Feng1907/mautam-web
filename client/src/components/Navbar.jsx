import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const NAV_LINKS = [
  { to: '/',         label: 'Trang chủ' },
  { to: '/gio-le',   label: 'Giờ lễ' },
  { to: '/tin-tuc',  label: 'Tin tức' },
  { to: '/lop-hoc',  label: 'Lớp học',   authRequired: true },
  { to: '/admin',    label: '⚙ Quản trị', adminOnly: true },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-red-300' : 'text-white/90 hover:text-white'}`;

  return (
    <header className="bg-red-700 shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-base leading-tight">
          <span className="text-2xl">✝</span>
          <span className="hidden sm:block">Xứ Đoàn<br/><span className="text-xs font-normal opacity-80">Anrê Phú Yên – Mẫu Tâm</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.filter(l =>
  (!l.authRequired || user) &&
  (!l.adminOnly || user?.vaiTro === 'admin')
).map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/80 text-sm">{user.hoTen}</span>
              <button onClick={handleLogout} className="btn-ghost text-white! border-white/40! py-1! px-3! text-xs!">
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-ghost text-white! border-white/40! py-1! px-3! text-xs!">
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-red-800 px-4 pb-4 flex flex-col gap-3">
          {NAV_LINKS.filter(l =>
  (!l.authRequired || user) &&
  (!l.adminOnly || user?.vaiTro === 'admin')
).map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user
            ? <button onClick={handleLogout} className="text-left text-white/80 text-sm">Đăng xuất</button>
            : <Link to="/login" className="text-white/80 text-sm" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
          }
        </div>
      )}
    </header>
  );
};

export default Navbar;
