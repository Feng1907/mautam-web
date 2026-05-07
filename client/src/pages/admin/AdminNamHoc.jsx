import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

// Tính số Chúa Nhật giữa 2 ngày
const countSundays = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  let count = 0, cur = new Date(s);
  while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1);
  while (cur <= e) { count++; cur.setDate(cur.getDate() + 7); }
  return count;
};

// ── Modal tạo / sửa năm học thủ công ────────────────────────────────────────
const NamHocModal = ({ initial, onClose, onSaved }) => {
  const [form,   setForm]   = useState(
    initial
      ? { ten: initial.ten, ngayBatDau: initial.ngayBatDau?.slice(0,10), ngayKetThuc: initial.ngayKetThuc?.slice(0,10) }
      : { ten: '', ngayBatDau: '', ngayKetThuc: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ten || !form.ngayBatDau || !form.ngayKetThuc)
      return setError('Vui lòng điền đầy đủ thông tin');
    if (new Date(form.ngayBatDau) >= new Date(form.ngayKetThuc))
      return setError('Ngày bắt đầu phải trước ngày kết thúc');
    setError(''); setSaving(true);
    try {
      const res = isEdit
        ? await api.put(`/namhoc/${initial._id}`, form)
        : await api.post('/namhoc', form);
      onSaved(res.data.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  const sundays = countSundays(form.ngayBatDau, form.ngayKetThuc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">{isEdit ? 'Chỉnh sửa năm học' : 'Tạo năm học mới'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên năm học *</label>
            <input className="input" placeholder="VD: 2025-2026" value={form.ten}
              onChange={e => set('ten', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu * <span className="font-normal text-gray-400">(nên chọn Chúa Nhật)</span></label>
            <input type="date" className="input" value={form.ngayBatDau}
              onChange={e => set('ngayBatDau', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc * <span className="font-normal text-gray-400">(nên chọn Chúa Nhật)</span></label>
            <input type="date" className="input" value={form.ngayKetThuc}
              onChange={e => set('ngayKetThuc', e.target.value)} required />
          </div>

          {sundays > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
              📅 Sẽ có <strong>{sundays}</strong> Chúa Nhật điểm danh trong năm học này
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo năm học'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Trang chính ───────────────────────────────────────────────────────────────
const AdminNamHoc = () => {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [activating,  setActivating]  = useState(null);
  const [msg,       setMsg]       = useState({ type: '', text: '' });

  const load = useCallback(() => {
    api.get('/namhoc').then(r => setList(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  // Tự động tạo năm học tiếp theo
  const handleAutoNext = async () => {
    if (!window.confirm('Tự động tạo năm học tiếp theo với Chúa Nhật đầu tháng 9 → cuối tháng 6?')) return;
    setAutoLoading(true);
    try {
      const res = await api.post('/namhoc/auto-next');
      setList(prev => [res.data.data, ...prev]);
      showMsg('success', `Đã tạo năm học ${res.data.data.ten} — ${countSundays(res.data.data.ngayBatDau, res.data.data.ngayKetThuc)} Chúa Nhật`);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Tạo thất bại');
    } finally { setAutoLoading(false); }
  };

  // Kích hoạt năm học
  const handleActivate = async (id) => {
    setActivating(id);
    try {
      const res = await api.put(`/namhoc/${id}/activate`);
      setList(prev => prev.map(n => ({ ...n, dangHoatDong: n._id === id })));
      showMsg('success', `Đã kích hoạt năm học ${res.data.data.ten}`);
    } catch {
      showMsg('error', 'Kích hoạt thất bại');
    } finally { setActivating(null); }
  };

  const handleSaved = (saved, isEdit) => {
    setList(prev => isEdit
      ? prev.map(n => n._id === saved._id ? saved : n)
      : [saved, ...prev]
    );
    setModal(null);
    showMsg('success', `${isEdit ? 'Cập nhật' : 'Tạo'} năm học thành công`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Năm học</h2>
        <div className="flex gap-2">
          <button onClick={handleAutoNext} disabled={autoLoading}
            className="btn-secondary flex items-center gap-1.5">
            {autoLoading ? '⏳ Đang tạo...' : '🔄 Tạo năm học tiếp theo'}
          </button>
          <button onClick={() => setModal({})} className="btn-primary">
            + Tạo thủ công
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 mb-4 border ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">💡 Hướng dẫn chuyển năm học</p>
        <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-600">
          <li>Nhấn <strong>"Tạo năm học tiếp theo"</strong> — hệ thống tự tính ngày Chúa Nhật đầu tháng 9 đến cuối tháng 6</li>
          <li>Kiểm tra ngày bắt đầu/kết thúc, chỉnh sửa nếu cần</li>
          <li>Nhấn <strong>"Kích hoạt"</strong> để chuyển sang năm mới — dữ liệu năm cũ vẫn được lưu</li>
          <li>Danh sách Chúa Nhật sẽ tự cập nhật theo năm học đang hoạt động</li>
        </ol>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="flex flex-col gap-3">
          {list.map(n => {
            const sundays = countSundays(n.ngayBatDau, n.ngayKetThuc);
            return (
              <div key={n._id} className={`card flex items-center justify-between gap-4 flex-wrap transition ${
                n.dangHoatDong ? 'border-2 border-red-200 bg-red-50/30' : ''
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Dot trạng thái */}
                  <div className={`w-3 h-3 rounded-full shrink-0 ${n.dangHoatDong ? 'bg-green-500 shadow-sm shadow-green-300' : 'bg-gray-300'}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-base">{n.ten}</span>
                      {n.dangHoatDong && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          ● Đang hoạt động
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <span>📅 {fmt(n.ngayBatDau)} → {fmt(n.ngayKetThuc)}</span>
                      <span className="font-medium text-blue-600">
                        {sundays} Chúa Nhật
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!n.dangHoatDong && (
                    <button
                      onClick={() => handleActivate(n._id)}
                      disabled={activating === n._id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                      {activating === n._id ? '...' : '✓ Kích hoạt'}
                    </button>
                  )}
                  <button onClick={() => setModal(n)} className="btn-ghost py-1! px-3! text-xs!">
                    Sửa
                  </button>
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <p className="text-center text-gray-400 py-12">Chưa có năm học nào.</p>
          )}
        </div>
      )}

      {modal !== null && (
        <NamHocModal
          initial={modal?._id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AdminNamHoc;
