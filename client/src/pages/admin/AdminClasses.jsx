import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const NGANH_COLOR = {
  ChienNon: 'badge-gray', AuNhi: 'badge-blue', ThieuNhi: 'badge-green',
  NghiaSi: 'badge-red', HiepSi: 'bg-purple-100 text-purple-700 inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
};
const NGANH_LABEL = {
  ChienNon: 'Chiên Non', AuNhi: 'Ấu Nhi', ThieuNhi: 'Thiếu Nhi',
  NghiaSi: 'Nghĩa Sĩ', HiepSi: 'Hiệp Sĩ',
};

// Modal phân công Huynh trưởng / Dự trưởng
const AssignModal = ({ lop, giaoly, onClose, onSaved }) => {
  const [htId,    setHtId]    = useState(lop.huynhTruong?._id || '');
  const [dtIds,   setDtIds]   = useState((lop.duTruong || []).map(d => d._id));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const toggleDt = (id) =>
    setDtIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await api.put(`/classes/${lop._id}/assign`, {
        huynhTruongId: htId || null,
        duTruongIds: dtIds,
      });
      onSaved(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 mb-1">Phân công lớp</h3>
        <p className="text-sm text-gray-500 mb-4">{lop.tenLop}</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-3">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Huynh trưởng</label>
            <select className="input" value={htId} onChange={e => setHtId(e.target.value)}>
              <option value="">— Chưa phân công —</option>
              {giaoly.map(u => <option key={u._id} value={u._id}>{u.hoTen}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Dự trưởng (chọn nhiều)</label>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border rounded p-2">
              {giaoly.map(u => (
                <label key={u._id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                  <input type="checkbox" className="accent-red-600"
                    checked={dtIds.includes(u._id)}
                    onChange={() => toggleDt(u._id)} />
                  {u.hoTen}
                </label>
              ))}
              {giaoly.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Chưa có giáo lý viên.</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Đang lưu...' : 'Lưu phân công'}
          </button>
          <button onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
        </div>
      </div>
    </div>
  );
};

const AdminClasses = () => {
  const [classes,  setClasses]  = useState([]);
  const [giaoly,   setGiaoly]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [assignLop, setAssignLop] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/users', { params: { vaiTro: 'giaoly' } }),
    ]).then(([cls, usr]) => {
      setClasses(cls.data.data);
      setGiaoly(usr.data.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated) =>
    setClasses(prev => prev.map(c => c._id === updated._id ? updated : c));

  if (loading) return <LoadingSpinner />;

  const byNganh = classes.reduce((acc, l) => {
    (acc[l.nhanh] = acc[l.nhanh] || []).push(l); return acc;
  }, {});

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-5">Quản lý Lớp học</h2>

      <div className="flex flex-col gap-6">
        {Object.entries(byNganh).map(([nhanh, lops]) => (
          <section key={nhanh}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {NGANH_LABEL[nhanh]}
            </h3>
            <div className="flex flex-col gap-2">
              {lops.map(lop => (
                <div key={lop._id} className="card flex items-center justify-between gap-4 flex-wrap py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={NGANH_COLOR[lop.nhanh] || 'badge-gray'}>{NGANH_LABEL[lop.nhanh]}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{lop.tenLop}</p>
                      <p className="text-xs text-gray-500">
                        HT: <span className={lop.huynhTruong ? 'text-blue-700 font-medium' : 'italic text-gray-300'}>
                          {lop.huynhTruong?.hoTen || 'Chưa phân công'}
                        </span>
                        {lop.duTruong?.length > 0 && (
                          <span className="ml-2">· DT: {lop.duTruong.map(d => d.hoTen).join(', ')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/lop-hoc/${lop._id}`} className="btn-ghost py-1! px-3! text-xs!">
                      Xem lớp
                    </Link>
                    <button
                      onClick={() => setAssignLop(lop)}
                      className="btn-secondary py-1! px-3! text-xs!"
                    >
                      Phân công
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {assignLop && (
        <AssignModal
          lop={assignLop}
          giaoly={giaoly}
          onClose={() => setAssignLop(null)}
          onSaved={(u) => { handleSaved(u); setAssignLop(null); }}
        />
      )}
    </div>
  );
};

export default AdminClasses;
