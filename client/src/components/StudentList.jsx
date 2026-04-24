import { useState } from 'react';
import api from '../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const toDateInput = (iso) => iso ? iso.slice(0, 10) : '';

const emptyForm = {
  tenThanh: '', hoTen: '', ngaySinh: '', gioiTinh: 'Nam',
  phuHuynh: { hoTen: '', soDienThoai: '' },
};

// ── Modal thêm / sửa đoàn sinh ───────────────────────────────────────────────
const StudentModal = ({ lopId, initial, onClose, onSaved }) => {
  const [form,   setForm]   = useState(
    initial
      ? { tenThanh: initial.tenThanh, hoTen: initial.hoTen,
          ngaySinh: toDateInput(initial.ngaySinh), gioiTinh: initial.gioiTinh || 'Nam',
          phuHuynh: { hoTen: initial.phuHuynh?.hoTen || '', soDienThoai: initial.phuHuynh?.soDienThoai || '' } }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPh = (k, v) => setForm(f => ({ ...f, phuHuynh: { ...f.phuHuynh, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenThanh.trim()) return setError('Vui lòng nhập Tên Thánh');
    if (!form.hoTen.trim())    return setError('Vui lòng nhập họ tên');
    if (!form.ngaySinh)        return setError('Vui lòng chọn ngày sinh');
    setError(''); setSaving(true);
    try {
      const payload = { ...form, lop: lopId };
      const res = isEdit
        ? await api.put(`/students/${lopId}/${initial._id}`, payload)
        : await api.post('/students', payload);
      onSaved(res.data.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa đoàn sinh' : 'Thêm đoàn sinh'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tên Thánh + Họ tên */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tên Thánh *</label>
              <input className="input" placeholder="VD: Maria" value={form.tenThanh}
                onChange={e => set('tenThanh', e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giới tính *</label>
              <select className="input" value={form.gioiTinh} onChange={e => set('gioiTinh', e.target.value)}>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
            <input className="input" placeholder="VD: Nguyễn Thị Lan" value={form.hoTen}
              onChange={e => set('hoTen', e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh *</label>
            <input type="date" className="input" value={form.ngaySinh}
              onChange={e => set('ngaySinh', e.target.value)} required
              max={new Date().toISOString().slice(0, 10)} />
          </div>

          {/* Phụ huynh */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Thông tin phụ huynh <span className="font-normal normal-case">(tuỳ chọn)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên phụ huynh</label>
                <input className="input" placeholder="Nguyễn Văn A"
                  value={form.phuHuynh.hoTen} onChange={e => setPh('hoTen', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
                <input className="input" placeholder="0xxxxxxxxx"
                  value={form.phuHuynh.soDienThoai} onChange={e => setPh('soDienThoai', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm đoàn sinh'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Component danh sách chính ────────────────────────────────────────────────
const StudentList = ({ lopId, students, setStudents, canEdit }) => {
  const [modal,    setModal]    = useState(null);   // null | {} (thêm) | student (sửa)
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState('');

  const handleSaved = (saved, isEdit) => {
    setStudents(prev =>
      isEdit
        ? prev.map(s => s._id === saved._id ? saved : s)
        : [...prev, saved].sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'))
    );
    setModal(null);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Xoá đoàn sinh "${student.hoTen}" khỏi lớp?`)) return;
    setDeleting(student._id);
    try {
      await api.delete(`/students/${lopId}/${student._id}`);
      setStudents(prev => prev.filter(s => s._id !== student._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Xoá thất bại.');
    } finally { setDeleting(null); }
  };

  const filtered = students.filter(s =>
    !search || `${s.tenThanh} ${s.hoTen}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input className="input pl-9" placeholder="Tìm theo tên Thánh hoặc họ tên..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
          <span className="font-semibold text-gray-700">{students.length}</span> đoàn sinh
          {search && filtered.length !== students.length && (
            <span className="text-gray-400">· tìm thấy <strong>{filtered.length}</strong></span>
          )}
        </div>

        {canEdit && (
          <button onClick={() => setModal({})} className="btn-primary shrink-0">
            + Thêm đoàn sinh
          </button>
        )}
      </div>

      {/* Bảng danh sách */}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left w-10">#</th>
              <th className="px-4 py-3 text-left">Tên Thánh</th>
              <th className="px-4 py-3 text-left">Họ và tên</th>
              <th className="px-4 py-3 text-left">Ngày sinh</th>
              <th className="px-4 py-3 text-center">Giới tính</th>
              <th className="px-4 py-3 text-left">Phụ huynh</th>
              {canEdit && <th className="px-4 py-3 text-center w-24">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s._id}
                className={`border-b last:border-0 hover:bg-red-50/30 transition ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="inline-block bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-0.5 rounded-full">
                    {s.tenThanh}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{s.hoTen}</td>
                <td className="px-4 py-3 text-gray-500 text-xs tabular-nums">
                  {new Date(s.ngaySinh).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.gioiTinh === 'Nam'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {s.gioiTinh === 'Nam' ? '♂ Nam' : '♀ Nữ'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {s.phuHuynh?.hoTen
                    ? <span>{s.phuHuynh.hoTen}{s.phuHuynh.soDienThoai && <span className="text-gray-400"> · {s.phuHuynh.soDienThoai}</span>}</span>
                    : <span className="italic text-gray-300">—</span>}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setModal(s)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium transition">
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={deleting === s._id}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg font-medium transition disabled:opacity-50">
                        {deleting === s._id ? '...' : 'Xoá'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-gray-400">
                  {search ? `Không tìm thấy đoàn sinh nào với từ khoá "${search}"` : 'Lớp chưa có đoàn sinh nào.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ghi chú quyền */}
      {!canEdit && (
        <p className="text-xs text-gray-400 text-center">
          Chỉ Huynh trưởng / Dự trưởng lớp này và Admin mới có thể thêm hoặc chỉnh sửa danh sách.
        </p>
      )}

      {/* Modal */}
      {modal !== null && (
        <StudentModal
          lopId={lopId}
          initial={modal?._id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default StudentList;
