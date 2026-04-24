import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const LOAI_DIEM = [
  { key: 'mieng',  label: 'Miệng',   he_so: 1 },
  { key: '15phut', label: '15 phút', he_so: 1 },
  { key: '1tiet',  label: '1 tiết',  he_so: 2 },
];

const HOC_KY = [1, 2];

// Tính điểm trung bình học kỳ từ danh sách điểm của 1 học sinh
const tinhTrungBinh = (gradeList) => {
  if (!gradeList.length) return null;
  let tongHeSo = 0, tongDiem = 0;
  gradeList.forEach(g => {
    const heSo = LOAI_DIEM.find(l => l.key === g.loaiDiem)?.he_so || 1;
    tongHeSo += heSo;
    tongDiem += g.diem * heSo;
  });
  return tongHeSo ? (tongDiem / tongHeSo).toFixed(1) : null;
};

// Phân loại học lực
const phanLoai = (tb) => {
  if (tb === null) return null;
  const v = parseFloat(tb);
  if (v >= 9)   return { label: 'Xuất sắc', cls: 'badge-green' };
  if (v >= 8)   return { label: 'Giỏi',     cls: 'badge-blue' };
  if (v >= 6.5) return { label: 'Khá',      cls: 'badge-gray' };
  if (v >= 5)   return { label: 'TB',        cls: 'badge-gray' };
  return              { label: 'Yếu',        cls: 'badge-red' };
};

// ─── Modal nhập điểm ──────────────────────────────────────────────────────────
const InputModal = ({ student, lopId, hocKy, onClose, onSaved }) => {
  const [form, setForm]   = useState({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/grades', {
        student: student._id,
        lop: lopId,
        hocKy,
        loaiDiem: form.loaiDiem,
        diem: Number(form.diem),
        ghiChu: form.ghiChu,
      });
      onSaved(res.data.data);
      setForm({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 mb-1">Nhập điểm</h3>
        <p className="text-sm text-gray-500 mb-4">
          {student.tenThanh} {student.hoTen} — HK {hocKy}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại điểm</label>
            <select
              className="input"
              value={form.loaiDiem}
              onChange={e => setForm(f => ({ ...f, loaiDiem: e.target.value }))}
            >
              {LOAI_DIEM.map(l => (
                <option key={l.key} value={l.key}>{l.label} (hệ số {l.he_so})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Điểm (0 – 10)</label>
            <input
              type="number" min={0} max={10} step={0.5}
              className="input" placeholder="VD: 8.5"
              value={form.diem}
              onChange={e => setForm(f => ({ ...f, diem: e.target.value }))}
              required autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
            <input
              type="text" className="input" placeholder="VD: KT tuần 5"
              value={form.ghiChu}
              onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Component chính ─────────────────────────────────────────────────────────
const GradeForm = ({ lopId, students, canEdit }) => {
  const [grades,   setGrades]   = useState([]);
  const [hocKy,    setHocKy]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);   // student object khi mở modal
  const [deleting, setDeleting] = useState(null);   // gradeId đang xoá

  const loadGrades = useCallback(() => {
    setLoading(true);
    api.get(`/grades/${lopId}`, { params: { hocKy } })
      .then(r => setGrades(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lopId, hocKy]);

  useEffect(() => { loadGrades(); }, [loadGrades]);

  // Lấy tất cả điểm của 1 học sinh theo loại
  const gradesByStudent = (studentId, loaiDiem) =>
    grades.filter(g => g.student?._id === studentId && g.loaiDiem === loaiDiem);

  const handleSaved = (newGrade) => {
    setGrades(prev => [...prev, newGrade]);
  };

  const handleDelete = async (gradeId) => {
    if (!window.confirm('Xoá điểm này?')) return;
    setDeleting(gradeId);
    try {
      await api.delete(`/grades/${gradeId}`);
      setGrades(prev => prev.filter(g => g._id !== gradeId));
    } catch {
      alert('Xoá thất bại, thử lại.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">Đang tải bảng điểm...</div>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Học kỳ:</label>
          <div className="flex gap-1">
            {HOC_KY.map(hk => (
              <button
                key={hk}
                onClick={() => setHocKy(hk)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                  hocKy === hk
                    ? 'bg-red-700 text-white border-red-700'
                    : 'text-gray-600 border-gray-300 hover:border-red-400'
                }`}
              >
                HK {hk}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          {LOAI_DIEM.map(l => (
            <span key={l.key}>
              <span className="font-medium text-gray-700">{l.label}</span> ×{l.he_so}
            </span>
          ))}
        </div>
      </div>

      {students.length === 0 && (
        <p className="text-center text-gray-400 py-10">Lớp chưa có đoàn sinh.</p>
      )}

      {students.length > 0 && (
        <div className="card p-0 overflow-x-auto">
          <table className="text-sm border-collapse min-w-max w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 font-medium text-xs uppercase tracking-wide">
                <th className="sticky left-0 z-10 bg-gray-50 text-left px-4 py-3 min-w-40">Đoàn sinh</th>
                {LOAI_DIEM.map(l => (
                  <th key={l.key} className="px-3 py-3 text-center min-w-28">
                    {l.label} <span className="text-gray-300">(×{l.he_so})</span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center min-w-20 bg-blue-50 text-blue-700">TBM</th>
                <th className="px-3 py-3 text-center min-w-24">Học lực</th>
                {canEdit && <th className="px-3 py-3 text-center min-w-20">Thao tác</th>}
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => {
                const allGrades = grades.filter(g => g.student?._id === s._id);
                const tb     = tinhTrungBinh(allGrades);
                const loai   = phanLoai(tb);

                return (
                  <tr
                    key={s._id}
                    className={`border-b last:border-0 hover:bg-gray-50/50 transition ${
                      idx % 2 === 0 ? '' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* Tên — sticky */}
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r">
                      <span className="text-blue-600 text-xs">{s.tenThanh}</span>
                      <span className="block font-medium text-gray-800 text-sm">{s.hoTen}</span>
                    </td>

                    {/* Cột điểm theo loại */}
                    {LOAI_DIEM.map(l => {
                      const list = gradesByStudent(s._id, l.key);
                      return (
                        <td key={l.key} className="px-3 py-2 text-center align-top">
                          <div className="flex flex-col gap-1 items-center">
                            {list.map(g => (
                              <div key={g._id} className="flex items-center gap-1 group">
                                <span className={`font-semibold text-sm px-2 py-0.5 rounded ${
                                  g.diem >= 8 ? 'text-green-700 bg-green-50'
                                  : g.diem >= 5 ? 'text-blue-700 bg-blue-50'
                                  : 'text-red-600 bg-red-50'
                                }`}>
                                  {g.diem}
                                </span>
                                {canEdit && (
                                  <button
                                    onClick={() => handleDelete(g._id)}
                                    disabled={deleting === g._id}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition text-xs px-1"
                                    title="Xoá điểm này"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            {list.length === 0 && (
                              <span className="text-gray-200 text-xs">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* TBM */}
                    <td className="px-3 py-2 text-center bg-blue-50/50">
                      {tb !== null ? (
                        <span className={`font-bold text-base ${
                          parseFloat(tb) >= 8 ? 'text-green-700'
                          : parseFloat(tb) >= 5 ? 'text-blue-700'
                          : 'text-red-600'
                        }`}>{tb}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Học lực */}
                    <td className="px-3 py-2 text-center">
                      {loai ? <span className={loai.cls}>{loai.label}</span>
                             : <span className="text-gray-200 text-xs">—</span>}
                    </td>

                    {/* Thao tác */}
                    {canEdit && (
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setModal(s)}
                          className="btn-secondary py-1! px-2! text-xs!"
                          title="Thêm điểm cho đoàn sinh này"
                        >
                          + Điểm
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Hàng thống kê cuối bảng */}
            {students.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 text-xs text-gray-500">
                  <td className="sticky left-0 z-10 bg-gray-100 px-4 py-2 font-semibold border-r">
                    Thống kê lớp
                  </td>
                  {LOAI_DIEM.map(l => {
                    const list = grades.filter(g => g.loaiDiem === l.key);
                    const avg  = list.length
                      ? (list.reduce((s, g) => s + g.diem, 0) / list.length).toFixed(1)
                      : '—';
                    return (
                      <td key={l.key} className="px-3 py-2 text-center font-semibold text-gray-600">
                        TB: {avg}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center bg-blue-50/50 font-bold text-blue-700">
                    {(() => {
                      const tbs = students
                        .map(s => tinhTrungBinh(grades.filter(g => g.student?._id === s._id)))
                        .filter(v => v !== null)
                        .map(Number);
                      return tbs.length
                        ? (tbs.reduce((a, b) => a + b, 0) / tbs.length).toFixed(1)
                        : '—';
                    })()}
                  </td>
                  <td colSpan={canEdit ? 2 : 1} className="px-3 py-2 text-center">
                    {(() => {
                      const counts = { 'Xuất sắc': 0, Giỏi: 0, Khá: 0, TB: 0, Yếu: 0 };
                      students.forEach(s => {
                        const tb = tinhTrungBinh(grades.filter(g => g.student?._id === s._id));
                        const l  = phanLoai(tb);
                        if (l) counts[l.label] = (counts[l.label] || 0) + 1;
                      });
                      return Object.entries(counts)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ') || '—';
                    })()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Modal nhập điểm */}
      {modal && (
        <InputModal
          student={modal}
          lopId={lopId}
          hocKy={hocKy}
          onClose={() => setModal(null)}
          onSaved={(g) => { handleSaved(g); setModal(null); }}
        />
      )}
    </div>
  );
};

export default GradeForm;
