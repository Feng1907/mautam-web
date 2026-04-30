import { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, UserPlus, Users, History, Upload, X } from 'lucide-react';
import api from '../services/api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import imageCompression from 'browser-image-compression';

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

// ── Helpers học lực ──────────────────────────────────────────────────────────
const LOAI_DIEM_HS = [
  { key: 'mieng', heSo: 1 }, { key: '15phut', heSo: 1 }, { key: '1tiet', heSo: 2 },
];
const tinhTBHS = (gs) => {
  if (!gs.length) return null;
  let th=0,td=0;
  gs.forEach(g => { const h=LOAI_DIEM_HS.find(l=>l.key===g.loaiDiem)?.heSo||1; th+=h; td+=g.diem*h; });
  return th ? (td/th).toFixed(1) : null;
};
const phanLoaiHS = (d) => {
  if (!d) return '—';
  const v=parseFloat(d);
  if(v>=9) return 'Xuất sắc'; if(v>=8) return 'Giỏi';
  if(v>=6.5) return 'Khá'; if(v>=5) return 'TB'; return 'Yếu';
};
const HL_COLOR = {
  'Xuất sắc':'text-amber-700','Giỏi':'text-blue-700','Khá':'text-emerald-700',
  'TB':'text-gray-600','Yếu':'text-red-600','—':'text-gray-400',
};

// ── Upload avatar lên Firebase Storage ───────────────────────────────────────
const uploadAvatar = async (file, studentId, onProgress) => {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3, maxWidthOrHeight: 400, useWebWorker: true,
  });
  const storageRef = ref(storage, `avatars/students/${studentId}_${Date.now()}.webp`);
  const task = uploadBytesResumable(storageRef, compressed);
  await new Promise((resolve, reject) => {
    task.on('state_changed',
      snap => onProgress?.(Math.round(snap.bytesTransferred/snap.totalBytes*100)),
      reject, resolve
    );
  });
  return getDownloadURL(task.snapshot.ref);
};

// ── Modal lịch sử điểm ───────────────────────────────────────────────────────
const LichSuModal = ({ student, lopId, onClose }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    api.get(`/students/${lopId}/${student._id}/lich-su`)
      .then(r => setData(r.data.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [student._id, lopId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl shadow-2xl"
        style={{ background: '#fffcf9', border: '1px solid #e5d5b5' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b"
          style={{ borderColor: '#e5d5b5' }}>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#8B0000]" />
            <h3 className="font-bold text-[#3d1515]">Lịch sử điểm</h3>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {student.tenThanh} <span className="font-semibold">{student.hoTen}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {loading && (
            <p className="text-center text-gray-400 py-6 italic text-sm">Đang tải...</p>
          )}
          {!loading && data?.length === 0 && (
            <p className="text-center text-gray-400 py-6 italic text-sm">Chưa có dữ liệu điểm.</p>
          )}
          {data?.map(entry => {
            const hk1 = entry.grades.filter(g => g.hocKy === 1);
            const hk2 = entry.grades.filter(g => g.hocKy === 2);
            const cc1 = entry.chuyenCan.find(c => c.hocKy === 1);
            const cc2 = entry.chuyenCan.find(c => c.hocKy === 2);
            return (
              <div key={entry.namHoc._id} className="rounded-xl border overflow-hidden"
                style={{ borderColor: '#e5d5b5' }}>
                <div className="px-4 py-2 text-xs font-bold text-[#8B0000] uppercase tracking-wide"
                  style={{ background: '#fdf5e6' }}>
                  {entry.namHoc.ten}
                </div>
                <div className="grid grid-cols-2 divide-x" style={{ borderColor: '#e5d5b5' }}>
                  {[{gs: hk1, cc: cc1, hk: 1}, {gs: hk2, cc: cc2, hk: 2}].map(({ gs, cc, hk }) => {
                    const tb  = tinhTBHS(gs);
                    const tk  = tb && cc ? (parseFloat(tb)*0.8 + cc.diem*0.2).toFixed(1) : (tb || (cc ? cc.diem.toFixed(1) : null));
                    const loai = phanLoaiHS(tk);
                    return (
                      <div key={hk} className="px-4 py-3 text-xs">
                        <p className="font-semibold text-gray-500 mb-2">Học kỳ {hk}</p>
                        {gs.length === 0 && !cc ? (
                          <p className="text-gray-300 italic">—</p>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {tb && <p>TBM: <span className="font-bold text-[#3d1515]">{tb}</span></p>}
                            {cc  && <p>CC: <span className="font-bold text-emerald-700">{cc.diem.toFixed(1)}</span></p>}
                            {tk  && <p>Tổng kết: <span className={`font-bold text-base ${HL_COLOR[loai]}`}>{tk}</span></p>}
                            {loai !== '—' && (
                              <p className={`font-semibold ${HL_COLOR[loai]}`}>{loai}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t" style={{ borderColor: '#e5d5b5' }}>
          <button onClick={onClose}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatar || null);
  const [uploadPct,     setUploadPct]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isEdit = !!initial?._id;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPh = (k, v) => setForm(f => ({ ...f, phuHuynh: { ...f.phuHuynh, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenThanh.trim()) return setError('Vui lòng nhập Tên Thánh');
    if (!form.hoTen.trim())    return setError('Vui lòng nhập họ tên');
    setError(''); setSaving(true);
    try {
      let avatarUrl = initial?.avatar || undefined;
      if (avatarFile) {
        const studentId = initial?._id || `new_${Date.now()}`;
        avatarUrl = await uploadAvatar(avatarFile, studentId, setUploadPct);
      }
      const payload = { ...form, lop: lopId, ...(avatarUrl ? { avatar: avatarUrl } : {}) };
      const res = isEdit
        ? await api.put(`/students/${lopId}/${initial._id}`, payload)
        : await api.post('/students', payload);
      onSaved(res.data.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); setUploadPct(0); }
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

          {/* Avatar upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Ảnh thẻ <span className="font-normal text-gray-400">(tuỳ chọn)</span>
            </label>
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                <div className="relative shrink-0">
                  <img src={avatarPreview} alt="avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-200" />
                  <button type="button"
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-200 flex items-center justify-center text-gray-300 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <label className="cursor-pointer flex-1">
                <span className="block text-xs text-center py-2 rounded-xl border border-dashed border-[#D4AF37]/60 text-[#8B0000] hover:bg-amber-50 transition">
                  {avatarFile ? avatarFile.name.slice(0,24) : 'Chọn ảnh...'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            {saving && avatarFile && uploadPct > 0 && uploadPct < 100 && (
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-[#8B0000] transition-all" style={{ width: `${uploadPct}%` }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh <span className="font-normal text-gray-400">(tùy chọn)</span></label>
            <input type="date" className="input rounded-xl" value={form.ngaySinh}
              onChange={e => set('ngaySinh', e.target.value)}
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
  const [modal,        setModal]        = useState(null);
  const [lichSuModal,  setLichSuModal]  = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [search,       setSearch]       = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  // Thống kê giới tính — tính một lần khi students thay đổi
  const { soNam, soNu } = useMemo(() => ({
    soNam: students.filter(s => s.gioiTinh === 'Nam').length,
    soNu:  students.filter(s => s.gioiTinh === 'Nu').length,
  }), [students]);

  // Sắp xếp một lần, rồi lọc kết hợp search + genderFilter
  const sorted = useMemo(() => sortStudents(students), [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter(s => {
      const matchSearch = !q || `${s.tenThanh} ${s.hoTen}`.toLowerCase().includes(q);
      const matchGender =
        genderFilter === 'All' ||
        (genderFilter === 'Nam' && s.gioiTinh === 'Nam') ||
        (genderFilter === 'Nu'  && (s.gioiTinh === 'Nu' || !s.gioiTinh));
      return matchSearch && matchGender;
    });
  }, [sorted, search, genderFilter]);

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

        {/* Search */}
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

        {/* Bộ lọc giới tính */}
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value)}
          className="h-10 px-3 pr-8 text-sm outline-none transition shrink-0 appearance-none cursor-pointer"
          style={{
            borderRadius: '9999px',
            border: '1.5px solid #e5d5b5',
            background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23aaa\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 12px center',
            color: '#3d1515',
            minWidth: '110px',
          }}
          onFocus={e => (e.target.style.borderColor = '#D4AF37')}
          onBlur={e  => (e.target.style.borderColor = '#e5d5b5')}
        >
          <option value="All">Tất cả ({students.length})</option>
          <option value="Nam">♂ Nam ({soNam})</option>
          <option value="Nu"> ♀ Nữ  ({soNu})</option>
        </select>

        {/* Đếm kết quả */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-[#5a1a1a]">{filtered.length}</span>
          <span>/ {students.length} đoàn sinh</span>
          {(search || genderFilter !== 'All') && filtered.length !== students.length && (
            <span className="text-xs text-gray-400">(đang lọc)</span>
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
                <th className="px-3 py-3 text-center w-12">Ảnh</th>
                <th className="px-4 py-3 text-left min-w-52">Đoàn sinh</th>
                <th className="px-4 py-3 text-left">Ngày sinh</th>
                <th className="px-4 py-3 text-center">Giới tính</th>
                <th className="px-4 py-3 text-left">Phụ huynh</th>
                <th className="px-4 py-3 text-center w-28">Thao tác</th>
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

                  {/* Avatar */}
                  <td className="px-3 py-2 text-center">
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.hoTen}
                        className="w-9 h-9 rounded-full object-cover border border-amber-200 mx-auto" />
                    ) : (
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white mx-auto ${
                        s.gioiTinh === 'Nam' ? 'bg-sky-400' : 'bg-pink-400'
                      }`}>
                        {s.hoTen?.trim().split(' ').pop()?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </td>

                  {/* Tên Thánh + Họ tên — xếp dọc */}
                  <td className="px-4 py-3">
                    <TenThanhBadge tenThanh={s.tenThanh} gioiTinh={s.gioiTinh} />
                    <p className="font-semibold text-[#3d1515] mt-0.5 leading-tight">{s.hoTen}</p>
                  </td>

                  <td className="px-4 py-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">
                    {s.ngaySinh
                      ? new Date(s.ngaySinh).toLocaleDateString('vi-VN')
                      : <span className="italic text-gray-300">Chưa cập nhật</span>}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {s.gioiTinh === 'Nam' ? (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">♂ Nam</span>
                    ) : s.gioiTinh === 'Nu' ? (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">♀ Nữ</span>
                    ) : (
                      <span className="text-xs italic text-gray-300">Chưa cập nhật</span>
                    )}
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

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setLichSuModal(s)}
                        title="Lịch sử điểm"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      {canEdit && (
                        <>
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 italic">
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

      {lichSuModal && (
        <LichSuModal
          student={lichSuModal}
          lopId={lopId}
          onClose={() => setLichSuModal(null)}
        />
      )}
    </div>
  );
};

export default StudentList;
