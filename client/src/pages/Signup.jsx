import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import PasswordInput from '../components/PasswordInput';

const Signup = () => {
  const [form, setForm] = useState({
    hoTen: '', email: '', matKhau: '', xacNhanMatKhau: '', soDienThoai: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.matKhau !== form.xacNhanMatKhau)
      return setError('Mật khẩu xác nhận không khớp');

    if (form.matKhau.length < 6)
      return setError('Mật khẩu phải có ít nhất 6 ký tự');

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        hoTen:       form.hoTen,
        email:       form.email,
        matKhau:     form.matKhau,
        soDienThoai: form.soDienThoai,
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✝</div>
          <h1 className="text-2xl font-bold text-gray-800">Tạo tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Xứ Đoàn Anrê Phú Yên – Mẫu Tâm</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
              <input
                className="input" placeholder="Nguyễn Văn A"
                value={form.hoTen} onChange={e => set('hoTen', e.target.value)}
                required autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email" className="input" placeholder="email@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel" className="input" placeholder="0xxxxxxxxx"
                value={form.soDienThoai} onChange={e => set('soDienThoai', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <PasswordInput
                placeholder="Ít nhất 6 ký tự"
                value={form.matKhau} onChange={e => set('matKhau', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
              <PasswordInput
                placeholder="Nhập lại mật khẩu"
                value={form.xacNhanMatKhau} onChange={e => set('xacNhanMatKhau', e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-red-700 hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 px-2">
          Tài khoản này dùng để xem thông tin xứ đoàn.<br />
          Huynh trưởng / Dự trưởng liên hệ Ban Điều Hành để được cấp quyền.
        </p>
      </div>
    </main>
  );
};

export default Signup;
