import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Home, Images, LayoutDashboard, MessageCircle, Newspaper, UserRound, UsersRound } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

const AVATAR_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-500','bg-yellow-400',
  'bg-purple-400','bg-pink-400','bg-indigo-400','bg-teal-400',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  // Chỉ dùng hiệu ứng transparent trên trang Home
  const isHome = location.pathname === '/';

  // Scroll listener — chuyển sang solid khi cuộn > 10px
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const h = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Đóng menu/dropdown khi bấm Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); setDropOpen(false); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  // ── Style theo trạng thái scroll ────────────────────────────────────────────
  const solid  = !isHome || scrolled;
  const bgStyle = solid
    ? { background: '#8B0000', boxShadow: '0 2px 20px rgba(0,0,0,0.45), 0 1px 0 rgba(212,175,55,0.1)' }
    : { background: 'transparent', boxShadow: 'none' };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-[#F8D444] bg-white/10 transition-all duration-200 whitespace-nowrap'
      : 'px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap';

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? 'block px-3 py-2 rounded-lg text-sm font-semibold text-[#F8D444] bg-white/10'
      : 'block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-150';

  const NAV_LINKS = [
    { to: '/',             label: t('nav.home'), Icon: Home },
    { to: '/gio-le',       label: t('nav.liturgy'), Icon: CalendarDays },
    { to: '/tin-tuc',      label: t('nav.news'), Icon: Newspaper },
    { to: '/thu-vien',     label: t('nav.gallery'), Icon: Images },
    { to: '/lich-su-cuu-do', label: 'Lịch Sử', Icon: LayoutDashboard },
    { to: '/lop-hoc',      label: t('nav.classes'), Icon: UsersRound, authRequired: true  },
    { to: '/su-kien',      label: 'Sự kiện',  Icon: CalendarDays,   giaolyOnly: true  },
    { to: '/ht-chat',      label: 'Chat HT',  Icon: MessageCircle,  giaolyOnly: true  },
    { to: '/phu-huynh',    label: 'Phụ Huynh', Icon: UserRound, parentOnly:   true  },
    { to: '/admin',        label: t('nav.admin'), Icon: LayoutDashboard, adminOnly:    true  },
  ];

  const visibleLinks = NAV_LINKS.filter(l =>
    (!l.authRequired || user) &&
    (!l.parentOnly   || user?.vaiTro === 'PARENT') &&
    (!l.adminOnly    || user?.vaiTro === 'admin') &&
    (!l.giaolyOnly   || ['admin', 'giaoly'].includes(user?.vaiTro))
  );

  const bottomLinks = visibleLinks.slice(0, 5);

  return (
    <header
      className="no-print fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        ...bgStyle,
        borderBottom: solid ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      {/* 3 cột cân đối: logo | nav | actions — mỗi cột chiếm 1/3 */}
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-2">

        {/* ── Cột 1: Logo (căn trái) ── */}
        <Link to="/" className="flex items-center gap-2.5 text-white leading-tight min-w-0">
          <img
            src="/logos/logos doan thieu nhi MT.jpg"
            alt="Logo Xứ Đoàn Mẫu Tâm"
            className="w-8 h-8 rounded-full object-cover shrink-0"
            style={{ border: '2px solid rgba(212,175,55,0.65)' }}
          />
          <span className="hidden lg:flex flex-col">
            <span className="text-[13px] font-bold leading-tight tracking-wide text-white"
              style={{ fontFamily: '"Playfair Display", "EB Garamond", Georgia, serif' }}>
              Xứ Đoàn
            </span>
            <span className="text-[10px] leading-tight"
              style={{ color: 'rgba(212,175,55,0.8)', fontFamily: '"Be Vietnam Pro", "Inter", system-ui, sans-serif' }}>
              Anrê Phú Yên · Mẫu Tâm
            </span>
          </span>
        </Link>

        {/* ── Cột 2: Nav links (căn giữa tuyệt đối) ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Cột 3: Actions (căn phải) ── */}
        <div className="hidden md:flex items-center gap-1.5 justify-end">
          <ThemeToggle />
          <LanguageSwitcher />
          <NotificationBell />

          {/* Divider mỏng */}
          <div className="w-px h-5 bg-white/15 mx-0.5" />

          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/10 transition"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt=""
                    className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
                ) : (
                  <div className={`w-7 h-7 rounded-full ${avatarColor(user.hoTen)} border-2 border-white/50 flex items-center justify-center text-white text-xs font-bold`}>
                    {user.hoTen?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="text-white/85 text-[13px] font-medium max-w-24 truncate hidden xl:block">
                  {user.hoTen}
                </span>
                <svg className={`w-3 h-3 text-white/40 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
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
              <Link to="/login"
                className="text-white/80 hover:text-white text-[13px] font-medium transition whitespace-nowrap">
                {t('nav.login')}
              </Link>
              <Link to="/dang-ky"
                className="bg-white/90 text-red-700 text-[12px] font-bold px-3 py-1.5 rounded-full hover:bg-white transition whitespace-nowrap">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile right: theme + hamburger (cột 3) ── */}
        <div className="md:hidden flex items-center gap-1 justify-end">
          <ThemeToggle />
          <button className="text-white p-1.5" onClick={() => setMenuOpen(o => !o)} aria-label="Menu" aria-expanded={menuOpen} aria-controls="mobile-menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="mobile-menu"
          className="md:hidden px-4 pt-2 pb-4 flex flex-col gap-1"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          style={{
            background: 'rgba(90,0,0,0.97)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
            <div className="px-1 pb-1"><LanguageSwitcher /></div>
            {user ? (
              <>
                <Link to="/ho-so" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  👤 {t('nav.profile')}
                </Link>
                <button onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  {t('nav.login')}
                </Link>
                <Link to="/dang-ky" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid rounded-2xl border border-[#e5d5b5] bg-white/95 p-1.5 shadow-2xl backdrop-blur"
          style={{ gridTemplateColumns: `repeat(${bottomLinks.length}, minmax(0, 1fr))` }}
        >
          {bottomLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold transition ${
                isActive ? 'bg-[#8B0000] text-white' : 'text-gray-500 hover:bg-amber-50 hover:text-[#8B0000]'
              }`}
            >
              <Icon size={17} strokeWidth={2.2} />
              <span className="max-w-full truncate px-1">{label}</span>
            </NavLink>
          ))}
        </motion.div>
      </nav>
    </header>
  );
};

export default Navbar;
