import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import ExportButton from './ExportButton';

// Lấy tên chính (từ cuối) để sort: "Nguyễn Ngọc Bảo Hân" → "Hân"
const getTenChinh = (hoTen = '') => hoTen.trim().split(/\s+/).pop() ?? '';
const sortByTenChinh = (list) =>
  [...list].sort((a, b) =>
    getTenChinh(a.hoTen).localeCompare(getTenChinh(b.hoTen), 'vi', { sensitivity: 'base' })
  );

const LOAI_DIEM = [
  { key: 'mieng',  label: 'Miệng',   he_so: 1 },
  { key: '15phut', label: '15 phút', he_so: 1 },
  { key: '1tiet',  label: '1 tiết',  he_so: 2 },
];

const HOC_KY = [1, 2];

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

const HOC_LUC_CONFIG = {
  'Xuất sắc': {
    icon: '♛',
    cls: 'bg-amber-50 text-amber-700 border border-amber-300 ring-1 ring-amber-200',
  },
  'Giỏi': {
    icon: '★',
    cls: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  'Khá': {
    icon: '◆',
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  'TB': {
    icon: '●',
    cls: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  'Yếu': {
    icon: '▼',
    cls: 'bg-red-50 text-red-700 border border-red-200',
  },
};

const phanLoai = (tb) => {
  if (tb === null) return null;
  const v = parseFloat(tb);
  if (v >= 9)   return 'Xuất sắc';
  if (v >= 8)   return 'Giỏi';
  if (v >= 6.5) return 'Khá';
  if (v >= 5)   return 'TB';
  return 'Yếu';
};

const ScoreBadge = ({ diem, onDelete, canEdit, deleting }) => {
  const color =
    diem >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : diem >= 5 ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-red-50 text-red-600 border-red-200';

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${color} group`}>
      {diem}
      {canEdit && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 ml-0.5 text-current hover:opacity-70 transition leading-none"
          title="Xoá điểm này"
        >
          ×
        </button>
      )}
    </span>
  );
};

const HocLucBadge = ({ label }) => {
  const cfg = HOC_LUC_CONFIG[label];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className="text-[11px]">{cfg.icon}</span>
      {label}
    </span>
  );
};

// ─── SVG watermark ────────────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.035]"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <pattern id="cross-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Thánh giá cách điệu */}
        <rect x="35" y="16" width="10" height="48" rx="2" fill="#8B0000" />
        <rect x="20" y="28" width="40" height="10" rx="2" fill="#8B0000" />
        {/* Vòng tròn nhỏ trên đỉnh */}
        <circle cx="40" cy="12" r="4" fill="none" stroke="#8B0000" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cross-pattern)" />
  </svg>
);

// ─── Modal nhập điểm ──────────────────────────────────────────────────────────
const InputModal = ({ student, lopId, hocKy, onClose, onSaved }) => {
  const [form, setForm]     = useState({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
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
      <div className="bg-[#FDFAF5] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-amber-100">
        {/* Header modal */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#8B0000] text-lg">✝</span>
          <h3 className="font-bold text-[#5a1a1a]">Nhập điểm</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 pl-6">
          {student.tenThanh} {student.hoTen} — Học kỳ {hocKy}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại điểm</label>
            <select
              className="input rounded-xl"
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
              className="input rounded-xl" placeholder="VD: 8.5"
              value={form.diem}
              onChange={e => setForm(f => ({ ...f, diem: e.target.value }))}
              required autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
            <input
              type="text" className="input rounded-xl" placeholder="VD: KT tuần 5"
              value={form.ghiChu}
              onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl bg-[#8B0000] text-white text-sm font-semibold hover:bg-[#6e0000] transition disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Component chính ──────────────────────────────────────────────────────────
const GradeForm = ({ lopId, students, canEdit }) => {
  const [grades,   setGrades]   = useState([]);
  const [hocKy,    setHocKy]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get(`/grades/${lopId}`, { params: { hocKy } })
      .then(r => {
        if (!cancelled) setGrades(r.data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [lopId, hocKy]);

  // Danh sách sắp xếp theo tên chính
  const sorted = useMemo(() => sortByTenChinh(students), [students]);

  const gradesByStudent = (studentId, loaiDiem) =>
    grades.filter(g => g.student?._id === studentId && g.loaiDiem === loaiDiem);

  const handleSaved = (newGrade) => setGrades(prev => [...prev, newGrade]);

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

  // Thống kê footer
  const classStats = (() => {
    const counts = { 'Xuất sắc': 0, 'Giỏi': 0, 'Khá': 0, 'TB': 0, 'Yếu': 0 };
    const tbs = [];
    students.forEach(s => {
      const tb = tinhTrungBinh(grades.filter(g => g.student?._id === s._id));
      if (tb !== null) {
        tbs.push(Number(tb));
        const label = phanLoai(tb);
        if (label) counts[label] = (counts[label] || 0) + 1;
      }
    });
    const classTbm = tbs.length
      ? (tbs.reduce((a, b) => a + b, 0) / tbs.length).toFixed(1)
      : null;
    return { counts, classTbm };
  })();

  if (loading) return (
    <div className="text-center py-12 text-[#8B0000]/40 text-sm italic tracking-wide">
      ✝ Đang tải bảng điểm...
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#5a1a1a] font-medium">Học kỳ:</label>
          <div className="flex gap-1.5">
            {HOC_KY.map(hk => (
              <button
                key={hk}
                onClick={() => setHocKy(hk)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                  hocKy === hk
                    ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-sm'
                    : 'text-[#5a1a1a] border-[#D4AF37]/50 hover:border-[#8B0000]/40 bg-amber-50/50'
                }`}
              >
                HK {hk}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-3 text-xs text-gray-500">
            {LOAI_DIEM.map(l => (
              <span key={l.key} className="flex items-center gap-1">
                <span className="font-medium text-[#5a1a1a]">{l.label}</span>
                <span className="text-[#D4AF37]">×{l.he_so}</span>
              </span>
            ))}
          </div>
          <ExportButton
            url={`/api/export/grades/${lopId}?hocKy=${hocKy}`}
            fileName={`BangDiem_HK${hocKy}.xlsx`}
            label="Xuất Excel"
          />
        </div>
      </div>

      {students.length === 0 && (
        <p className="text-center text-gray-400 py-10 italic">Lớp chưa có đoàn sinh.</p>
      )}

      {/* ── Bảng điểm ── */}
      {students.length > 0 && (
        <div
          className="relative rounded-2xl border border-amber-100 shadow-md overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #FDFAF5 0%, #faf5eb 100%)' }}
        >
          {/* Họa tiết Thánh giá chìm */}
          <CrossWatermark />

          <div className="overflow-x-auto relative">
            <table className="text-sm border-collapse min-w-max w-full">

              {/* ── Header ── */}
              <thead>
                <tr
                  className="text-xs uppercase tracking-wide"
                  style={{ background: 'linear-gradient(90deg, #8B0000 0%, #6e1a1a 100%)' }}
                >
                  <th className="sticky left-0 z-10 text-center px-2 py-3 w-10 text-amber-100/70 font-semibold"
                      style={{ background: '#8B0000' }}>
                    STT
                  </th>
                  <th className="sticky left-10 z-10 text-left px-4 py-3 min-w-44 text-amber-100 font-semibold"
                      style={{ background: '#8B0000' }}>
                    Đoàn sinh
                  </th>
                  {LOAI_DIEM.map(l => (
                    <th key={l.key} className="px-3 py-3 text-center min-w-32 text-amber-100 font-semibold">
                      {l.label}
                      <span className="text-[#D4AF37]/80 ml-1 normal-case font-normal">(×{l.he_so})</span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center min-w-20 text-[#D4AF37] font-bold">TBM</th>
                  <th className="px-3 py-3 text-center min-w-28 text-amber-100 font-semibold">Học lực</th>
                  {canEdit && (
                    <th className="px-3 py-3 text-center min-w-20 text-amber-100/70 font-semibold">Thao tác</th>
                  )}
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody>
                {sorted.map((s, idx) => {
                  const allGrades = grades.filter(g => g.student?._id === s._id);
                  const tb    = tinhTrungBinh(allGrades);
                  const loai  = phanLoai(tb);
                  const rowBg = idx % 2 === 0 ? 'bg-transparent' : 'bg-amber-50/30';

                  return (
                    <tr
                      key={s._id}
                      className={`border-b border-amber-100/60 last:border-0 hover:bg-amber-50/50 transition ${rowBg}`}
                    >
                      {/* STT */}
                      <td
                        className="sticky left-0 z-10 text-center text-xs text-gray-400 font-medium tabular-nums w-10 px-2 py-3"
                        style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#FAF5EB' }}
                      >
                        {idx + 1}
                      </td>

                      {/* Tên — sticky */}
                      <td
                        className="sticky left-10 z-10 px-4 py-3 border-r border-amber-100/60"
                        style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#FAF5EB' }}
                      >
                        <span className="text-[#D4AF37] text-[11px] font-medium tracking-wide">{s.tenThanh}</span>
                        <span className="block font-semibold text-[#3d1515] text-sm">{s.hoTen}</span>
                      </td>

                      {/* Cột điểm theo loại — hiển thị dạng tag pill */}
                      {LOAI_DIEM.map(l => {
                        const list = gradesByStudent(s._id, l.key);
                        return (
                          <td key={l.key} className="px-3 py-2.5 text-center">
                            <div className="flex flex-wrap gap-1 justify-center items-center">
                              {list.map(g => (
                                <ScoreBadge
                                  key={g._id}
                                  diem={g.diem}
                                  gradeId={g._id}
                                  canEdit={canEdit}
                                  deleting={deleting === g._id}
                                  onDelete={() => handleDelete(g._id)}
                                />
                              ))}
                              {list.length === 0 && (
                                <span className="text-amber-200 text-xs">—</span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* TBM */}
                      <td className="px-3 py-2.5 text-center">
                        {tb !== null ? (
                          <span className={`font-bold text-base ${
                            parseFloat(tb) >= 8 ? 'text-emerald-700'
                            : parseFloat(tb) >= 5 ? 'text-sky-700'
                            : 'text-red-600'
                          }`}>
                            {tb}
                          </span>
                        ) : (
                          <span className="text-amber-200 text-xs">—</span>
                        )}
                      </td>

                      {/* Học lực với icon */}
                      <td className="px-3 py-2.5 text-center">
                        {loai ? <HocLucBadge label={loai} />
                               : <span className="text-amber-200 text-xs">—</span>}
                      </td>

                      {/* Thao tác */}
                      {canEdit && (
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => setModal(s)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#8B0000]/30 text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition"
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

              {/* ── Footer thống kê ── */}
              <tfoot>
                <tr className="border-t-2 border-amber-200/60 text-xs" style={{ background: '#f5e6c8' }}>
                  {/* ô trống cho cột STT */}
                  <td className="sticky left-0 z-10 w-10" style={{ background: '#f5e6c8' }} />
                  <td
                    className="sticky left-10 z-10 px-4 py-3 font-semibold text-[#8B0000] border-r border-amber-200/60"
                    style={{ background: '#f5e6c8' }}
                  >
                    <span className="text-[#D4AF37] mr-1">✦</span>
                    Thống kê lớp
                  </td>

                  {LOAI_DIEM.map(l => {
                    const list = grades.filter(g => g.loaiDiem === l.key);
                    const avg  = list.length
                      ? (list.reduce((s, g) => s + g.diem, 0) / list.length).toFixed(1)
                      : '—';
                    return (
                      <td key={l.key} className="px-3 py-3 text-center text-[#5a1a1a]">
                        <span className="font-medium">TB:</span>{' '}
                        <span className="font-bold text-[#8B0000]">{avg}</span>
                      </td>
                    );
                  })}

                  {/* TBM lớp */}
                  <td className="px-3 py-3 text-center">
                    {classStats.classTbm ? (
                      <span className="font-bold text-base text-[#8B0000]">
                        {classStats.classTbm}
                      </span>
                    ) : (
                      <span className="text-amber-300">—</span>
                    )}
                  </td>

                  {/* Phân phối học lực */}
                  <td colSpan={canEdit ? 2 : 1} className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {Object.entries(classStats.counts)
                        .filter(([, v]) => v > 0)
                        .map(([label, count]) => {
                          const cfg = HOC_LUC_CONFIG[label];
                          return (
                            <span
                              key={label}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg?.cls}`}
                            >
                              <span>{cfg?.icon}</span>
                              {label}: {count}
                            </span>
                          );
                        })}
                      {Object.values(classStats.counts).every(v => v === 0) && (
                        <span className="text-amber-300 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
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
