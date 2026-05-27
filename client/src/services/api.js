import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 });

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

let activeRequests = 0;

// Getter/setter để AuthContext inject token vào mà không tạo circular import
let _getToken = () => null;
export const setTokenGetter = (fn) => { _getToken = fn; };

// Cho phép AuthContext đặt hàm refresh từ ngoài
let _refreshFn = null;
export const setRefreshFn = (fn) => { _refreshFn = fn; };

api.interceptors.request.use((config) => {
  const token = _getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeRequests === 0) NProgress.start();
  activeRequests += 1;
  return config;
});

api.interceptors.response.use(
  (res) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) NProgress.done();
    return res;
  },
  async (err) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) NProgress.done();

    const url     = err.config?.url || '';
    const isAuth  = url.includes('/auth/login') || url.includes('/auth/signup') ||
                    url.includes('/auth/refresh') || url.includes('/auth/logout');
    const is401   = err.response?.status === 401;

    // Silent refresh: nếu 401 và không phải request auth, thử lấy access token mới
    if (is401 && !isAuth && !err.config._retry && _refreshFn) {
      err.config._retry = true;
      const newToken = await _refreshFn();
      if (newToken) {
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      }
      // Refresh thất bại → redirect login
      window.location.href = '/login';
    } else if (is401 && !isAuth && !_refreshFn) {
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
