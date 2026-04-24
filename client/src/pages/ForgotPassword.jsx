import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu</h1>
          <p className="text-sm text-gray-500 mt-1">Nhập email để nhận mật khẩu mới</p>
        </div>
        <div className="card">
          {status === 'success' ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-green-700 font-medium">{message}</p>
              <Link to="/login" className="btn-primary inline-block mt-4 text-sm">
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
                  {message}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" className="input" placeholder="email@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
              </button>
              <Link to="/login" className="text-center text-sm text-gray-500 hover:underline">
                Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
