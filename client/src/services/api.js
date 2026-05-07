import axios from 'axios';

// Production: VITE_API_URL=https://your-app.onrender.com/api
// Development: Vite proxy /api → localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
