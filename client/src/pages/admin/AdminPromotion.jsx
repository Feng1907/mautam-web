import { useEffect, useState } from 'react';
import { ArrowRight, History, CheckSquare, Square, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SERIF = '"EB Garamond", Georgia, serif';
const SANS  = '"Inter", system-ui, sans-serif';

const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', badge: 'bg-pink-100   text-pink-700'   },
  AuNhi:    { label: 'Ấu Nhi',    badge: 'bg-green-100  text-green-700'  },
  ThieuNhi: { label: 'Thiếu Nhi', badge: 'bg-blue-100   text-blue-700'   },
  NghiaSi:  { label: 'Nghĩa Sĩ',  badge: 'bg-yellow-100 text-yellow-700' },
  HiepSi:   { label: 'Hiệp Sĩ',   badge: 'bg-amber-100  text-amber-800'  },
};

// ── Tab: Lên lớp ──────────────────────────────────────────────────────────────
const PromoteTab = ({ classes, namHocList }) => {
  const [fromLopId,  setFromLopId]  = useState('');
  const [toLopId,    setToLopId]    = useState('');
  const [namHocMoiId, setNamHocMoiId] = useState(
    () => namHocList.find(n => n.dangHoatDong)?._id || ''
  );
  const [students,   setStudents]   = useState([]);
  const [selected,   setSelected]   = useState(new Set());
  const [loadingSt,  setLoadingSt]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState('');

  // Fetch đoàn sinh khi chọn lớp nguồn
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!fromLopId) { setStudents([]); setSelected(new Set()); return; }
    setLoadingSt(true);
    api.get(`/students/${fromLopId}`)
      .then(r => { setStudents(r.data.data || []); setSelected(new Set()); })
      .catch(() => setStudents([]))
      .finally(() => setLoadingSt(false));
  }, [fromLopId]);

  const allChecked = students.length > 0 && selected.size === students.length;

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(students.map(s => s._id)));

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handlePromote = async () => {
    if (!fromLopId || !toLopId || !namHocMoiId)
      return setError('Hãy chọn đủ lớp nguồn, lớp đích và năm học mới');
    if (selected.size === 0)
      return setError('Hãy chọn ít nhất một đoàn sinh');
    if (fromLopId === toLopId)
      return setError('Lớp nguồn và lớp đích không được trùng nhau');

    const items = [...selected].map(id => ({
      studentId: id, fromLopId, toLopId,
    }));

    setSaving(true); setError(''); setResult(null);
    try {
      const res = await api.post('/promote', { items, namHocMoiId });
      setResult(res.data.message);
      // Gỡ các em đã chuyển khỏi danh sách
      setStudents(prev => prev.filter(s => !selected.has(s._id)));
      setSelected(new Set());
    } catch (err) {
      setError(err.response?.data?.message || 'Chuyển lớp thất bại');
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Bộ chọn ── */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{ borderColor: '#e5d5b5', background: '#fffcf9' }}
      >
        <h3 className="text-sm font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
          Cấu hình chuyển lớp
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Lớp nguồn */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Lớp nguồn (năm cũ)
            </label>
            <div className="relative">
              <select
                className="input rounded-xl w-full appearance-none pr-8"
                value={fromLopId}
                onChange={e => setFromLopId(e.target.value)}
              >
                <option value="">— Chọn lớp nguồn —</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.tenLop} ({NGANH_CFG[c.nhanh]?.label || c.nhanh})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mũi tên */}
          <div className="flex justify-center pt-5">
            <ArrowRight className="w-6 h-6 text-[#D4AF37]" />
          </div>

          {/* Lớp đích */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Lớp đích (năm mới)
            </label>
            <div className="relative">
              <select
                className="input rounded-xl w-full appearance-none pr-8"
                value={toLopId}
                onChange={e => setToLopId(e.target.value)}
              >
                <option value="">— Chọn lớp đích —</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id} disabled={c._id === fromLopId}>
                    {c.tenLop} ({NGANH_CFG[c.nhanh]?.label || c.nhanh})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Năm học mới */}
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Năm học mới</label>
          <select
            className="input rounded-xl w-full"
            value={namHocMoiId}
            onChange={e => setNamHocMoiId(e.target.value)}
          >
            {namHocList.map(n => (
              <option key={n._id} value={n._id}>
                {n.ten}{n.dangHoatDong ? ' ✦' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Thông báo ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-2.5 font-medium">
          ✓ {result}
        </div>
      )}

      {/* ── Danh sách đoàn sinh ── */}
      {fromLopId && (
        loadingSt ? <LoadingSpinner /> : (
          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ borderColor: '#e5d5b5', background: '#fffcf9' }}
          >
            {/* Header bảng */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: '#e5d5b5', background: '#fdf5e6' }}
            >
              <div className="flex items-center gap-3">
                <button onClick={toggleAll} className="text-[#8B0000] hover:opacity-70 transition">
                  {allChecked
                    ? <CheckSquare className="w-5 h-5" />
                    : <Square className="w-5 h-5" />
                  }
                </button>
                <span className="text-sm font-semibold text-[#3d1515]">
                  {selected.size > 0
                    ? `Đã chọn ${selected.size} / ${students.length} đoàn sinh`
                    : `${students.length} đoàn sinh trong lớp`
                  }
                </span>
              </div>

              <button
                onClick={handlePromote}
                disabled={saving || selected.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #8B0000, #b8860b)' }}
              >
                {saving ? 'Đang xử lý...' : `Chuyển ${selected.size} đoàn sinh →`}
              </button>
            </div>

            {students.length === 0 ? (
              <p className="text-center text-gray-400 italic py-10 text-sm">
                Lớp này chưa có đoàn sinh.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr
                      className="text-xs font-semibold text-amber-100 uppercase tracking-wide"
                      style={{ background: 'linear-gradient(90deg, #8B0000, #6e1a1a)' }}
                    >
                      <th className="px-4 py-2.5 w-10 text-center">✓</th>
                      <th className="px-4 py-2.5 text-left">STT</th>
                      <th className="px-4 py-2.5 text-left min-w-48">Đoàn sinh</th>
                      <th className="px-4 py-2.5 text-center">Giới tính</th>
                      <th className="px-4 py-2.5 text-left">Ngày sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const checked = selected.has(s._id);
                      return (
                        <tr
                          key={s._id}
                          onClick={() => toggle(s._id)}
                          className="border-b last:border-0 cursor-pointer transition-colors"
                          style={{
                            borderColor: 'rgba(229,213,181,0.5)',
                            background: checked
                              ? 'rgba(139,0,0,0.04)'
                              : i % 2 === 1 ? 'rgba(253,246,230,0.4)' : 'transparent',
                          }}
                        >
                          <td className="px-4 py-2.5 text-center">
                            {checked
                              ? <CheckSquare className="w-4 h-4 text-[#8B0000] mx-auto" />
                              : <Square className="w-4 h-4 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs tabular-nums">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mr-1.5 ${
                              s.gioiTinh === 'Nam' ? 'bg-sky-100 text-sky-600' : 'bg-pink-100 text-pink-600'
                            }`}>
                              {s.tenThanh}
                            </span>
                            <span className="font-semibold text-[#3d1515]">{s.hoTen}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              s.gioiTinh === 'Nam'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}>
                              {s.gioiTinh === 'Nam' ? '♂ Nam' : '♀ Nữ'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums">
                            {s.ngaySinh
                              ? new Date(s.ngaySinh).toLocaleDateString('vi-VN')
                              : <span className="italic text-gray-300">—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

// ── Tab: Lịch sử ──────────────────────────────────────────────────────────────
const HistoryTab = ({ namHocList }) => {
  const [namHocId, setNamHocId]     = useState('');
  const [history,  setHistory]      = useState([]);
  const [loading,  setLoading]      = useState(false);
  const [expanded, setExpanded]     = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    api.get('/promote/history', { params: { namHocId: namHocId || undefined } })
      .then(r => setHistory(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []); // eslint-disable-line

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="input rounded-xl w-auto!"
          value={namHocId}
          onChange={e => { setNamHocId(e.target.value); }}
        >
          <option value="">Tất cả năm học</option>
          {namHocList.map(n => (
            <option key={n._id} value={n._id}>{n.ten}</option>
          ))}
        </select>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
          style={{ background: '#8B0000' }}
        >
          Lọc
        </button>
      </div>

      {loading ? <LoadingSpinner /> : history.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-12 text-center text-gray-400 italic text-sm"
          style={{ borderColor: '#e5d5b5' }}
        >
          Chưa có lịch sử chuyển lớp nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map(h => (
            <div
              key={h._id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: '#e5d5b5', background: '#fffcf9' }}
            >
              {/* Header đợt */}
              <button
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-amber-50/40 transition"
                onClick={() => setExpanded(expanded === h._id ? null : h._id)}
              >
                <div>
                  <span className="font-semibold text-[#3d1515] text-sm">
                    Đợt chuyển lớp — {new Date(h.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="ml-3 text-xs text-gray-400">
                    {h.chiTiet.length} đoàn sinh · Năm học: {h.namHocMoi?.ten}
                  </span>
                  {h.thucHienBoi && (
                    <span className="ml-3 text-xs text-gray-400">
                      · Bởi: {h.thucHienBoi.hoTen}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === h._id ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Chi tiết */}
              {expanded === h._id && (
                <div className="border-t px-5 py-3" style={{ borderColor: '#e5d5b5' }}>
                  {h.ghiChu && (
                    <p className="text-xs text-gray-500 italic mb-3">Ghi chú: {h.ghiChu}</p>
                  )}
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="text-gray-500 border-b" style={{ borderColor: '#e5d5b5' }}>
                        <th className="pb-1.5 text-left font-semibold">Đoàn sinh</th>
                        <th className="pb-1.5 text-left font-semibold">Từ lớp</th>
                        <th className="pb-1.5 text-left font-semibold">Sang lớp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.chiTiet.map((item, i) => (
                        <tr key={i} className="border-b last:border-0" style={{ borderColor: '#f0e0c0' }}>
                          <td className="py-1.5 font-medium text-[#3d1515]">
                            {item.student?.tenThanh} {item.student?.hoTen}
                          </td>
                          <td className="py-1.5 text-gray-500">{item.fromLop?.tenLop || '—'}</td>
                          <td className="py-1.5 text-emerald-700 font-medium">{item.toLop?.tenLop || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Trang chính AdminPromotion ────────────────────────────────────────────────
const AdminPromotion = () => {
  const [tab,        setTab]        = useState('promote');
  const [classes,    setClasses]    = useState([]);
  const [namHocList, setNamHocList] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/namhoc'),
    ]).then(([cls, nh]) => {
      setClasses(cls.data.data || []);
      setNamHocList(nh.data.data || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
          Quản lý Niên học
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Chuyển lớp, lên lớp hàng loạt và xem lịch sử các đợt chuyển
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-2xl border"
        style={{ background: '#fffcf9', borderColor: '#e5d5b5' }}
      >
        {[
          { key: 'promote', label: '⬆ Lên lớp / Chuyển lớp' },
          { key: 'history', label: <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" />Lịch sử</span> },
        ].map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                active ? 'text-white shadow-sm' : 'text-gray-500 hover:text-[#5a1a1a] hover:bg-amber-50/60'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #8B0000, #6e1a1a)' } : {}}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'promote' && <PromoteTab classes={classes} namHocList={namHocList} />}
      {tab === 'history' && <HistoryTab namHocList={namHocList} />}
    </div>
  );
};

export default AdminPromotion;
