import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { setTokenGetter, setRefreshFn } from '../services/api';

const AuthContext = createContext(null);

const BASE = import.meta.env.VITE_API_URL || '/api';

// Gọi thẳng axios (không qua instance api.js) để tránh circular import
const silentRefresh = () =>
  axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
    .then(r => r.data.token)
    .catch(() => null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Token chỉ sống trong memory — không localStorage
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);
  const tokenRef     = useRef(null);

  // Inject token getter và refresh function vào axios interceptor
  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
    setRefreshFn(async () => {
      const newTkn = await silentRefresh();
      if (newTkn) {
        tokenRef.current = newTkn;
        setToken(newTkn);
        scheduleRefresh(newTkn);
      }
      return newTkn;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh 1 phút trước khi access token hết hạn (14 phút)
  const scheduleRefresh = (tkn) => {
    clearTimeout(refreshTimer.current);
    if (!tkn) return;
    refreshTimer.current = setTimeout(async () => {
      const newTkn = await silentRefresh();
      if (newTkn) {
        setToken(newTkn);
        scheduleRefresh(newTkn);
      } else {
        // Refresh thất bại — hết session
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
      }
    }, 14 * 60 * 1000); // 14 phút
  };

  // Khởi tạo: thử silent refresh để restore session khi reload trang
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    silentRefresh().then(tkn => {
      if (tkn) {
        tokenRef.current = tkn;
        setToken(tkn);
        scheduleRefresh(tkn);
      } else {
        // Cookie hết hạn — clear user
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });
    return () => clearTimeout(refreshTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ ref với state để interceptor luôn có token mới nhất
  useEffect(() => { tokenRef.current = token; }, [token]);

  const login = (userData, accessToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    tokenRef.current = accessToken;
    setToken(accessToken);
    scheduleRefresh(accessToken);
  };

  const updateUser = (userData) => {
    const merged = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = async () => {
    clearTimeout(refreshTimer.current);
    try { await axios.post(`${BASE}/auth/logout`, {}, { withCredentials: true }); } catch { /* ignore */ }
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
