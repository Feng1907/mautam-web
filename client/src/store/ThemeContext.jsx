import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'mautam_theme';

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Áp class 'dark' lên <html> mỗi khi theme thay đổi
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else                  root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Toggle có hiệu ứng Circular Reveal (View Transitions API)
  const toggle = useCallback((event) => {
    const next = theme === 'light' ? 'dark' : 'light';

    // Lấy tọa độ tâm từ nút bấm (hoặc giữa màn hình nếu không có)
    const x = event?.clientX ?? window.innerWidth  / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    document.documentElement.style.setProperty('--vt-x', `${x}px`);
    document.documentElement.style.setProperty('--vt-y', `${y}px`);

    if (!document.startViewTransition) {
      // Fallback: chuyển ngay không có animation
      setTheme(next);
      return;
    }

    document.startViewTransition(() => setTheme(next));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải dùng bên trong ThemeProvider');
  return ctx;
};
