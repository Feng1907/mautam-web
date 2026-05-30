import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Users, Pencil, CheckSquare, Square, X, UserCheck } from 'lucide-react';
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
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar border rounded-xl p-2"
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

// ── Modal phân công hàng loạt ─────────────────────────────────────────────────
const BulkAssignModal = ({ count, giaoly, onConfirm, onClose }) => {
  const [htId,   setHtId]   = useState('');
  const [dtIds,  setDtIds]  = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleDt = (id) =>
    setDtIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleConfirm = async () => {
    setSaving(true);
    await onConfirm({ huynhTruongId: htId || null, duTruongIds: dtIds });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000]">✝</span>
            <h3 className="font-bold text-[#3d1515]" style={{ fontFamily: 'Georgia, serif' }}>
              Phân công hàng loạt
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Áp dụng cho <strong>{count}</strong> lớp đã chọn.
          Chỉ cần chọn người bạn muốn gán — ô trống đồng nghĩa giữ nguyên.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Huynh trưởng</label>
            <select className="input rounded-xl" value={htId} onChange={e => setHtId(e.target.value)}>
              <option value="">— Giữ nguyên / Bỏ trống —</option>
              {giaoly.map(u => <option key={u._id} value={u._id}>{u.hoTen}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Thêm Dự trưởng <span className="font-normal text-gray-400">(thêm vào danh sách hiện tại)</span>
            </label>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar border rounded-xl p-2"
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
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleConfirm} disabled={saving || (!htId && dtIds.length === 0)} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Áp dụng'}
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
  const [classes,      setClasses]      = useState([]);
  const [giaoly,       setGiaoly]       = useState([]);
  const [namHocId,     setNamHocId]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [assignLop,    setAssignLop]    = useState(null);
  const [addNganh,     setAddNganh]     = useState(null);
  const [editLop,      setEditLop]      = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkAssign,   setBulkAssign]   = useState(false);
  const [bulkWorking,  setBulkWorking]  = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/users', { params: { vaiTro: 'giaoly' } }),
    ]).then(([cls, usr]) => {
      const classesData = cls.data.data || [];
      setClasses(classesData);
      setGiaoly(usr.data.data || []);
      setNamHocId(classesData[0]?.namHoc?._id || classesData[0]?.namHoc || null);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (namHocId) return;
    api.get('/namhoc').then(r => {
      const active = (r.data.data || []).find(n => n.dangHoatDong);
      if (active) setNamHocId(active._id);
    }).catch(() => {});
  }, [namHocId]);

  const byNganh = useMemo(() =>
    classes.reduce((acc, l) => {
      (acc[l.nhanh] = acc[l.nhanh] || []).push(l);
      return acc;
    }, {}),
  [classes]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === classes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(classes.map(c => c._id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

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
      setSelectedIds(prev => { const n = new Set(prev); n.delete(lop._id); return n; });
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    } finally { setDeleting(null); }
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const selectedList = classes.filter(c => selectedIds.has(c._id));
  const emptySelected = selectedList.filter(c => !c.siSo || c.siSo === 0);
  const nonEmptyCount = selectedList.length - emptySelected.length;

  const handleBulkDelete = async () => {
    if (emptySelected.length === 0) {
      alert('Tất cả lớp đã chọn đều có đoàn sinh. Chuyển đoàn sinh sang lớp khác trước khi xóa.');
      return;
    }
    const msg = nonEmptyCount > 0
      ? `Sẽ xóa ${emptySelected.length} lớp trống. ${nonEmptyCount} lớp có đoàn sinh sẽ bị bỏ qua.\n\nTiếp tục?`
      : `Xóa ${emptySelected.length} lớp đã chọn? Hành động này không thể hoàn tác.`;
    if (!window.confirm(msg)) return;
    setBulkWorking(true);
    const results = await Promise.allSettled(emptySelected.map(c => api.delete(`/classes/${c._id}`)));
    const deleted = emptySelected.filter((_, i) => results[i].status === 'fulfilled').map(c => c._id);
    setClasses(prev => prev.filter(c => !deleted.includes(c._id)));
    setSelectedIds(new Set());
    setBulkWorking(false);
    const failed = emptySelected.length - deleted.length;
    if (failed > 0) alert(`Đã xóa ${deleted.length} lớp. ${failed} lớp xóa thất bại.`);
  };

  const handleBulkAssign = async ({ huynhTruongId, duTruongIds }) => {
    const ids = [...selectedIds];
    setBulkWorking(true);
    const results = await Promise.allSettled(
      ids.map(id => {
        const lop = classes.find(c => c._id === id);
        const existingDtIds = (lop?.duTruong || []).map(d => d._id);
        const mergedDtIds = [...new Set([...existingDtIds, ...duTruongIds])];
        return api.put(`/classes/${id}/assign`, {
          huynhTruongId: huynhTruongId || lop?.huynhTruong?._id || null,
          duTruongIds: mergedDtIds,
        });
      })
    );
    const updated = results
      .map(r => r.status === 'fulfilled' ? r.value.data.data : null)
      .filter(Boolean);
    setClasses(prev => prev.map(c => {
      const upd = updated.find(u => u._id === c._id);
      return upd ? { ...c, ...upd } : c;
    }));
    setSelectedIds(new Set());
    setBulkAssign(false);
    setBulkWorking(false);
    const failed = ids.length - updated.length;
    if (failed > 0) alert(`Đã cập nhật ${updated.length} lớp. ${failed} lớp thất bại.`);
  };

  if (loading) return <LoadingSpinner />;

  const totalStudents = classes.reduce((sum, c) => sum + (c.siSo ?? 0), 0);
  const allSelected = classes.length > 0 && selectedIds.size === classes.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="pb-24">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="admin-title text-2xl">Quản lý Lớp học</h2>
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

      {/* Select-all */}
      {classes.length > 0 && (
        <div className="flex items-center gap-2 px-1 mb-4">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            {allSelected
              ? <CheckSquare size={15} className="text-red-700" />
              : someSelected
                ? <CheckSquare size={15} className="text-gray-400" />
                : <Square size={15} className="text-gray-400" />
            }
            {allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${classes.length})`}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-xs text-gray-400">· {selectedIds.size} đã chọn</span>
          )}
        </div>
      )}

      {/* ── Danh sách theo ngành ── */}
      <div className="flex flex-col gap-8">
        {NGANH_ORDER.map(nhanh => {
          const cfg  = NGANH_CFG[nhanh];
          const lops = byNganh[nhanh] || [];
          const sectionSelected = lops.filter(l => selectedIds.has(l._id)).length;
          const allSectionSelected = lops.length > 0 && sectionSelected === lops.length;

          return (
            <section key={nhanh}>
              {/* Header ngành */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    if (allSectionSelected) {
                      setSelectedIds(prev => { const n = new Set(prev); lops.forEach(l => n.delete(l._id)); return n; });
                    } else {
                      setSelectedIds(prev => { const n = new Set(prev); lops.forEach(l => n.add(l._id)); return n; });
                    }
                  }}
                  className="text-gray-400 hover:text-red-700 transition"
                  title={allSectionSelected ? 'Bỏ chọn ngành này' : 'Chọn cả ngành này'}
                >
                  {allSectionSelected
                    ? <CheckSquare size={13} className="text-red-700" />
                    : <Square size={13} />
                  }
                </button>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                <h3 className="admin-section-title">{cfg.label}</h3>
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
                  {lops.map(lop => {
                    const isSelected = selectedIds.has(lop._id);
                    return (
                      <div
                        key={lop._id}
                        className={`rounded-xl border flex items-center justify-between gap-4 flex-wrap px-4 py-3 transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2 ring-red-400' : ''
                        }`}
                        style={{ background: isSelected ? '#fff5f5' : '#fffcf9', borderColor: isSelected ? '#fca5a5' : '#e5d5b5' }}
                      >
                        {/* Checkbox + Info lớp */}
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleSelect(lop._id)}
                            className="shrink-0 text-gray-400 hover:text-red-700 transition"
                          >
                            {isSelected
                              ? <CheckSquare size={17} className="text-red-700" />
                              : <Square size={17} />
                            }
                          </button>
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
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Bulk action bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-2xl text-white text-sm font-medium animate-in slide-in-from-bottom-4 duration-200">
          <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
            {selectedIds.size}
          </span>
          <span className="text-gray-300">lớp đã chọn</span>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button
            onClick={() => setBulkAssign(true)}
            disabled={bulkWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 transition disabled:opacity-50 text-xs font-semibold"
          >
            <UserCheck size={14} /> Phân công
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition disabled:opacity-50 text-xs font-semibold"
          >
            <Trash2 size={14} /> Xóa
            {nonEmptyCount > 0 && (
              <span className="text-[10px] opacity-75">({emptySelected.length} trống)</span>
            )}
          </button>
          <button
            onClick={clearSelection}
            disabled={bulkWorking}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Bỏ chọn"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {assignLop && (
        <AssignModal
          lop={assignLop}
          giaoly={giaoly}
          onClose={() => setAssignLop(null)}
          onSaved={handleAssignSaved}
        />
      )}

      {bulkAssign && (
        <BulkAssignModal
          count={selectedIds.size}
          giaoly={giaoly}
          onConfirm={handleBulkAssign}
          onClose={() => setBulkAssign(false)}
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
