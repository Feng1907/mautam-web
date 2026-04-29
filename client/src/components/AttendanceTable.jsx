import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Minus, Loader2 } from 'lucide-react';
import api from '../services/api';
import ExportButton from './ExportButton';

// Lấy tên chính (từ cuối) để sort: "Nguyễn Ngọc Bảo Hân" → "Hân"
const getTenChinh = (hoTen = '') => hoTen.trim().split(/\s+/).pop() ?? '';
const sortByTenChinh = (list) =>
  [...list].sort((a, b) =>
    getTenChinh(a.hoTen).localeCompare(getTenChinh(b.hoTen), 'vi', { sensitivity: 'base' })
  );

const shortDate = (d) => {
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
};

// ── Thanh progress bar nhỏ ────────────────────────────────────────────────────
const ProgressBar = ({ pct }) => {
  const color =
    pct >= 80 ? '#16a34a'   // xanh lá
    : pct >= 60 ? '#d97706' // vàng
    : '#dc2626';            // đỏ

  return (
    <div className="flex flex-col items-center gap-1 min-w-13">
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ── Ô điểm danh ───────────────────────────────────────────────────────────────
const AttendanceCell = ({ present, isSaving, canEdit, onToggle, isToday }) => {
  const base = `flex items-center justify-center rounded-xl transition-all ${
    isToday ? 'ring-2 ring-[#D4AF37]/60' : ''
  }`;

  if (isSaving) {
    return (
      <div className={`${base} w-10 h-10 bg-gray-50 min-w-13`}>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (canEdit) {
    return (
      <button
        onClick={onToggle}
        title={present ? 'Có mặt — nhấn để đổi' : 'Vắng — nhấn để đổi'}
        className={`${base} w-10 h-10 active:scale-95 ${
          present
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
            : 'bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-400'
        }`}
      >
        {present
          ? <CheckCircle2 className="w-5 h-5" />
          : <Minus className="w-4 h-4" />
        }
      </button>
    );
  }

  return (
    <div className={`${base} w-10 h-10 ${
      present ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'
    }`}>
      {present
        ? <CheckCircle2 className="w-5 h-5" />
        : <Minus className="w-4 h-4" />
      }
    </div>
  );
};

// ── Component chính ───────────────────────────────────────────────────────────
const AttendanceTable = ({ lopId, students, canEdit }) => {
  const [namHocList, setNamHocList] = useState([]);
  const [selNamHoc,  setSelNamHoc]  = useState(null);
  const [sundays,    setSundays]    = useState([]);
  const [records,    setRecords]    = useState([]);
  const [saving,     setSaving]     = useState({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.get('/namhoc').then(r => {
      const list = r.data.data;
      setNamHocList(list);
      const active = list.find(n => n.dangHoatDong) || list[0];
      setSelNamHoc(active || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selNamHoc) return;
    
    let cancelled = false;

    Promise.all([
      api.get('/attendance/sundays', {
        params: { startDate: selNamHoc.ngayBatDau, endDate: selNamHoc.ngayKetThuc },
      }),
      api.get(`/attendance/${lopId}`, { params: { namHocId: selNamHoc._id } }),
    ]).then(([sunRes, recRes]) => {
      if (!cancelled) {
        setSundays(sunRes.data.data);
        setRecords(recRes.data.data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [lopId, selNamHoc]);

  const getPresent = (studentId, date) =>
    records.find(r => r.student === studentId && r.date === date)?.present ?? false;

  const handleToggle = async (studentId, date, newVal) => {
    const key = `${studentId}-${date}`;
    setSaving(s => ({ ...s, [key]: true }));
    setRecords(prev => {
      const idx = prev.findIndex(r => r.student === studentId && r.date === date);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = { ...next[idx], present: newVal }; return next;
      }
      return [...prev, { student: studentId, date, present: newVal }];
    });
    try {
      await api.post('/attendance', { studentId, lopId, date, present: newVal, namHocId: selNamHoc._id });
    } catch {
      setRecords(prev => {
        const idx = prev.findIndex(r => r.student === studentId && r.date === date);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = { ...next[idx], present: !newVal }; return next;
        }
        return prev;
      });
    } finally {
      setSaving(s => { const n = { ...s }; delete n[key]; return n; });
    }
  };

  const countPresent    = (studentId) => records.filter(r => r.student === studentId && r.present).length;
  const countPresentDay = (date)      => records.filter(r => r.date === date && r.present).length;
  const today = new Date().toISOString().slice(0, 10);

  // Danh sách đã sắp xếp theo tên chính
  const sorted = useMemo(() => sortByTenChinh(students), [students]);

  if (loading) return (
    <div className="text-center py-12 text-[#8B0000]/40 text-sm italic tracking-wide flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Đang tải dữ liệu điểm danh...
    </div>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#5a1a1a] font-medium">Năm học:</label>
          <select
            className="input w-auto! py-1! text-sm rounded-xl"
            value={selNamHoc?._id || ''}
            onChange={e => setSelNamHoc(namHocList.find(n => n._id === e.target.value))}
          >
            {namHocList.map(n => (
              <option key={n._id} value={n._id}>
                {n.ten}{n.dangHoatDong ? ' ✦ đang hoạt động' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">
            Tổng buổi: <strong className="text-gray-700">{sundays.length}</strong>
            &nbsp;·&nbsp;
            Đoàn sinh: <strong className="text-gray-700">{students.length}</strong>
          </span>
          {selNamHoc && (
            <ExportButton
              url={`/api/export/attendance/${lopId}?namHocId=${selNamHoc._id}`}
              fileName={`ChuyenCan_${lopId}_${selNamHoc.ten}.xlsx`}
              label="Xuất Excel"
            />
          )}
        </div>
      </div>

      {students.length === 0 && (
        <p className="text-center text-gray-400 py-10 italic">Lớp chưa có đoàn sinh.</p>
      )}

      {students.length > 0 && sundays.length === 0 && (
        <p className="text-center text-gray-400 py-10 italic">Không có dữ liệu Chúa Nhật cho năm học này.</p>
      )}

      {students.length > 0 && sundays.length > 0 && (
        <>
          {/* Chú thích */}
          <div className="flex gap-5 text-xs text-gray-500 flex-wrap items-center">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Có mặt
            </span>
            <span className="flex items-center gap-1.5">
              <Minus className="w-4 h-4 text-gray-300" />
              Vắng
            </span>
            {!canEdit && (
              <span className="text-orange-500 italic">Chế độ xem — bạn không có quyền chỉnh sửa lớp này</span>
            )}
          </div>

          {/* Bảng lưới */}
          <div
            className="rounded-2xl border border-[#e5d5b5] overflow-hidden shadow-md"
            style={{ background: '#FDFAF5' }}
          >
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse min-w-max w-full">
                <thead>
                  <tr
                    className="text-xs font-semibold text-amber-100 uppercase tracking-wide"
                    style={{ background: 'linear-gradient(90deg, #8B0000 0%, #6e1a1a 100%)' }}
                  >
                    <th
                      className="sticky left-0 z-10 text-center px-3 py-3 w-10 font-semibold"
                      style={{ background: '#8B0000' }}
                    >
                      STT
                    </th>
                    <th
                      className="sticky left-10 z-10 text-left px-4 py-3 min-w-44 font-semibold"
                      style={{ background: '#8B0000' }}
                    >
                      Họ tên
                    </th>
                    {sundays.map(d => (
                      <th
                        key={d}
                        className={`text-center px-1 py-3 w-12 font-medium ${
                          d === today ? 'text-[#D4AF37]' : 'text-amber-100/80'
                        }`}
                        title={d}
                      >
                        {shortDate(d)}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-emerald-300 min-w-15">Có mặt</th>
                    <th className="text-center px-3 py-3 text-red-300 min-w-12.5">Vắng</th>
                    <th className="text-center px-4 py-3 text-[#D4AF37] min-w-18">Tổng kết</th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((s, idx) => {
                    const soCoMat = countPresent(s._id);
                    const soVang  = sundays.length - soCoMat;
                    const pct     = sundays.length > 0
                      ? Math.round((soCoMat / sundays.length) * 100) : 0;
                    const rowBg   = idx % 2 === 0 ? 'transparent' : 'rgba(255,245,220,0.3)';

                    return (
                      <tr
                        key={s._id}
                        className="border-b border-amber-100/60 last:border-0 hover:bg-amber-50/50 transition"
                        style={{ background: rowBg }}
                      >
                        {/* STT */}
                        <td
                          className="sticky left-0 z-10 text-center text-xs text-gray-400 font-medium tabular-nums w-10 px-2 py-2"
                          style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#faf5eb' }}
                        >
                          {idx + 1}
                        </td>

                        {/* Tên — sticky */}
                        <td
                          className="sticky left-10 z-10 px-4 py-2 border-r border-amber-100/60"
                          style={{ background: idx % 2 === 0 ? '#FDFAF5' : '#faf5eb' }}
                        >
                          <span className="text-[#D4AF37] text-[11px] font-medium">{s.tenThanh}</span>
                          <span className="block font-semibold text-[#3d1515] text-sm leading-tight">{s.hoTen}</span>
                        </td>

                        {/* Ô điểm danh từng ngày */}
                        {sundays.map(d => {
                          const key     = `${s._id}-${d}`;
                          const present = getPresent(s._id, d);
                          return (
                            <td
                              key={d}
                              className={`text-center p-1 ${d === today ? 'bg-amber-50/60' : ''}`}
                            >
                              <AttendanceCell
                                present={present}
                                isSaving={!!saving[key]}
                                canEdit={canEdit}
                                onToggle={() => handleToggle(s._id, d, !present)}
                                isToday={d === today}
                              />
                            </td>
                          );
                        })}

                        {/* Có mặt */}
                        <td className="text-center px-3 py-2 font-bold text-emerald-700">
                          {soCoMat}
                        </td>

                        {/* Vắng */}
                        <td className="text-center px-3 py-2 font-bold text-red-600">
                          {soVang}
                        </td>

                        {/* Tổng kết % với progress bar */}
                        <td className="text-center px-4 py-2">
                          <ProgressBar pct={pct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer — sĩ số mỗi ngày */}
                <tfoot>
                  <tr className="border-t-2 border-amber-200/60 text-xs" style={{ background: '#f5e6c8' }}>
                    {/* ô trống cho cột STT */}
                    <td className="sticky left-0 z-10 w-10" style={{ background: '#f5e6c8' }} />
                    <td
                      className="sticky left-10 z-10 px-4 py-2.5 font-semibold text-[#8B0000] border-r border-amber-200/60"
                      style={{ background: '#f5e6c8' }}
                    >
                      <span className="text-[#D4AF37] mr-1">✦</span> Sĩ số có mặt
                    </td>
                    {sundays.map(d => (
                      <td key={d} className="text-center px-1 py-2.5 font-bold text-[#5a1a1a]">
                        {countPresentDay(d)}
                      </td>
                    ))}
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceTable;
