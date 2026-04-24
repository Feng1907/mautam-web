import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const VAI_TRO_LABEL = {
  admin:  { label: 'Admin',          cls: 'badge-red'   },
  giaoly: { label: 'Giáo lý viên',   cls: 'badge-blue'  },
  user:   { label: 'Phụ huynh/User', cls: 'badge-gray'  },
};

const emptyForm = { hoTen: '', email: '', vaiTro: 'giaoly', soDienThoai: '' };

const UserForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm]     = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = isEdit
        ? await api.put(`/users/${initial._id}`, form)
        : await api.post('/auth/register', form);
      onSave(res.data.data || res.data.user);
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
          <p className="text-xs text-blue-600 bg-blue-50 rounded px-3 py-2 mb-4">
            Hệ thống sẽ tự tạo mật khẩu tạm và gửi qua email.
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
              onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" className="input" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò</label>
            <select className="input" value={form.vaiTro}
              onChange={e => setForm(f => ({ ...f, vaiTro: e.target.value }))}>
              <option value="giaoly">Giáo lý viên</option>
              <option value="admin">Admin</option>
              <option value="user">Phụ huynh/User</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
            <input className="input" placeholder="0xxxxxxxxx" value={form.soDienThoai}
              onChange={e => setForm(f => ({ ...f, soDienThoai: e.target.value }))} />
          </div>
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

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [vaiTro,  setVaiTro]  = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/users', { params: { vaiTro: vaiTro || undefined } })
      .then(r => setUsers(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vaiTro]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u._id === saved._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setForm(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <button onClick={() => setForm({})} className="btn-primary">+ Tạo tài khoản</button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['', 'Tất cả'], ['admin', 'Admin'], ['giaoly', 'Giáo lý viên'], ['user', 'Phụ huynh']].map(([v, l]) => (
          <button key={v} onClick={() => setVaiTro(v)}
            className={`text-xs px-3 py-1 rounded-full border transition font-medium ${
              vaiTro === v ? 'bg-red-700 text-white border-red-700' : 'text-gray-600 border-gray-300 hover:border-red-400'
            }`}>{l}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-12">Không có người dùng nào.</p>
          )}
          {users.map(u => {
            const vt = VAI_TRO_LABEL[u.vaiTro] || VAI_TRO_LABEL.user;
            return (
              <div key={u._id} className="card flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {u.hoTen?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{u.hoTen}</p>
                      <span className={vt.cls}>{vt.label}</span>
                      {u.phaiBatDauDoiMatKhau && (
                        <span className="badge-red">Chưa đổi MK</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    {u.lopPhuTrach?.length > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        Phụ trách: {u.lopPhuTrach.map(l => l.tenLop).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setForm(u)} className="btn-ghost py-1! px-3! text-xs!">Sửa</button>
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
    </div>
  );
};

export default AdminUsers;
