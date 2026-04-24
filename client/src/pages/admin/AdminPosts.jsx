import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const LOAI_OPTIONS = [
  { value: 'tintuc',       label: 'Tin tức' },
  { value: 'thongbao',     label: 'Thông báo' },
  { value: 'thongbaokhan', label: '🔔 Thông báo khẩn' },
];

const LOAI_LABEL = {
  tintuc:       { label: 'Tin tức',   cls: 'badge-blue' },
  thongbao:     { label: 'Thông báo', cls: 'badge-gray' },
  thongbaokhan: { label: '🔔 Khẩn',   cls: 'badge-red'  },
};

const emptyForm = {
  tieuDe: '', tomTat: '', noiDung: '',
  loai: 'tintuc', anhDaiDien: '', daDang: false, hanHienThi: '',
};

// ─── Form tạo / sửa bài ──────────────────────────────────────────────────────
const PostForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm]   = useState(initial || emptyForm);
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
        hanHienThi: form.loai === 'thongbaokhan' && form.hanHienThi
          ? form.hanHienThi : null,
      };
      const res = isEdit
        ? await api.put(`/posts/${initial._id}`, payload)
        : await api.post('/posts', payload);
      onSave(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {isEdit ? 'Chỉnh sửa bài viết' : 'Đăng bài mới'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              className="input" placeholder="Nhập tiêu đề bài viết..."
              value={form.tieuDe} onChange={e => set('tieuDe', e.target.value)}
              required autoFocus
            />
          </div>

          {/* Loại + Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài</label>
              <select className="input" value={form.loai} onChange={e => set('loai', e.target.value)}>
                {LOAI_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" className="w-4 h-4 accent-red-600"
                  checked={form.daDang} onChange={e => set('daDang', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Đăng ngay</span>
              </label>
            </div>
          </div>

          {/* Hạn hiển thị — chỉ với thongbaokhan */}
          {form.loai === 'thongbaokhan' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn hiển thị <span className="text-gray-400 font-normal">(để trống = không giới hạn)</span>
              </label>
              <input
                type="datetime-local" className="input"
                value={form.hanHienThi} onChange={e => set('hanHienThi', e.target.value)}
              />
            </div>
          )}

          {/* Tóm tắt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tóm tắt <span className="text-gray-400 font-normal">(hiển thị ở danh sách)</span>
            </label>
            <textarea
              className="input resize-none" rows={2}
              placeholder="Mô tả ngắn về bài viết..."
              value={form.tomTat} onChange={e => set('tomTat', e.target.value)}
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
            <textarea
              className="input resize-y" rows={8}
              placeholder="Nội dung chi tiết bài viết... (hỗ trợ HTML cơ bản)"
              value={form.noiDung} onChange={e => set('noiDung', e.target.value)}
              required
            />
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL ảnh đại diện <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              className="input" placeholder="https://..."
              value={form.anhDaiDien} onChange={e => set('anhDaiDien', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng bài'}
            </button>
            <button type="button" onClick={onCancel} className="btn-ghost flex-1">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Trang chính ─────────────────────────────────────────────────────────────
const AdminPosts = () => {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);   // null | {} (tạo mới) | post (sửa)
  const [loai,    setLoai]    = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    // Admin xem tất cả kể cả chưa đăng — fetch không lọc daDang
    api.get('/posts', { params: { loai: loai || undefined, limit: 50 } })
      .then(r => setPosts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loai]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p._id === saved._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setForm(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá bài viết này?')) return;
    setDeleting(id);
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch { alert('Xoá thất bại.'); }
    finally { setDeleting(null); }
  };

  const handleTogglePublish = async (post) => {
    try {
      const res = await api.put(`/posts/${post._id}`, { daDang: !post.daDang });
      setPosts(prev => prev.map(p => p._id === post._id ? res.data.data : p));
    } catch { alert('Cập nhật thất bại.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Bài viết</h2>
        <button onClick={() => setForm({})} className="btn-primary">+ Đăng bài mới</button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['', 'Tất cả'], ['tintuc', 'Tin tức'], ['thongbao', 'Thông báo'], ['thongbaokhan', '🔔 Khẩn']].map(([v, l]) => (
          <button
            key={v} onClick={() => setLoai(v)}
            className={`text-xs px-3 py-1 rounded-full border transition font-medium ${
              loai === v ? 'bg-red-700 text-white border-red-700' : 'text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >{l}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="flex flex-col gap-3">
          {posts.length === 0 && (
            <p className="text-center text-gray-400 py-12">Chưa có bài viết nào.</p>
          )}
          {posts.map(p => {
            const meta = LOAI_LABEL[p.loai] || LOAI_LABEL.tintuc;
            return (
              <div key={p._id} className="card flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={meta.cls}>{meta.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.daDang ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.daDang ? 'Đã đăng' : 'Nháp'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 leading-snug">{p.tieuDe}</h3>
                  {p.tomTat && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{p.tomTat}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(p)}
                    className={`text-xs px-3 py-1.5 rounded border font-medium transition ${
                      p.daDang
                        ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {p.daDang ? 'Gỡ xuống' : 'Đăng lên'}
                  </button>
                  <button
                    onClick={() => setForm(p)}
                    className="btn-ghost py-1! px-3! text-xs!"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    disabled={deleting === p._id}
                    className="btn-danger py-1! px-3! text-xs!"
                  >
                    {deleting === p._id ? '...' : 'Xoá'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form !== null && (
        <PostForm
          initial={form._id ? form : null}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default AdminPosts;
