import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center
        transition-all duration-300
        hover:bg-white/15 active:scale-90
        ${className}
      `}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          opacity:   isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Sun className="w-4.5 h-4.5 text-white/90" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          opacity:   isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
        }}
      >
        <Moon className="w-4 h-4 text-white/90" />
      </span>
    </button>
  );
};

export default ThemeToggle;
