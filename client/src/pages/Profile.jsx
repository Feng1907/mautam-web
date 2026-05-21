import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { formatClassName } from '../utils/formatClassName';
import PasswordInput from '../components/PasswordInput';

const CHUC_VU = { huynhtruong: 'Huynh trưởng', dutruong: 'Dự trưởng' };
const VAI_TRO = { admin: 'Admin', giaoly: 'Giáo lý viên', user: 'Phụ huynh' };

const AVATAR_COLORS = [
  'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500',
  'bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Avatar với khả năng upload ───────────────────────────────────────────────
const AvatarUploader = ({ user, previewUrl, onFile }) => {
  const inputRef = useRef();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn 1.5 MB
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 1.5 MB.');
      return;
    }
    // Chỉ chấp nhận ảnh
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, WEBP...).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => onFile(ev.target.result);
    reader.readAsDataURL(file);
  };

  const src = previewUrl || user.avatar;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => inputRef.current.click()}>
        {src ? (
          <img src={src} alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
        ) : (
          <div className={`w-28 h-28 rounded-full ${avatarColor(user.hoTen)} border-4 border-white shadow-lg flex items-center justify-center text-white font-black text-4xl`}>
            {user.hoTen?.charAt(0)?.toUpperCase()}
          </div>
        )}
        {/* Overlay hover */}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="text-white text-center">
            <svg className="w-7 h-7 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-xs font-semibold">Đổi ảnh</p>
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <p className="text-xs text-gray-400">Click vào ảnh để thay đổi · Tối đa 1.5 MB</p>
    </div>
  );
};

// ── Trang Profile ────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, updateUser } = useAuth();

  // Fetch fresh profile data — retry on Render cold start
  const { data: freshProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/me').then(r => r.data.data || r.data.user),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Sync fresh profile into AuthContext when loaded
  useEffect(() => {
    if (freshProfile) updateUser(freshProfile);
  }, [freshProfile, updateUser]);

  const merged = freshProfile ?? user;

  const [tab, setTab] = useState('thongtin'); // 'thongtin' | 'matkhau'

  // Tab thông tin
  const [form,       setForm]       = useState({ hoTen: user?.hoTen || '', soDienThoai: user?.soDienThoai || '' });
  const [avatarData, setAvatarData] = useState(null); // base64 preview
  const [saving,     setSaving]     = useState(false);
  const [infoMsg,    setInfoMsg]    = useState({ type: '', text: '' });

  // Tab mật khẩu
  const [pwForm,  setPwForm]  = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
  const [pwSaving,setPwSaving] = useState(false);
  const [pwMsg,   setPwMsg]   = useState({ type: '', text: '' });

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!form.hoTen.trim()) return setInfoMsg({ type: 'error', text: 'Họ tên không được để trống' });
    setSaving(true);
    setInfoMsg({ type: '', text: '' });
    try {
      const payload = { hoTen: form.hoTen, soDienThoai: form.soDienThoai };
      if (avatarData) payload.avatar = avatarData;
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.data);
      setAvatarData(null);
      setInfoMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.response?.data?.message || 'Lưu thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePw = async (e) => {
    e.preventDefault();
    if (pwForm.matKhauMoi !== pwForm.xacNhan)
      return setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
    if (pwForm.matKhauMoi.length < 6)
      return setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    setPwSaving(true);
    setPwMsg({ type: '', text: '' });
    try {
      await api.put('/auth/change-password', {
        matKhauCu: pwForm.matKhauCu, matKhauMoi: pwForm.matKhauMoi,
      });
      setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setPwSaving(false);
    }
  };

  if (!merged) return null;

  return (
    <main className="flex-1 page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6">Hồ sơ cá nhân</h1>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Sidebar avatar + info tóm tắt ── */}
        <div className="flex flex-col items-center gap-4 md:w-56 shrink-0">
          <div className="card w-full flex flex-col items-center gap-3 py-6">
            <AvatarUploader
              user={merged}
              previewUrl={avatarData}
              onFile={setAvatarData}
            />
            <div className="text-center">
              <p className="font-bold text-gray-800 dark:text-slate-100">{merged.hoTen}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{merged.email}</p>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1.5">
              <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {VAI_TRO[merged.vaiTro] || merged.vaiTro}
              </span>
              {merged.chucVu && (
                <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {CHUC_VU[merged.chucVu] || merged.chucVu}
                </span>
              )}
            </div>
            {/* Lớp phụ trách */}
            {merged.lopPhuTrach?.length > 0 && (
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Lớp phụ trách</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {merged.lopPhuTrach.map(l => (
                    <span key={l._id || l} className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                      {formatClassName(l.tenLop || l)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin tài khoản */}
          <div className="card w-full text-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tài khoản</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400 text-xs">Tham gia</span>
                <span className="text-gray-700 dark:text-slate-200 text-xs font-medium">
                  {merged.createdAt ? new Date(merged.createdAt).toLocaleDateString('vi-VN') : '—'}
                </span>
              </div>
              {merged.phaiBatDauDoiMatKhau && (
                <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded px-2 py-1 mt-1">
                  ⚠ Vui lòng đổi mật khẩu tạm
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Panel chính ── */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700 mb-5">
            {[['thongtin', 'Thông tin'], ['matkhau', 'Mật khẩu']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                  tab === k
                    ? 'border-red-600 text-red-700 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}>
                {l}
              </button>
            ))}
          </div>

          {/* ── Tab thông tin ── */}
          {tab === 'thongtin' && (
            <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
              {infoMsg.text && (
                <div className={`text-sm rounded px-3 py-2 border ${
                  infoMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {infoMsg.text}
                </div>
              )}

              {/* Preview ảnh mới chọn */}
              {avatarData && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <img src={avatarData} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-700">Ảnh mới đã chọn</p>
                    <p className="text-xs text-blue-500">Nhấn "Lưu thay đổi" để cập nhật</p>
                  </div>
                  <button type="button" onClick={() => setAvatarData(null)}
                    className="text-blue-400 hover:text-blue-700 text-lg font-bold">×</button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Họ tên *</label>
                <input className="input" value={form.hoTen}
                  onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input className="input bg-gray-50 cursor-not-allowed" value={merged.email} readOnly />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                <input className="input" placeholder="0xxxxxxxxx" value={form.soDienThoai}
                  onChange={e => setForm(f => ({ ...f, soDienThoai: e.target.value }))} />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full mt-1">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {/* ── Tab mật khẩu ── */}
          {tab === 'matkhau' && (
            <form onSubmit={handleSavePw} className="flex flex-col gap-4">
              {pwMsg.text && (
                <div className={`text-sm rounded px-3 py-2 border ${
                  pwMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {pwMsg.text}
                </div>
              )}
              {merged.phaiBatDauDoiMatKhau && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded px-3 py-2">
                  ⚠ Tài khoản của bạn đang dùng mật khẩu tạm. Vui lòng đổi mật khẩu ngay.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mật khẩu hiện tại *</label>
                <PasswordInput placeholder="••••••••"
                  value={pwForm.matKhauCu}
                  onChange={e => setPwForm(f => ({ ...f, matKhauCu: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mật khẩu mới *</label>
                <PasswordInput placeholder="Ít nhất 6 ký tự"
                  value={pwForm.matKhauMoi}
                  onChange={e => setPwForm(f => ({ ...f, matKhauMoi: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Xác nhận mật khẩu mới *</label>
                <PasswordInput placeholder="Nhập lại mật khẩu mới"
                  value={pwForm.xacNhan}
                  onChange={e => setPwForm(f => ({ ...f, xacNhan: e.target.value }))} required />
              </div>
              <button type="submit" disabled={pwSaving} className="btn-primary w-full mt-1">
                {pwSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;
