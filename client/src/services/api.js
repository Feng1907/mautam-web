import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 });

// Production: VITE_API_URL=https://your-app.onrender.com/api
// Development: Vite proxy /api → localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Đếm request đang chạy để tránh done() quá sớm khi có nhiều request song song
let activeRequests = 0;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
  (err) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) NProgress.done();

    // Chỉ redirect khi 401 xảy ra ở route được bảo vệ (token hết hạn),
    // KHÔNG redirect khi đang thực hiện chính request login/signup —
    // vì backend trả 401 cho sai mật khẩu, interceptor sẽ gây GET /login → 304.
    const url = err.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/signup');
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
