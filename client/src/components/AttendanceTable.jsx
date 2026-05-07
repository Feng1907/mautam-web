import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Minus, Loader2, Search, Mail, X } from 'lucide-react';
import api from '../services/api';
import ExportButton from './ExportButton';

// Highlight từ khoá trong chuỗi text
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

  const [search, setSearch] = useState('');

  // ── State gửi thông báo ────────────────────────────────────────────────────
  const [notifyModal, setNotifyModal] = useState(null); // null | { date, countEmail }
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult]   = useState(null); // { sent, skipped, errors }

  // Đếm số phụ huynh có email để hiện trong modal xác nhận
  const countWithEmail = useMemo(
    () => students.filter(s => s.phuHuynh?.email).length,
    [students]
  );

  const handleOpenNotify = (date) => {
    setNotifyResult(null);
    setNotifyModal({ date });
  };

  const handleSendNotify = async () => {
    if (!notifyModal) return;
    setNotifySending(true);
    try {
      const res = await api.post('/notify/diem-danh', {
        lopId: lopId,
        date:  notifyModal.date,
        sendAll: true,
      });
      setNotifyResult(res.data);
    } catch (err) {
      setNotifyResult({ sent: 0, skipped: 0, errors: [{ error: err.response?.data?.message || err.message }] });
    } finally {
      setNotifySending(false);
    }
  };

  // Sắp xếp một lần, lọc theo search (tên thánh + họ tên)
  const sorted   = useMemo(() => sortByTenChinh(students), [students]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? sorted.filter(s => `${s.tenThanh} ${s.hoTen}`.toLowerCase().includes(q))
      : sorted;
  }, [sorted, search]);

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

        {/* Trái: Năm học + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-[#5a1a1a] font-medium shrink-0">Năm học:</label>
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

          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: '#D4AF37' }}
            />
            <input
              className="h-9 pl-8 pr-3 text-sm bg-white outline-none transition w-52"
              style={{ borderRadius: '9999px', border: '1.5px solid #e5d5b5', color: '#3d1515' }}
              onFocus={e  => (e.target.style.borderColor = '#D4AF37')}
              onBlur={e   => (e.target.style.borderColor = '#e5d5b5')}
              placeholder="Tìm tên Thánh, họ tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Phải: Thống kê + Xuất Excel */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">
            Tổng buổi: <strong className="text-gray-700">{sundays.length}</strong>
            &nbsp;·&nbsp;
            {search && filtered.length !== students.length
              ? <><strong className="text-[#8B0000]">{filtered.length}</strong> / {students.length} đoàn sinh</>
              : <><strong className="text-gray-700">{students.length}</strong> đoàn sinh</>
            }
          </span>
          {/* Nút gửi thông báo — chỉ hiện khi có ngày hôm nay hoặc chọn ngày gần nhất */}
          {canEdit && sundays.length > 0 && (
            <button
              onClick={() => handleOpenNotify(sundays.includes(today) ? today : sundays[sundays.length - 1])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all
                         bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
            >
              <Mail className="w-3.5 h-3.5" />
              Gửi thông báo phụ huynh
            </button>
          )}
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
                  {filtered.map((s, idx) => {
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
                          <span className="text-[#D4AF37] text-[11px] font-medium">
                            <Highlight text={s.tenThanh} query={search} />
                          </span>
                          <span className="block font-semibold text-[#3d1515] text-sm leading-tight">
                            <Highlight text={s.hoTen} query={search} />
                          </span>
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

      {/* ── Modal xác nhận gửi thông báo ── */}
      {notifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-gray-800 text-sm">Gửi thông báo phụ huynh</h3>
              </div>
              <button onClick={() => setNotifyModal(null)} className="text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body modal */}
            <div className="px-5 py-4">
              {!notifyResult ? (
                <>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Gửi thông báo điểm danh ngày{' '}
                    <strong className="text-gray-800">
                      {new Date(notifyModal.date + 'T00:00:00').toLocaleDateString('vi-VN', {
                        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </strong>{' '}
                    cho{' '}
                    <strong className="text-amber-700">{countWithEmail} phụ huynh</strong> có email?
                  </p>
                  {countWithEmail === 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs text-orange-700">
                        ⚠️ Chưa có phụ huynh nào trong lớp có email. Vui lòng cập nhật thông tin phụ huynh trước.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSendNotify}
                      disabled={notifySending || countWithEmail === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold
                                 bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition"
                    >
                      {notifySending
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gửi...</>
                        : <><Mail className="w-3.5 h-3.5" /> Gửi</>}
                    </button>
                    <button
                      onClick={() => setNotifyModal(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                      Huỷ
                    </button>
                  </div>
                </>
              ) : (
                /* Kết quả sau khi gửi */
                <>
                  <div className={`rounded-xl px-4 py-3 mb-3 ${
                    notifyResult.errors?.length > 0
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {notifyResult.errors?.length > 0 ? '⚠️ Gửi hoàn tất (có lỗi)' : '✅ Gửi thành công'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Đã gửi: <strong className="text-green-700">{notifyResult.sent}</strong> email
                      &nbsp;·&nbsp;
                      Bỏ qua: <strong className="text-gray-500">{notifyResult.skipped}</strong>
                      {' '}(chưa có email)
                    </p>
                    {notifyResult.errors?.length > 0 && (
                      <p className="text-xs text-orange-700 mt-1">
                        Lỗi: {notifyResult.errors.length} email không gửi được
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifyModal(null)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
