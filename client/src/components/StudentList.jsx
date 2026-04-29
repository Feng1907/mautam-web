import { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, UserPlus, Users } from 'lucide-react';
import api from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDateInput = (iso) => iso ? iso.slice(0, 10) : '';

const emptyForm = {
  tenThanh: '', hoTen: '', ngaySinh: '', gioiTinh: 'Nam',
  phuHuynh: { hoTen: '', soDienThoai: '' },
};

/**
 * Lấy tên chính (từ cuối cùng) từ chuỗi "Họ tên lót Tên".
 * VD: "Nguyễn Ngọc Bảo Hân" → "Hân"
 */
const getTenChinh = (hoTen = '') => hoTen.trim().split(/\s+/).pop() ?? '';

/**
 * Sắp xếp đoàn sinh theo tên chính (locale 'vi'), bỏ qua tên thánh và họ.
 * Stable sort: nếu tên chính bằng nhau, giữ nguyên thứ tự ban đầu.
 */
const sortStudents = (list) =>
  [...list].sort((a, b) =>
    getTenChinh(a.hoTen).localeCompare(getTenChinh(b.hoTen), 'vi', { sensitivity: 'base' })
  );

// ── Tên Thánh badge — màu theo giới tính ─────────────────────────────────────
const TenThanhBadge = ({ tenThanh, gioiTinh }) => (
  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
    gioiTinh === 'Nam'
      ? 'bg-sky-50 text-sky-600 border-sky-200'
      : 'bg-pink-50 text-pink-600 border-pink-200'
  }`}>
    {tenThanh}
  </span>
);


// ── Modal thêm / sửa ─────────────────────────────────────────────────────────
const StudentModal = ({ lopId, initial, onClose, onSaved }) => {
  const [form, setForm] = useState(
    initial
      ? {
          tenThanh: initial.tenThanh, hoTen: initial.hoTen,
          ngaySinh: toDateInput(initial.ngaySinh), gioiTinh: initial.gioiTinh || 'Nam',
          phuHuynh: {
            hoTen: initial.phuHuynh?.hoTen || '',
            soDienThoai: initial.phuHuynh?.soDienThoai || '',
          },
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
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
      <div
        className="w-full max-w-md p-6 my-auto rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000] text-lg">✝</span>
            <h3
              className="text-lg font-bold text-[#3d1515]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {isEdit ? 'Chỉnh sửa đoàn sinh' : 'Thêm đoàn sinh'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tên Thánh *</label>
              <input className="input rounded-xl" placeholder="VD: Maria"
                value={form.tenThanh} onChange={e => set('tenThanh', e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Giới tính *</label>
              <select className="input rounded-xl" value={form.gioiTinh}
                onChange={e => set('gioiTinh', e.target.value)}>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
            <input className="input rounded-xl" placeholder="VD: Nguyễn Thị Lan"
              value={form.hoTen} onChange={e => set('hoTen', e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh *</label>
            <input type="date" className="input rounded-xl" value={form.ngaySinh}
              onChange={e => set('ngaySinh', e.target.value)} required
              max={new Date().toISOString().slice(0, 10)} />
          </div>

          <div className="border-t pt-4" style={{ borderColor: '#e5d5b5' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Thông tin phụ huynh <span className="font-normal normal-case">(tuỳ chọn)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên phụ huynh</label>
                <input className="input rounded-xl" placeholder="Nguyễn Văn A"
                  value={form.phuHuynh.hoTen} onChange={e => setPh('hoTen', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
                <input className="input rounded-xl" placeholder="0xxxxxxxxx"
                  value={form.phuHuynh.soDienThoai} onChange={e => setPh('soDienThoai', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B0000 0%, #b8860b 100%)' }}
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm đoàn sinh'}
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

// ── Component chính ───────────────────────────────────────────────────────────
const StudentList = ({ lopId, students, setStudents, canEdit }) => {
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState('');

  // Sắp xếp một lần, rồi lọc theo search
  const sorted = useMemo(() => sortStudents(students), [students]);

  const filtered = useMemo(() =>
    !search
      ? sorted
      : sorted.filter(s =>
          `${s.tenThanh} ${s.hoTen}`.toLowerCase().includes(search.toLowerCase())
        ),
    [sorted, search]
  );

  const handleSaved = (saved, isEdit) => {
    setStudents(prev =>
      isEdit
        ? prev.map(s => s._id === saved._id ? saved : s)
        : [...prev, saved]
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

  return (
    <div className="flex flex-col gap-4" style={{ background: '#fdfbf7' }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Search — icon absolute, pl-10 tránh đè chữ */}
        <div className="flex-1 relative min-w-56">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: '#D4AF37' }}
          />
          <input
            className="w-full h-10 pl-10 pr-4 text-sm bg-white outline-none transition"
            style={{
              borderRadius: '9999px',
              border: '1.5px solid #e5d5b5',
              color: '#3d1515',
            }}
            onFocus={e => (e.target.style.borderColor = '#D4AF37')}
            onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
            placeholder="Tìm theo tên Thánh hoặc họ tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-[#5a1a1a]">{students.length}</span> đoàn sinh
          {search && filtered.length !== students.length && (
            <span className="text-gray-400 ml-1">
              · tìm thấy <strong>{filtered.length}</strong>
            </span>
          )}
        </div>

        {canEdit && (
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg, #8B0000 0%, #c9952a 100%)' }}
          >
            <UserPlus className="w-4 h-4" />
            Thêm đoàn sinh
          </button>
        )}
      </div>

      {/* ── Bảng danh sách ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ border: '1px solid #e5d5b5', background: '#fffcf9' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'linear-gradient(90deg, #8B0000 0%, #6e1a1a 100%)', color: '#fde8c8' }}
              >
                <th className="px-3 py-3 text-center w-10">STT</th>
                <th className="px-4 py-3 text-left min-w-52">Đoàn sinh</th>
                <th className="px-4 py-3 text-left">Ngày sinh</th>
                <th className="px-4 py-3 text-center">Giới tính</th>
                <th className="px-4 py-3 text-left">Phụ huynh</th>
                {canEdit && (
                  <th className="px-4 py-3 text-center w-24">Thao tác</th>
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s._id}
                  className="border-b last:border-0 transition-colors"
                  style={{
                    borderColor: 'rgba(229,213,181,0.5)',
                    background: i % 2 === 1 ? 'rgba(253,246,230,0.4)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,243,210,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'rgba(253,246,230,0.4)' : 'transparent')}
                >
                  {/* STT */}
                  <td className="px-3 py-3 text-center tabular-nums text-gray-400 text-xs font-medium">
                    {i + 1}
                  </td>

                  {/* Tên Thánh + Họ tên — xếp dọc */}
                  <td className="px-4 py-3">
                    <TenThanhBadge tenThanh={s.tenThanh} gioiTinh={s.gioiTinh} />
                    <p className="font-semibold text-[#3d1515] mt-0.5 leading-tight">{s.hoTen}</p>
                  </td>

                  <td className="px-4 py-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">
                    {new Date(s.ngaySinh).toLocaleDateString('vi-VN')}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      s.gioiTinh === 'Nam'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {s.gioiTinh === 'Nam' ? '♂ Nam' : '♀ Nữ'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.phuHuynh?.hoTen
                      ? (
                        <span>
                          {s.phuHuynh.hoTen}
                          {s.phuHuynh.soDienThoai && (
                            <span className="text-gray-400"> · {s.phuHuynh.soDienThoai}</span>
                          )}
                        </span>
                      )
                      : <span className="italic text-gray-300">—</span>
                    }
                  </td>

                  {canEdit && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModal(s)}
                          title="Chỉnh sửa"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={deleting === s._id}
                          title="Xoá"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition disabled:opacity-40"
                        >
                          {deleting === s._id
                            ? <span className="text-xs">…</span>
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-12 text-center text-gray-400 italic">
                    {search
                      ? `Không tìm thấy đoàn sinh nào với từ khoá "${search}"`
                      : 'Lớp chưa có đoàn sinh nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!canEdit && (
        <p className="text-xs text-gray-400 text-center italic">
          Chỉ Huynh trưởng / Dự trưởng lớp này và Admin mới có thể thêm hoặc chỉnh sửa danh sách.
        </p>
      )}

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
