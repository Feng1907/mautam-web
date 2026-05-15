import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { formatClassName } from '../../utils/formatClassName';
import LoadingSpinner from '../../components/LoadingSpinner';

// ── Modal hiển thị mật khẩu tạm ──────────────────────────────────────────────
const PasswordModal = ({ hoTen, email, matKhau, emailSent, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(matKhau);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="text-3xl mb-2">🔑</div>
        <h3 className="font-bold text-gray-800 mb-1">Mật khẩu tạm thời</h3>
        <p className="text-sm text-gray-500 mb-4">
          {emailSent
            ? `Đã gửi qua email <strong>${email}</strong>`
            : <span className="text-orange-600 font-medium">⚠ Gửi email thất bại — hãy copy và gửi thủ công</span>
          }
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-3">
          <p className="text-xs text-gray-400 mb-1">{hoTen} · {email}</p>
          <p className="text-2xl font-mono font-bold text-red-700 tracking-widest select-all">{matKhau}</p>
        </div>
        <button onClick={copy} className="btn-primary w-full mb-2">
          {copied ? '✓ Đã copy!' : 'Copy mật khẩu'}
        </button>
        <button onClick={onClose} className="btn-ghost w-full text-sm">Đóng</button>
      </div>
    </div>
  );
};

// ── Cấu hình nhãn & màu ─────────────────────────────────────────────────────
const VAI_TRO_LABEL = {
  admin:  { label: 'Admin',        cls: 'badge-red'  },
  giaoly: { label: 'Giáo lý viên', cls: 'badge-blue' },
  user:   { label: 'Phụ huynh',    cls: 'badge-gray' },
};

const CHUC_VU_LABEL = {
  huynhtruong: { label: 'Huynh trưởng', cls: 'bg-green-100 text-green-800 inline-block text-xs font-semibold px-2 py-0.5 rounded-full' },
  dutruong:    { label: 'Dự trưởng',    cls: 'bg-sky-100   text-sky-800   inline-block text-xs font-semibold px-2 py-0.5 rounded-full' },
};

// Các tab lọc
const TABS = [
  { key: '',             label: 'Tất cả' },
  { key: 'admin',        label: 'Admin',        vaiTro: 'admin'  },
  { key: 'huynhtruong',  label: 'Huynh trưởng', vaiTro: 'giaoly', chucVu: 'huynhtruong' },
  { key: 'dutruong',     label: 'Dự trưởng',    vaiTro: 'giaoly', chucVu: 'dutruong'    },
  { key: 'giaoly_other', label: 'GLV khác',      vaiTro: 'giaoly' },
  { key: 'user',         label: 'Phụ huynh',    vaiTro: 'user'   },
];

const emptyForm = { hoTen: '', email: '', vaiTro: 'giaoly', chucVu: 'huynhtruong', soDienThoai: '' };

// ── Form tạo / sửa ────────────────────────────────────────────────────────────
const UserForm = ({ initial, onSave, onCancel }) => {
  const [form,   setForm]   = useState(() => initial
    ? { hoTen: initial.hoTen, email: initial.email, vaiTro: initial.vaiTro,
        chucVu: initial.chucVu || '', soDienThoai: initial.soDienThoai || '' }
    : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        // chucVu chỉ có nghĩa với giaoly, reset về null nếu không phải
        chucVu: form.vaiTro === 'giaoly' ? (form.chucVu || null) : null,
      };
      const res = isEdit
        ? await api.put(`/users/${initial._id}`, payload)
        : await api.post('/auth/register', payload);
      onSave(res.data.data || res.data.user, res.data.matKhauTam, res.data.emailSent);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">
          {isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
        </h3>

        {!isEdit && (
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2 mb-4">
            Hệ thống tự tạo mật khẩu tạm và gửi qua email.
          </p>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Họ tên *</label>
            <input className="input" value={form.hoTen}
              onChange={e => set('hoTen', e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" className="input" value={form.email}
              onChange={e => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
            <input className="input" placeholder="0xxxxxxxxx" value={form.soDienThoai}
              onChange={e => set('soDienThoai', e.target.value)} />
          </div>

          {/* Vai trò hệ thống */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò hệ thống</label>
            <select className="input" value={form.vaiTro}
              onChange={e => set('vaiTro', e.target.value)}>
              <option value="giaoly">Giáo lý viên</option>
              <option value="admin">Admin</option>
              <option value="user">Phụ huynh / User</option>
            </select>
          </div>

          {/* Chức vụ — chỉ hiện khi là giaoly */}
          {form.vaiTro === 'giaoly' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chức vụ</label>
              <select className="input" value={form.chucVu}
                onChange={e => set('chucVu', e.target.value)}>
                <option value="huynhtruong">Huynh trưởng</option>
                <option value="dutruong">Dự trưởng</option>
                <option value="">Chưa xác định</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tài khoản'}
            </button>
            <button type="button" onClick={onCancel} className="btn-ghost flex-1">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Trang chính ───────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [deleting,  setDeleting]  = useState(null);
  const [pwModal,   setPwModal]   = useState(null); // { hoTen, email, matKhau, emailSent }
  const [resetting, setResetting] = useState(null);

  // Xây params từ tab
  const tabParams = () => {
    const t = TABS.find(t => t.key === activeTab);
    if (!t) return {};
    const p = {};
    if (t.vaiTro) p.vaiTro = t.vaiTro;
    // Tab "GLV khác": giaoly nhưng KHÔNG có chucVu cụ thể (lọc phía FE)
    if (t.chucVu)  p.chucVu = t.chucVu;
    return p;
  };

  const load = useCallback(() => {
    setLoading(true);
    api.get('/users', { params: tabParams() })
      .then(r => {
        let data = r.data.data;
        // Tab "GLV khác": lọc ra những người giaoly chưa có chucVu
        if (activeTab === 'giaoly_other')
          data = data.filter(u => !u.chucVu);
        setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]); // eslint-disable-line

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleSave = (saved, matKhauTam, emailSent) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u._id === saved._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setForm(null);
    if (matKhauTam) setPwModal({ hoTen: saved.hoTen, email: saved.email, matKhau: matKhauTam, emailSent });
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset mật khẩu của ${user.hoTen}?`)) return;
    setResetting(user._id);
    try {
      const res = await api.post('/auth/admin-reset-password', { userId: user._id });
      setPwModal({ hoTen: user.hoTen, email: user.email, matKhau: res.data.matKhauMoi, emailSent: res.data.emailSent });
    } catch (err) {
      alert(err.response?.data?.message || 'Reset thất bại.');
    } finally { setResetting(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá tài khoản này?')) return;
    setDeleting(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Xoá thất bại.');
    } finally { setDeleting(null); }
  };

  // Đổi chức vụ nhanh không cần mở form
  const handleChucVu = async (user, newChucVu) => {
    try {
      const res = await api.put(`/users/${user._id}`, { chucVu: newChucVu });
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.data : u));
    } catch { alert('Cập nhật thất bại.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <button onClick={() => setForm({})} className="btn-primary">+ Tạo tài khoản</button>
      </div>

      {/* Tabs lọc */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
              activeTab === t.key
                ? 'bg-red-700 text-white border-red-700'
                : 'text-gray-600 border-gray-300 hover:border-red-400'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-12">Không có người dùng nào.</p>
          )}

          {users.map(u => {
            const vt = VAI_TRO_LABEL[u.vaiTro] || VAI_TRO_LABEL.user;
            const cv = u.chucVu ? CHUC_VU_LABEL[u.chucVu] : null;

            return (
              <div key={u._id} className="card flex items-center justify-between gap-4 flex-wrap py-3">
                {/* Avatar + thông tin */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.hoTen}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center shrink-0"
                    style={u.avatar ? { display: 'none' } : {}}
                  >
                    {u.hoTen?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    {/* Tên + badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{u.hoTen}</span>
                      <span className={vt.cls}>{vt.label}</span>
                      {cv && <span className={cv.cls}>{cv.label}</span>}
                      {u.phaiBatDauDoiMatKhau && (
                        <span className="bg-orange-100 text-orange-700 inline-block text-xs font-semibold px-2 py-0.5 rounded-full">
                          Chưa đổi MK
                        </span>
                      )}
                    </div>

                    {/* Email + SĐT */}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {u.email}
                      {u.soDienThoai && <span className="ml-2 text-gray-400">· {u.soDienThoai}</span>}
                    </p>

                    {/* Lớp phụ trách */}
                    {u.lopPhuTrach?.length > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        📚 {u.lopPhuTrach.map(l => l?.tenLop ? formatClassName(l.tenLop) : null).filter(Boolean).join(', ') || '(lớp không còn tồn tại)'}
                      </p>
                    )}

                    {/* Dropdown đổi chức vụ nhanh — chỉ với giaoly */}
                    {u.vaiTro === 'giaoly' && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-gray-400">Chức vụ:</span>
                        {['huynhtruong', 'dutruong', ''].map(cv => {
                          const lbl = cv === 'huynhtruong' ? 'HT'
                            : cv === 'dutruong' ? 'DT' : '—';
                          const active = (u.chucVu || '') === cv;
                          return (
                            <button key={cv}
                              onClick={() => handleChucVu(u, cv || null)}
                              className={`text-xs px-2 py-0.5 rounded border transition font-medium ${
                                active
                                  ? cv === 'huynhtruong' ? 'bg-green-600 text-white border-green-600'
                                    : cv === 'dutruong' ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-gray-400 text-white border-gray-400'
                                  : 'text-gray-500 border-gray-300 hover:border-gray-500'
                              }`}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thao tác */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button onClick={() => setForm(u)} className="btn-ghost py-1! px-3! text-xs!">Sửa</button>
                  <button
                    onClick={() => handleResetPassword(u)}
                    disabled={resetting === u._id}
                    title="Reset mật khẩu về mật khẩu tạm mới"
                    className="py-1 px-3 text-xs rounded border border-orange-300 text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
                  >
                    {resetting === u._id ? '...' : '🔑 Reset MK'}
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={deleting === u._id}
                    className="btn-danger py-1! px-3! text-xs!"
                  >
                    {deleting === u._id ? '...' : 'Xoá'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form !== null && (
        <UserForm
          initial={form._id ? form : null}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}

      {pwModal && (
        <PasswordModal
          hoTen={pwModal.hoTen}
          email={pwModal.email}
          matKhau={pwModal.matKhau}
          emailSent={pwModal.emailSent}
          onClose={() => setPwModal(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
