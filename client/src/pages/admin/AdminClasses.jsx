import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Users, Pencil } from 'lucide-react';
import api from '../../services/api';
import { formatClassName } from '../../utils/formatClassName';
import LoadingSpinner from '../../components/LoadingSpinner';

// ── Config ngành — thứ tự cố định ─────────────────────────────────────────────
const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];

const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', dot: 'bg-pink-400',    badge: 'bg-pink-100   text-pink-700   border-pink-200'   },
  AuNhi:    { label: 'Ấu Nhi',    dot: 'bg-green-500',   badge: 'bg-green-100  text-green-700  border-green-200'  },
  ThieuNhi: { label: 'Thiếu Nhi', dot: 'bg-blue-500',    badge: 'bg-blue-100   text-blue-700   border-blue-200'   },
  NghiaSi:  { label: 'Nghĩa Sĩ',  dot: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  HiepSi:   { label: 'Hiệp Sĩ',   dot: 'bg-amber-600',   badge: 'bg-amber-100  text-amber-800  border-amber-200'  },
};

// ── Modal phân công Huynh trưởng / Dự trưởng ──────────────────────────────────
const AssignModal = ({ lop, giaoly, onClose, onSaved }) => {
  const [htId,   setHtId]   = useState(lop.huynhTruong?._id || '');
  const [dtIds,  setDtIds]  = useState((lop.duTruong || []).map(d => d._id));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

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
      <div
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#8B0000]">✝</span>
          <h3 className="font-bold text-[#3d1515]" style={{ fontFamily: 'Georgia, serif' }}>
            Phân công nhân sự
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">{formatClassName(lop.tenLop)}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Huynh trưởng</label>
            <select className="input rounded-xl" value={htId} onChange={e => setHtId(e.target.value)}>
              <option value="">— Chưa phân công —</option>
              {giaoly.map(u => <option key={u._id} value={u._id}>{u.hoTen}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Dự trưởng <span className="font-normal text-gray-400">(chọn nhiều)</span>
            </label>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border rounded-xl p-2"
                 style={{ borderColor: '#e5d5b5' }}>
              {giaoly.map(u => (
                <label key={u._id}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-[#3d1515] px-1 py-0.5 rounded transition">
                  <input type="checkbox" className="accent-red-700"
                    checked={dtIds.includes(u._id)}
                    onChange={() => toggleDt(u._id)} />
                  {u.hoTen}
                </label>
              ))}
              {giaoly.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">Chưa có giáo lý viên.</p>
              )}
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

// ── Modal thêm lớp mới ────────────────────────────────────────────────────────
const AddClassModal = ({ defaultNganh, namHocId, onClose, onAdded }) => {
  const [tenLop,  setTenLop]  = useState('');
  const [nhanh,   setNhanh]   = useState(defaultNganh);
  const [thuTu,   setThuTu]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenLop.trim()) return setError('Vui lòng nhập tên lớp');
    if (!namHocId)      return setError('Không tìm thấy năm học đang hoạt động');
    setSaving(true); setError('');
    try {
      const res = await api.post('/classes', {
        tenLop: tenLop.trim(),
        nhanh,
        thuTu: thuTu ? parseInt(thuTu, 10) : 99,
        namHocId,
      });
      onAdded(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo lớp thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000]">✝</span>
            <h3 className="font-bold text-[#3d1515]" style={{ fontFamily: 'Georgia, serif' }}>
              Thêm lớp mới
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên lớp *</label>
            <input
              className="input rounded-xl"
              placeholder="VD: Ấu Nhi 3, Thiếu Nhi 1A..."
              value={tenLop}
              onChange={e => setTenLop(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Khối ngành *</label>
            <select className="input rounded-xl" value={nhanh} onChange={e => setNhanh(e.target.value)}>
              {NGANH_ORDER.map(k => (
                <option key={k} value={k}>{NGANH_CFG[k].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Thứ tự hiển thị <span className="font-normal text-gray-400">(tuỳ chọn)</span>
            </label>
            <input
              type="number" min="1" max="99"
              className="input rounded-xl"
              placeholder="VD: 1, 2, 3..."
              value={thuTu}
              onChange={e => setThuTu(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B0000 0%, #b8860b 100%)' }}
            >
              {saving ? 'Đang tạo...' : '+ Tạo lớp'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Modal chỉnh sửa lớp ───────────────────────────────────────────────────────
const EditClassModal = ({ lop, onClose, onUpdated }) => {
  const [tenLop,  setTenLop]  = useState(lop.tenLop);
  const [nhanh,   setNhanh]   = useState(lop.nhanh);
  const [thuTu,   setThuTu]   = useState(lop.thuTu ?? '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenLop.trim()) return setError('Vui lòng nhập tên lớp');
    setSaving(true); setError('');
    try {
      const res = await api.patch(`/classes/${lop._id}`, {
        tenLop: tenLop.trim(),
        nhanh,
        thuTu: thuTu !== '' ? parseInt(thuTu, 10) : undefined,
      });
      onUpdated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000]">✝</span>
            <h3 className="font-bold text-[#3d1515]" style={{ fontFamily: 'Georgia, serif' }}>
              Chỉnh sửa lớp
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên lớp *</label>
            <input
              className="input rounded-xl"
              placeholder="VD: XT 1, Ấu Nhi 3..."
              value={tenLop}
              onChange={e => setTenLop(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Khối ngành *</label>
            <select className="input rounded-xl" value={nhanh} onChange={e => setNhanh(e.target.value)}>
              {NGANH_ORDER.map(k => (
                <option key={k} value={k}>{NGANH_CFG[k].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Thứ tự hiển thị <span className="font-normal text-gray-400">(tuỳ chọn)</span>
            </label>
            <input
              type="number" min="1" max="99"
              className="input rounded-xl"
              placeholder="VD: 1, 2, 3..."
              value={thuTu}
              onChange={e => setThuTu(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B0000 0%, #b8860b 100%)' }}
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Trang chính AdminClasses ───────────────────────────────────────────────────
const AdminClasses = () => {
  const [classes,    setClasses]    = useState([]);
  const [giaoly,     setGiaoly]     = useState([]);
  const [namHocId,   setNamHocId]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [assignLop,  setAssignLop]  = useState(null);
  const [addNganh,   setAddNganh]   = useState(null);
  const [editLop,    setEditLop]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/users', { params: { vaiTro: 'giaoly' } }),
    ]).then(([cls, usr]) => {
      const classesData = cls.data.data || [];
      setClasses(classesData);
      setGiaoly(usr.data.data || []);
      // Lấy namHocId từ lớp đầu tiên hoặc fetch riêng
      setNamHocId(classesData[0]?.namHoc?._id || classesData[0]?.namHoc || null);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Nếu chưa có namHocId (chưa có lớp nào), fetch năm học đang active
  useEffect(() => {
    if (namHocId) return;
    api.get('/namhoc').then(r => {
      const active = (r.data.data || []).find(n => n.dangHoatDong);
      if (active) setNamHocId(active._id);
    }).catch(() => {});
  }, [namHocId]);

  // Gom lớp theo ngành — giữ thứ tự NGANH_ORDER
  const byNganh = useMemo(() =>
    classes.reduce((acc, l) => {
      (acc[l.nhanh] = acc[l.nhanh] || []).push(l);
      return acc;
    }, {}),
  [classes]);

  const handleAssignSaved = (updated) => {
    setClasses(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
    setAssignLop(null);
  };

  const handleAdded = (newClass) => {
    setClasses(prev => [...prev, newClass]);
    setAddNganh(null);
  };

  const handleUpdated = (updated) => {
    setClasses(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
    setEditLop(null);
  };

  const handleDelete = async (lop) => {
    if (!window.confirm(`Xóa lớp "${lop.tenLop}"?\n\nHành động này không thể hoàn tác.`)) return;
    setDeleting(lop._id);
    try {
      await api.delete(`/classes/${lop._id}`);
      setClasses(prev => prev.filter(c => c._id !== lop._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    } finally { setDeleting(null); }
  };

  if (loading) return <LoadingSpinner />;

  const totalStudents = classes.reduce((sum, c) => sum + (c.siSo ?? 0), 0);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#3d1515]" style={{ fontFamily: 'Georgia, serif' }}>
            Quản lý Lớp học
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {classes.length} lớp · {totalStudents} đoàn sinh
          </p>
        </div>
        <button
          onClick={() => setAddNganh('ChienNon')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #8B0000 0%, #b8860b 100%)' }}
        >
          <Plus className="w-4 h-4" /> Thêm lớp mới
        </button>
      </div>

      {/* ── Danh sách theo ngành ── */}
      <div className="flex flex-col gap-8">
        {NGANH_ORDER.map(nhanh => {
          const cfg  = NGANH_CFG[nhanh];
          const lops = byNganh[nhanh] || [];

          return (
            <section key={nhanh}>
              {/* Header ngành */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                <h3 className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  {cfg.label}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">({lops.length} lớp)</span>
              </div>

              {/* Danh sách lớp trong ngành */}
              {lops.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed py-5 text-center text-sm text-gray-300 italic"
                  style={{ borderColor: '#e5d5b5' }}
                >
                  Ngành này chưa có lớp nào.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {lops.map(lop => (
                    <div
                      key={lop._id}
                      className="rounded-xl border flex items-center justify-between gap-4 flex-wrap px-4 py-3 transition-all hover:shadow-sm"
                      style={{ background: '#fffcf9', borderColor: '#e5d5b5' }}
                    >
                      {/* Info lớp */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#3d1515] text-sm">{formatClassName(lop.tenLop)}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <p className="text-xs text-gray-500">
                              HT:&nbsp;
                              <span className={lop.huynhTruong ? 'text-blue-700 font-medium' : 'italic text-gray-300'}>
                                {lop.huynhTruong?.hoTen || 'Chưa phân công'}
                              </span>
                              {lop.duTruong?.length > 0 && (
                                <span className="ml-2 text-gray-400">
                                  · DT: {lop.duTruong.map(d => d.hoTen).join(', ')}
                                </span>
                              )}
                            </p>
                            {lop.siSo != null && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Users className="w-3 h-3" />
                                {lop.siSo} đoàn sinh
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Link
                          to={`/lop-hoc/${lop._id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#e5d5b5', color: '#5a1a1a', background: '#fdfbf7' }}
                        >
                          Xem lớp
                        </Link>
                        <button
                          onClick={() => setAssignLop(lop)}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#D4AF37', color: '#8B0000', background: '#fffaeb' }}
                        >
                          Phân công
                        </button>
                        <button
                          onClick={() => setEditLop(lop)}
                          title={`Chỉnh sửa lớp "${lop.tenLop}"`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#bfdbfe', color: '#2563eb', background: '#eff6ff' }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lop)}
                          disabled={deleting === lop._id}
                          title={
                            lop.siSo > 0
                              ? `⚠️ Không thể xóa — lớp "${lop.tenLop}" còn ${lop.siSo} đoàn sinh.\nHãy chuyển đoàn sinh sang lớp khác trước.`
                              : `Xóa lớp "${lop.tenLop}" — hành động không thể hoàn tác`
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:opacity-80 disabled:opacity-40"
                          style={{ borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' }}
                        >
                          {deleting === lop._id
                            ? <span className="text-xs">…</span>
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Modals ── */}
      {assignLop && (
        <AssignModal
          lop={assignLop}
          giaoly={giaoly}
          onClose={() => setAssignLop(null)}
          onSaved={handleAssignSaved}
        />
      )}

      {addNganh && (
        <AddClassModal
          defaultNganh={addNganh}
          namHocId={namHocId}
          onClose={() => setAddNganh(null)}
          onAdded={handleAdded}
        />
      )}

      {editLop && (
        <EditClassModal
          lop={editLop}
          onClose={() => setEditLop(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default AdminClasses;
