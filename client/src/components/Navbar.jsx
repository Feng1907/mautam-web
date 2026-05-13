import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const AVATAR_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-500','bg-yellow-400',
  'bg-purple-400','bg-pink-400','bg-indigo-400','bg-teal-400',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive
      ? 'px-4 py-2 rounded-lg text-sm font-medium text-[#D4AF37] bg-white/10 transition-all duration-200'
      : 'px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-all duration-200';

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? 'block px-3 py-2 rounded-lg text-sm font-medium text-[#D4AF37] bg-white/10 transition-all duration-200'
      : 'block px-3 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200';

  // Nav links built from t() — filtered by auth/role
  const NAV_LINKS = [
    { to: '/',        label: t('nav.home')    },
    { to: '/gio-le',  label: t('nav.liturgy') },
    { to: '/tin-tuc', label: t('nav.news')    },
    { to: '/thu-vien',label: t('nav.gallery') },
    { to: '/lich-su-cuu-do', label: 'Lịch sử' },
    { to: '/lop-hoc', label: t('nav.classes'), authRequired: true },
    { to: '/phu-huynh', label: 'Phu huynh', parentOnly: true },
    { to: '/admin',   label: t('nav.admin'),   adminOnly: true    },
  ];

  const visibleLinks = NAV_LINKS.filter(l =>
    (!l.authRequired || user) &&
    (!l.parentOnly || user?.vaiTro === 'PARENT') &&
    (!l.adminOnly || user?.vaiTro === 'admin')
  );

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#8B0000',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.40), 0 1px 0 rgba(212,175,55,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-white leading-tight shrink-0">
          <img
            src="/logos/logos doan thieu nhi MT.jpg"
            alt="Logo Xứ Đoàn Mẫu Tâm"
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ border: '2px solid rgba(212,175,55,0.6)' }}
          />
          <span className="hidden sm:flex flex-col">
            <span
              className="text-sm font-bold leading-tight tracking-wide"
              style={{ fontFamily: '"EB Garamond", Georgia, serif', color: 'white' }}
            >
              Xứ Đoàn
            </span>
            <span
              className="text-[11px] leading-tight"
              style={{ color: 'rgba(212,175,55,0.85)', fontFamily: '"Inter", system-ui, sans-serif' }}
            >
              Anrê Phú Yên · Mẫu Tâm
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: lang switcher + theme toggle + auth */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 hover:bg-red-600 rounded-lg px-2 py-1 transition"
              >
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

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
                    <p className="font-semibold text-gray-800 text-sm truncate">{user.hoTen}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/ho-so" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    {t('nav.profile')}
                  </Link>
                  <Link to="/ho-so" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    {t('nav.changePassword')}
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-white/90 hover:text-white text-sm font-medium transition">
                {t('nav.login')}
              </Link>
              <Link to="/dang-ky"
                className="bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-50 transition">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: theme toggle */}
        <ThemeToggle className="md:hidden" />

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
        <div
          className="md:hidden px-4 pt-2 pb-4 flex flex-col gap-1"
          style={{ background: '#6e0000', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {/* Language switcher + auth actions */}
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
            <div className="px-1 pb-1">
              <LanguageSwitcher />
            </div>
            {user ? (
              <>
                <Link
                  to="/ho-so"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/dang-ky"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
