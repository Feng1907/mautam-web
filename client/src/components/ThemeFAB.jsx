/**
 * ThemeFAB — Floating pill toggle cố định góc dưới-phải màn hình
 * Ẩn trên trang /admin (admin có layout riêng)
 */
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

export default function ThemeFAB() {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();

  // Ẩn trên admin
  if (pathname.startsWith('/admin')) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-5 z-50"
    >
      <button
        onClick={toggle}
        aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        className="group relative flex items-center gap-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400"
        style={{
          width: 56,
          height: 28,
          padding: '3px',
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
          border: isDark
            ? '1px solid rgba(148,163,184,0.2)'
            : '1px solid rgba(212,175,55,0.4)',
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 4px 20px rgba(212,175,55,0.25), 0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Sliding thumb */}
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-[3px] flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            left: isDark ? 'calc(100% - 25px)' : 3,
            background: isDark
              ? 'linear-gradient(135deg, #334155, #475569)'
              : 'linear-gradient(135deg, #FCD34D, #F59E0B)',
            boxShadow: isDark
              ? '0 1px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 1px 6px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.span key="moon"
                initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                exit={{    rotate:  30, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={11} style={{ color: '#94a3b8' }} />
              </motion.span>
            ) : (
              <motion.span key="sun"
                initial={{ rotate: 30,  opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                exit={{    rotate: -30, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={11} style={{ color: '#92400e' }} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>

        {/* Background track icons (faint) */}
        <span className="absolute inset-0 flex items-center px-[5px] justify-between pointer-events-none select-none">
          <Sun size={10} style={{ color: isDark ? 'rgba(255,255,255,0.12)' : 'transparent', transition: 'color 0.3s' }} />
          <Moon size={10} style={{ color: isDark ? 'transparent' : 'rgba(0,0,0,0.18)', transition: 'color 0.3s' }} />
        </span>
      </button>

      {/* Tooltip on hover */}
      <span
        className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold pointer-events-none select-none
          opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200"
        style={{
          background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
          color: isDark ? '#94a3b8' : '#78350f',
          border: isDark ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? '☀️ Chế độ sáng' : '🌙 Chế độ tối'}
      </span>
    </motion.div>
  );
}
