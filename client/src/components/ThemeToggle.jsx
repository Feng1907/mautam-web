import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
      title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
      className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
        hover:bg-white/12 active:scale-90 ${className}`}
    >
      {/* Sun */}
      <span className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(45deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}>
        <Sun size={15} strokeWidth={2} className="text-white/75" />
      </span>
      {/* Moon */}
      <span className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-45deg) scale(0.5)' }}>
        <Moon size={14} strokeWidth={2} className="text-white/75" />
      </span>
    </button>
  );
};

export default ThemeToggle;
