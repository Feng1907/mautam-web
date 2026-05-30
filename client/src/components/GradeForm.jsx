import { useEffect, useState, useMemo } from 'react';
import { Search, CalendarCheck, Trash2, Mail, X, Loader2, Upload } from 'lucide-react';
import api from '../services/api';
import ExportButton from './ExportButton';
import ExcelImportModal from './ExcelImportModal';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Highlight = ({ text = '', query = '' }) => {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-[#D4AF37]/30 text-[#3d1515] rounded px-0.5 not-italic">{p}</mark>
          : p
      )}
    </>
  );
};

const getTenChinh = (hoTen = '') => hoTen.trim().split(/\s+/).pop() ?? '';
const sortByTenChinh = (list) =>
  [...list].sort((a, b) =>
    getTenChinh(a.hoTen).localeCompare(getTenChinh(b.hoTen), 'vi', { sensitivity: 'base' })
  );

// ── Config ────────────────────────────────────────────────────────────────────
const LOAI_DIEM = [
  { key: 'mieng',  label: 'Miệng',   he_so: 1 },
  { key: '15phut', label: '15 phút', he_so: 1 },
  { key: '1tiet',  label: '1 tiết',  he_so: 2 },
];

const HOC_KY = [1, 2];

// Tỷ lệ đóng góp vào điểm tổng kết
const TI_LE_HOC_TAP   = 0.8;
const TI_LE_CHUYEN_CAN = 0.2;

// ── Tính TBM học tập (chưa nhân tỷ lệ) ──────────────────────────────────────
const tinhTrungBinh = (gradeList) => {
  if (!gradeList.length) return null;
  let tongHeSo = 0, tongDiem = 0;
  gradeList.forEach(g => {
    const heSo = LOAI_DIEM.find(l => l.key === g.loaiDiem)?.he_so || 1;
    tongHeSo += heSo;
    tongDiem += g.diem * heSo;
  });
  return tongHeSo ? (tongDiem / tongHeSo) : null;
};

// ── Tính điểm tổng kết = 80% học tập + 20% chuyên cần ───────────────────────
const tinhDiemTongKet = (tbHocTap, diemChuyenCan) => {
  if (tbHocTap === null && diemChuyenCan == null) return null;
  if (tbHocTap === null)   return parseFloat((diemChuyenCan * TI_LE_CHUYEN_CAN).toFixed(1));
  if (diemChuyenCan == null) return parseFloat(tbHocTap.toFixed(1));
  return parseFloat((tbHocTap * TI_LE_HOC_TAP + diemChuyenCan * TI_LE_CHUYEN_CAN).toFixed(1));
};

// ── Phân loại học lực ────────────────────────────────────────────────────────
const HOC_LUC_CONFIG = {
  'Xuất sắc': { icon: '♛', cls: 'bg-amber-50 text-amber-700 border border-amber-300 ring-1 ring-amber-200' },
  'Giỏi':     { icon: '★', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  'Khá':      { icon: '◆', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'TB':       { icon: '●', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  'Yếu':      { icon: '▼', cls: 'bg-red-50 text-red-700 border border-red-200' },
};

const phanLoai = (diem) => {
  if (diem === null || diem === undefined) return null;
  const v = parseFloat(diem);
  if (v >= 9)   return 'Xuất sắc';
  if (v >= 8)   return 'Giỏi';
  if (v >= 6.5) return 'Khá';
  if (v >= 5)   return 'TB';
  return 'Yếu';
};

// ── Score badges ──────────────────────────────────────────────────────────────
const ScoreBadge = ({ diem, onDelete, canEdit, deleting }) => {
  const color =
    diem >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : diem >= 5 ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-red-50 text-red-600 border-red-200';
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${color} group`}>
      {diem}
      {canEdit && (
        <button onClick={onDelete} disabled={deleting}
          className="opacity-0 group-hover:opacity-100 ml-0.5 text-current hover:opacity-70 transition leading-none"
          title="Xoá điểm này">×</button>
      )}
    </span>
  );
};

const HocLucBadge = ({ label }) => {
  const cfg = HOC_LUC_CONFIG[label];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className="text-[11px]">{cfg.icon}</span>{label}
    </span>
  );
};

// ── SVG watermark ─────────────────────────────────────────────────────────────
const CrossWatermark = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.035]"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
  >
    <defs>
      <pattern id="cross-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect x="35" y="16" width="10" height="48" rx="2" fill="#8B0000" />
        <rect x="20" y="28" width="40" height="10" rx="2" fill="#8B0000" />
        <circle cx="40" cy="12" r="4" fill="none" stroke="#8B0000" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cross-pattern)" />
  </svg>
);

// ── Modal nhập điểm học tập ───────────────────────────────────────────────────
const InputModal = ({ student, lopId, hocKy, onClose, onSaved }) => {
  const [form,   setForm]   = useState({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const res = await api.post('/grades', {
        student: student._id, lop: lopId, hocKy,
        loaiDiem: form.loaiDiem, diem: Number(form.diem), ghiChu: form.ghiChu,
      });
      onSaved(res.data.data);
      setForm({ loaiDiem: 'mieng', diem: '', ghiChu: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#FDFAF5] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-amber-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#8B0000] text-lg">✝</span>
          <h3 className="font-bold text-[#5a1a1a]">Nhập điểm</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 pl-6">
          {student.tenThanh} {student.hoTen} — Học kỳ {hocKy}
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-3">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại điểm</label>
            <select className="input rounded-xl" value={form.loaiDiem}
              onChange={e => setForm(f => ({ ...f, loaiDiem: e.target.value }))}>
              {LOAI_DIEM.map(l => (
                <option key={l.key} value={l.key}>{l.label} (hệ số {l.he_so})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Điểm (0 – 10)</label>
            <input type="number" min={0} max={10} step={0.5}
              className="input rounded-xl" placeholder="VD: 8.5"
              value={form.diem} onChange={e => setForm(f => ({ ...f, diem: e.target.value }))}
              required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
            <input type="text" className="input rounded-xl" placeholder="VD: KT tuần 5"
              value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl bg-[#8B0000] text-white text-sm font-semibold hover:bg-[#6e0000] transition disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Modal nhập điểm Chuyên cần ────────────────────────────────────────────────
const ChuyenCanModal = ({ student, lopId, hocKy, existing, onClose, onSaved }) => {
  const [mode,   setMode]   = useState(existing ? 'direct' : 'sessions');
  const [form,   setForm]   = useState({
    tongBuoi:      existing?.tongBuoi      ?? '',
    soBuoiDi:      existing?.soBuoiDi      ?? '',
    vangCoPhep:    existing?.vangCoPhep    ?? '',
    vangKhongPhep: existing?.vangKhongPhep ?? '',
    diem:          existing?.diem          ?? '',
    ghiChu:        existing?.ghiChu        ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // Tự tính điểm preview khi ở mode sessions
  const diemPreview = useMemo(() => {
    if (mode !== 'sessions') return null;
    const vKP = Number(form.vangKhongPhep) || 0;
    const vCP = Number(form.vangCoPhep)    || 0;
    return Math.min(10, Math.max(0, 10 - vKP * 1 - vCP * 0.5));
  }, [mode, form.vangKhongPhep, form.vangCoPhep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        studentId: student._id, lopId, hocKy,
        tongBuoi:      Number(form.tongBuoi)      || 0,
        soBuoiDi:      Number(form.soBuoiDi)      || 0,
        vangCoPhep:    Number(form.vangCoPhep)    || 0,
        vangKhongPhep: Number(form.vangKhongPhep) || 0,
        ghiChu: form.ghiChu,
      };
      if (mode === 'direct') {
        if (form.diem === '' || form.diem == null)
          return setError('Vui lòng nhập điểm chuyên cần');
        payload.diem = Number(form.diem);
      }
      // mode === 'sessions' → server tự tính diem
      const res = await api.post('/chuyen-can', payload);
      onSaved(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#FDFAF5] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-amber-100">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck className="w-4 h-4 text-[#8B0000]" />
          <h3 className="font-bold text-[#5a1a1a]">Điểm Chuyên cần</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3 pl-6">
          {student.tenThanh} {student.hoTen} — HK {hocKy}
        </p>

        {/* Mode switcher */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl border" style={{ borderColor: '#e5d5b5', background: '#fdf5e6' }}>
          {[
            { key: 'sessions', label: 'Nhập từ buổi' },
            { key: 'direct',   label: 'Nhập điểm thẳng' },
          ].map(m => (
            <button key={m.key} type="button"
              onClick={() => setMode(m.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === m.key ? 'bg-[#8B0000] text-white shadow-sm' : 'text-gray-500 hover:text-[#5a1a1a]'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2 mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Tổng số buổi (hiển thị cả hai mode) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tổng số buổi</label>
              <input type="number" min={0} className="input rounded-xl" placeholder="VD: 18"
                value={form.tongBuoi} onChange={e => setForm(f => ({ ...f, tongBuoi: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Số buổi đi</label>
              <input type="number" min={0} className="input rounded-xl" placeholder="VD: 15"
                value={form.soBuoiDi} onChange={e => setForm(f => ({ ...f, soBuoiDi: e.target.value }))} />
            </div>
          </div>

          {mode === 'sessions' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vắng có phép
                    <span className="text-gray-400 font-normal ml-1">(−0.5đ/buổi)</span>
                  </label>
                  <input type="number" min={0} className="input rounded-xl" placeholder="0"
                    value={form.vangCoPhep}
                    onChange={e => setForm(f => ({ ...f, vangCoPhep: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vắng không phép
                    <span className="text-gray-400 font-normal ml-1">(−1đ/buổi)</span>
                  </label>
                  <input type="number" min={0} className="input rounded-xl" placeholder="0"
                    value={form.vangKhongPhep}
                    onChange={e => setForm(f => ({ ...f, vangKhongPhep: e.target.value }))} />
                </div>
              </div>

              {/* Preview điểm tự tính */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-xl border text-sm"
                style={{ borderColor: '#D4AF37', background: '#fffbf0' }}
              >
                <span className="text-gray-600 font-medium">Điểm chuyên cần tự tính:</span>
                <span className="font-bold text-lg"
                  style={{ color: diemPreview >= 8 ? '#15803d' : diemPreview >= 5 ? '#1d4ed8' : '#dc2626' }}>
                  {diemPreview?.toFixed(1)}
                </span>
              </div>
            </>
          )}

          {mode === 'direct' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Điểm chuyên cần (0 – 10)
              </label>
              <input type="number" min={0} max={10} step={0.5}
                className="input rounded-xl" placeholder="VD: 8.5"
                value={form.diem}
                onChange={e => setForm(f => ({ ...f, diem: e.target.value }))}
                required autoFocus />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú (tuỳ chọn)</label>
            <input type="text" className="input rounded-xl"
              placeholder="VD: Nghỉ lễ thánh quan thầy có phép..."
              value={form.ghiChu}
              onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B0000, #b8860b)' }}>
              {saving ? 'Đang lưu...' : existing ? 'Cập nhật' : 'Lưu'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Component chính ───────────────────────────────────────────────────────────
const GradeForm = ({ lopId, students, canEdit }) => {
  const [grades,      setGrades]      = useState([]);
  const [chuyenCans,  setChuyenCans]  = useState([]);
  const [hocKy,       setHocKy]       = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [ccModal,     setCcModal]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [search,       setSearch]       = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  // ── State gửi bảng điểm ───────────────────────────────────────────────────
  const [bdModal,    setBdModal]    = useState(false);
  const [bdHocKySend, setBdHocKySend] = useState(1); // học kỳ chọn trong modal
  const [bdSending,  setBdSending]  = useState(false);
  const [bdResult,   setBdResult]   = useState(null);
  const [importModal, setImportModal] = useState(false);

  const countWithEmail = useMemo(
    () => students.filter(s => s.phuHuynh?.email).length,
    [students]
  );

  const handleSendBangDiem = async () => {
    setBdSending(true);
    try {
      const res = await api.post('/notify/bang-diem', { lopId, hocKy: bdHocKySend });
      setBdResult(res.data);
    } catch (err) {
      setBdResult({ sent: 0, skipped: 0, errors: [{ error: err.response?.data?.message || err.message }], summary: {} });
    } finally {
      setBdSending(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [gRes, ccRes] = await Promise.all([
          api.get(`/grades/${lopId}`,      { params: { hocKy } }),
          api.get(`/chuyen-can/${lopId}`,  { params: { hocKy } }),
        ]);
        if (!cancelled) {
          setGrades(gRes.data.data);
          setChuyenCans(ccRes.data.data);
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [lopId, hocKy]);

  const sorted   = useMemo(() => sortByTenChinh(students), [students]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter(s => {
      const matchSearch = !q || `${s.tenThanh} ${s.hoTen}`.toLowerCase().includes(q);
      const matchGender = genderFilter === 'All'
        || (genderFilter === 'Nam' && s.gioiTinh === 'Nam')
        || (genderFilter === 'Nu'  && (s.gioiTinh === 'Nu' || !s.gioiTinh));
      return matchSearch && matchGender;
    });
  }, [sorted, search, genderFilter]);

  const gradesByStudent  = (studentId, loaiDiem) =>
    grades.filter(g => g.student?._id === studentId && g.loaiDiem === loaiDiem);

  const ccByStudent = (studentId) =>
    chuyenCans.find(c => (c.student?._id || c.student) === studentId) ?? null;

  const handleGradeSaved = (newGrade)  => setGrades(prev => [...prev, newGrade]);

  const handleCcSaved = (saved) => {
    setChuyenCans(prev => {
      const idx = prev.findIndex(c =>
        (c.student?._id || c.student) === (saved.student?._id || saved.student)
      );
      return idx >= 0 ? prev.map((c, i) => i === idx ? saved : c) : [...prev, saved];
    });
    setCcModal(null);
  };

  const handleCcDelete = async (ccId) => {
    if (!window.confirm('Xoá điểm chuyên cần này?')) return;
    try {
      await api.delete(`/chuyen-can/${ccId}`);
      setChuyenCans(prev => prev.filter(c => c._id !== ccId));
    } catch { alert('Xoá thất bại.'); }
  };

  const handleGradeDelete = async (gradeId) => {
    if (!window.confirm('Xoá điểm này?')) return;
    setDeleting(gradeId);
    try {
      await api.delete(`/grades/${gradeId}`);
      setGrades(prev => prev.filter(g => g._id !== gradeId));
    } catch { alert('Xoá thất bại, thử lại.'); }
    finally { setDeleting(null); }
  };

  // Thống kê footer
  const classStats = (() => {
    const counts = { 'Xuất sắc': 0, 'Giỏi': 0, 'Khá': 0, 'TB': 0, 'Yếu': 0 };
    const dks = [];
    students.forEach(s => {
      const tbRaw  = tinhTrungBinh(grades.filter(g => g.student?._id === s._id));
      const cc     = ccByStudent(s._id);
      const dk     = tinhDiemTongKet(tbRaw, cc?.diem ?? null);
      if (dk !== null) {
        dks.push(dk);
        const label = phanLoai(dk);
        if (label) counts[label]++;
      }
    });
    const classDk = dks.length
      ? (dks.reduce((a, b) => a + b, 0) / dks.length).toFixed(1)
      : null;
    return { counts, classDk };
  })();

  const { soNam, soNu } = useMemo(() => ({
    soNam: students.filter(s => s.gioiTinh === 'Nam').length,
    soNu:  students.filter(s => s.gioiTinh === 'Nu').length,
  }), [students]);

  if (loading) return (
    <div className="text-center py-12 text-[#8B0000]/40 text-sm italic tracking-wide">
      ✝ Đang tải bảng điểm...
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Học kỳ */}
          <label className="text-sm text-[#5a1a1a] font-medium shrink-0">Học kỳ:</label>
          <div className="flex gap-1.5">
            {HOC_KY.map(hk => (
              <button key={hk} onClick={() => setHocKy(hk)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                  hocKy === hk
                    ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-sm'
                    : 'text-[#5a1a1a] border-[#D4AF37]/50 hover:border-[#8B0000]/40 bg-amber-50/50'
                }`}>
                HK {hk}
              </button>
            ))}
          </div>

          {/* Tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: '#D4AF37' }} />
            <input
              className="h-9 pl-8 pr-3 text-sm bg-white outline-none transition w-48"
              style={{ borderRadius: '9999px', border: '1.5px solid #e5d5b5', color: '#3d1515' }}
              onFocus={e => (e.target.style.borderColor = '#D4AF37')}
              onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
              placeholder="Tìm tên Thánh, họ tên..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Lọc giới tính */}
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="h-9 px-3 pr-7 text-sm outline-none transition shrink-0 appearance-none cursor-pointer"
            style={{
              borderRadius: '9999px',
              border: '1.5px solid #e5d5b5',
              background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23aaa\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 10px center',
              color: '#3d1515', minWidth: '100px',
            }}
            onFocus={e => (e.target.style.borderColor = '#D4AF37')}
            onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
          >
            <option value="All">Tất cả ({students.length})</option>
            <option value="Nam">♂ Nam ({soNam})</option>
            <option value="Nu">♀ Nữ ({soNu})</option>
          </select>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-3 text-xs text-gray-500">
            {LOAI_DIEM.map(l => (
              <span key={l.key} className="flex items-center gap-1">
                <span className="font-medium text-[#5a1a1a]">{l.label}</span>
                <span className="text-[#D4AF37]">×{l.he_so}</span>
              </span>
            ))}
            <span className="flex items-center gap-1 text-[#8B0000]">
              <span className="font-medium">HT×{TI_LE_HOC_TAP * 100}%</span>
              <span>+</span>
              <span className="font-medium">CC×{TI_LE_CHUYEN_CAN * 100}%</span>
            </span>
          </div>
          {canEdit && students.length > 0 && (
            <button
              onClick={() => { setBdResult(null); setBdHocKySend(hocKy); setBdModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all
                         text-white border border-[#8B0000]"
              style={{ background: 'linear-gradient(135deg,#8B0000,#6e1a1a)' }}
            >
              <Mail className="w-3.5 h-3.5" />
              Gửi bảng điểm phụ huynh
            </button>
          )}
          <ExportButton
            url={`/api/export/grades/${lopId}?hocKy=${hocKy}`}
            fileName={`BangDiem_HK${hocKy}.xlsx`}
            label="Xuất Excel"
          />
          {canEdit && (
            <button
              onClick={() => setImportModal(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl border border-[#8B0000]/30 text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition"
            >
              <Upload className="w-3.5 h-3.5" /> Nhập Excel
            </button>
          )}
        </div>
      </div>

      {students.length === 0 && (
        <p className="text-center text-gray-400 py-10 italic">Lớp chưa có đoàn sinh.</p>
      )}

      {/* ── Bảng điểm ── */}
      {students.length > 0 && (
        <div
          className="relative rounded-2xl border border-amber-100 shadow-md overflow-x-auto scrollbar-light"
          style={{ background: 'linear-gradient(180deg, #FDFAF5 0%, #faf5eb 100%)' }}
        >
          <CrossWatermark />
          <div className="relative">
            <table className="text-sm border-collapse min-w-max w-full">

              {/* ── Header ── */}
              <thead>
                <tr className="text-xs uppercase tracking-wide"
                  style={{ background: 'linear-gradient(90deg, #8B0000 0%, #6e1a1a 100%)' }}>
                  <th scope="col" className="sticky left-0 z-10 text-center px-2 py-3 w-10 text-amber-100/70 font-semibold"
                    style={{ background: '#8B0000' }}>STT</th>
                  <th scope="col" className="sticky left-10 z-10 text-left px-4 py-3 min-w-44 text-amber-100 font-semibold"
                    style={{ background: '#8B0000' }}>Đoàn sinh</th>
                  {LOAI_DIEM.map(l => (
                    <th scope="col" key={l.key} className="px-3 py-3 text-center min-w-32 text-amber-100 font-semibold">
                      {l.label}
                      <span className="text-[#D4AF37]/80 ml-1 normal-case font-normal">(×{l.he_so})</span>
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-3 text-center min-w-20 text-[#D4AF37] font-bold">TBM</th>
                  <th scope="col" className="px-3 py-3 text-center min-w-28 text-amber-100 font-semibold">
                    <span className="flex items-center justify-center gap-1">
                      <CalendarCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Chuyên cần
                    </span>
                  </th>
                  <th scope="col" className="px-3 py-3 text-center min-w-20 text-[#D4AF37] font-bold">Tổng kết</th>
                  <th scope="col" className="px-3 py-3 text-center min-w-28 text-amber-100 font-semibold">Học lực</th>
                  {canEdit && (
                    <th scope="col" className="px-3 py-3 text-center min-w-20 text-amber-100/70 font-semibold">Thao tác</th>
                  )}
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody>
                {filtered.map((s, idx) => {
                  const allGrades = grades.filter(g => g.student?._id === s._id);
                  const tbRaw     = tinhTrungBinh(allGrades);
                  const tb        = tbRaw !== null ? tbRaw.toFixed(1) : null;
                  const cc        = ccByStudent(s._id);
                  const dk        = tinhDiemTongKet(tbRaw, cc?.diem ?? null);
                  const loai      = phanLoai(dk);
                  const rowBg     = idx % 2 === 0 ? 'bg-transparent' : 'bg-amber-50/30';

                  return (
                    <tr key={s._id}
                      className={`border-b border-amber-100/60 last:border-0 hover:bg-amber-50/50 transition ${rowBg}`}>

                      {/* STT */}
                      <td className="sticky left-0 z-10 text-center text-xs text-gray-400 font-medium tabular-nums w-10 px-2 py-3"
                        style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#FAF5EB' }}>
                        {idx + 1}
                      </td>

                      {/* Tên — sticky */}
                      <td className="sticky left-10 z-10 px-4 py-3 border-r border-amber-100/60"
                        style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#FAF5EB' }}>
                        <span className="text-[#D4AF37] text-[11px] font-medium tracking-wide">
                          <Highlight text={s.tenThanh} query={search} />
                        </span>
                        <span className="block font-semibold text-[#3d1515] text-sm">
                          <Highlight text={s.hoTen} query={search} />
                        </span>
                      </td>

                      {/* Cột điểm theo loại */}
                      {LOAI_DIEM.map(l => {
                        const list = gradesByStudent(s._id, l.key);
                        return (
                          <td key={l.key} className="px-3 py-2.5 text-center">
                            <div className="flex flex-wrap gap-1 justify-center items-center">
                              {list.map(g => (
                                <ScoreBadge key={g._id} diem={g.diem}
                                  canEdit={canEdit} deleting={deleting === g._id}
                                  onDelete={() => handleGradeDelete(g._id)} />
                              ))}
                              {list.length === 0 && <span className="text-amber-200 text-xs">—</span>}
                            </div>
                          </td>
                        );
                      })}

                      {/* TBM học tập */}
                      <td className="px-3 py-2.5 text-center">
                        {tb !== null
                          ? <span className="font-bold text-base text-gray-500">{tb}</span>
                          : <span className="text-amber-200 text-xs">—</span>}
                      </td>

                      {/* Điểm Chuyên cần */}
                      <td className="px-3 py-2.5 text-center">
                        {cc ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-sm font-bold ${
                              cc.diem >= 8 ? 'text-emerald-600' : cc.diem >= 5 ? 'text-sky-600' : 'text-red-500'
                            }`}>
                              {cc.diem.toFixed(1)}
                            </span>
                            {(cc.tongBuoi > 0) && (
                              <span className="text-[10px] text-gray-400">
                                {cc.soBuoiDi}/{cc.tongBuoi} buổi
                              </span>
                            )}
                            {cc.ghiChu && (
                              <span className="text-[10px] text-gray-400 italic max-w-24 truncate"
                                title={cc.ghiChu}>
                                {cc.ghiChu}
                              </span>
                            )}
                            {canEdit && (
                              <button onClick={() => handleCcDelete(cc._id)}
                                className="text-[10px] text-red-400 hover:text-red-600 transition mt-0.5"
                                title="Xoá điểm chuyên cần">
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-200 text-xs">—</span>
                        )}
                      </td>

                      {/* Điểm Tổng kết = 80% HT + 20% CC */}
                      <td className="px-3 py-2.5 text-center">
                        {dk !== null ? (
                          <span className={`font-bold text-base ${
                            dk >= 8 ? 'text-emerald-700' : dk >= 5 ? 'text-sky-700' : 'text-red-600'
                          }`}>
                            {dk.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-amber-200 text-xs">—</span>
                        )}
                      </td>

                      {/* Học lực */}
                      <td className="px-3 py-2.5 text-center">
                        {loai ? <HocLucBadge label={loai} />
                               : <span className="text-amber-200 text-xs">—</span>}
                      </td>

                      {/* Thao tác */}
                      {canEdit && (
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setModal(s)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-[#8B0000]/30 text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition"
                              title="Thêm điểm học tập">
                              + Điểm
                            </button>
                            <button onClick={() => setCcModal(s)}
                              className="p-1.5 rounded-full border border-[#D4AF37]/40 text-[#8B0000] hover:bg-[#D4AF37]/20 transition"
                              title="Nhập điểm chuyên cần">
                              <CalendarCheck className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>

              {/* ── Footer thống kê ── */}
              <tfoot>
                <tr className="border-t-2 border-amber-200/60 text-xs" style={{ background: '#f5e6c8' }}>
                  <td className="sticky left-0 z-10 w-10" style={{ background: '#f5e6c8' }} />
                  <td className="sticky left-10 z-10 px-4 py-3 font-semibold text-[#8B0000] border-r border-amber-200/60"
                    style={{ background: '#f5e6c8' }}>
                    <span className="text-[#D4AF37] mr-1">✦</span>Thống kê lớp
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
                    {classStats.classDk ? (
                      <span className="font-bold text-base text-[#8B0000]">{classStats.classDk}</span>
                    ) : (
                      <span className="text-amber-300">—</span>
                    )}
                  </td>

                  {/* CC lớp — để trống */}
                  <td className="px-3 py-3" />

                  {/* Phân phối học lực */}
                  <td colSpan={canEdit ? 2 : 1} className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {Object.entries(classStats.counts)
                        .filter(([, v]) => v > 0)
                        .map(([label, count]) => {
                          const cfg = HOC_LUC_CONFIG[label];
                          return (
                            <span key={label}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg?.cls}`}>
                              <span>{cfg?.icon}</span>{label}: {count}
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

      {/* Modal nhập điểm học tập */}
      {modal && (
        <InputModal
          student={modal} lopId={lopId} hocKy={hocKy}
          onClose={() => setModal(null)}
          onSaved={(g) => { handleGradeSaved(g); setModal(null); }}
        />
      )}

      {/* Modal nhập điểm chuyên cần */}
      {ccModal && (
        <ChuyenCanModal
          student={ccModal} lopId={lopId} hocKy={hocKy}
          existing={ccByStudent(ccModal._id)}
          onClose={() => setCcModal(null)}
          onSaved={handleCcSaved}
        />
      )}

      {/* ── Modal gửi bảng điểm phụ huynh ── */}
      {bdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ background: 'linear-gradient(135deg,#8B0000,#6e1a1a)' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-bold text-white text-sm">Gửi bảng điểm cho phụ huynh</h3>
              </div>
              <button onClick={() => setBdModal(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5">
              {!bdResult ? (
                <>
                  {/* Chọn học kỳ */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chọn học kỳ gửi</p>
                    <div className="flex gap-2">
                      {[1, 2].map(hk => (
                        <button key={hk} onClick={() => setBdHocKySend(hk)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                            bdHocKySend === hk
                              ? 'bg-[#8B0000] text-white border-[#8B0000]'
                              : 'text-[#5a1a1a] border-[#D4AF37]/50 bg-amber-50/50 hover:border-[#8B0000]/40'
                          }`}>
                          Học kỳ {hk}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview thống kê */}
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm text-gray-700 space-y-1">
                    <p>
                      📧 Sẽ gửi cho{' '}
                      <strong className="text-[#8B0000]">{countWithEmail} phụ huynh</strong>{' '}
                      có email
                    </p>
                    <p className="text-gray-400 text-xs">
                      ⏭️ Bỏ qua {students.length - countWithEmail} phụ huynh chưa có email
                    </p>
                  </div>

                  {countWithEmail === 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-4">
                      <p className="text-xs text-orange-700">
                        ⚠️ Chưa có phụ huynh nào trong lớp có email. Vui lòng cập nhật thông tin đoàn sinh trước.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleSendBangDiem}
                      disabled={bdSending || countWithEmail === 0}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                                 text-white transition disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#8B0000,#6e1a1a)' }}
                    >
                      {bdSending
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gửi...</>
                        : <><Mail className="w-3.5 h-3.5" /> Gửi bảng điểm</>}
                    </button>
                    <button onClick={() => setBdModal(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                      Huỷ
                    </button>
                  </div>
                </>
              ) : (
                /* Kết quả */
                <>
                  <div className={`rounded-xl px-4 py-3 mb-4 ${
                    bdResult.errors?.length > 0
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      {bdResult.errors?.length > 0 ? '⚠️ Gửi hoàn tất (có lỗi)' : '✅ Gửi thành công'}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      ✅ Đã gửi: <strong className="text-green-700">{bdResult.sent}</strong> email
                      &emsp;
                      ⏭️ Bỏ qua: <strong className="text-gray-500">{bdResult.skipped}</strong>
                      {bdResult.errors?.length > 0 && (
                        <>&emsp;❌ Lỗi: <strong className="text-red-600">{bdResult.errors.length}</strong></>
                      )}
                    </p>
                    {/* Thống kê học lực */}
                    {bdResult.summary && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <p className="text-xs font-semibold text-gray-500 mb-1">📊 Học lực lớp HK{bdHocKySend}:</p>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {[
                            { key: 'xuatSac',   label: 'Xuất sắc',   cls: 'bg-amber-100 text-amber-700' },
                            { key: 'gioi',      label: 'Giỏi',       cls: 'bg-green-100 text-green-700' },
                            { key: 'kha',       label: 'Khá',        cls: 'bg-blue-100 text-blue-700' },
                            { key: 'trungBinh', label: 'Trung bình', cls: 'bg-orange-100 text-orange-700' },
                            { key: 'yeu',       label: 'Yếu',        cls: 'bg-red-100 text-red-700' },
                          ].map(({ key, label, cls }) => bdResult.summary[key] > 0 && (
                            <span key={key} className={`px-2 py-0.5 rounded-full font-semibold ${cls}`}>
                              {label}: {bdResult.summary[key]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setBdModal(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {importModal && (
        <ExcelImportModal
          type="grades"
          lopId={lopId}
          onSuccess={() => {
            // Reload grades
            api.get(`/grades/${lopId}`, { params: { hocKy } }).then(r => setGrades(r.data.data || []));
          }}
          onClose={() => setImportModal(false)}
        />
      )}
    </div>
  );
};

export default GradeForm;
