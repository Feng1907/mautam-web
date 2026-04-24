import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const NAV_LINKS = [
  { to: '/',        label: 'Trang chủ' },
  { to: '/gio-le',  label: 'Giờ lễ' },
  { to: '/tin-tuc', label: 'Tin tức' },
  { to: '/lop-hoc', label: 'Lớp học',   authRequired: true },
  { to: '/admin',   label: '⚙ Quản trị', adminOnly: true },
];

const AVATAR_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-500','bg-yellow-400',
  'bg-purple-400','bg-pink-400','bg-indigo-400','bg-teal-400',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-red-300' : 'text-white/90 hover:text-white'}`;

  const visibleLinks = NAV_LINKS.filter(l =>
    (!l.authRequired || user) && (!l.adminOnly || user?.vaiTro === 'admin')
  );

  return (
    <header className="bg-red-700 shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-base leading-tight">
          <img
            src="/logos/logos doan thieu nhi MT.jpg"
            alt="Logo Xứ Đoàn Mẫu Tâm"
            className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shrink-0"
          />
          <span className="hidden sm:block">
            Xứ Đoàn
            <span className="block text-xs font-normal opacity-80">Anrê Phú Yên – Mẫu Tâm</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropRef}>
              {/* Nút user — click mở dropdown */}
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 hover:bg-red-600 rounded-lg px-2 py-1 transition"
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img src={user.avatar} alt=""
                    className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
                ) : (
                  <div className={`w-7 h-7 rounded-full ${avatarColor(user.hoTen)} border-2 border-white/50 flex items-center justify-center text-white text-xs font-bold`}>
                    {user.hoTen?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="text-white/90 text-sm font-medium max-w-30 truncate">
                  {user.hoTen}
                </span>
                <svg className={`w-3 h-3 text-white/60 transition ${dropOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
                    <p className="font-semibold text-gray-800 text-sm truncate">{user.hoTen}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {/* Items */}
                  <Link to="/ho-so" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Hồ sơ cá nhân
                  </Link>
                  <Link to="/ho-so" onClick={() => { setDropOpen(false); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    Đổi mật khẩu
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-white/90 hover:text-white text-sm font-medium transition">
                Đăng nhập
              </Link>
              <Link to="/dang-ky"
                className="bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-50 transition">
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
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
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/ho-so" className="text-white/80 text-sm" onClick={() => setMenuOpen(false)}>
                👤 Hồ sơ cá nhân
              </Link>
              <button onClick={handleLogout} className="text-left text-white/80 text-sm">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/80 text-sm" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/dang-ky" className="text-white/80 text-sm" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
