import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ExportButton from './ExportButton';

// Rút gọn ngày 'YYYY-MM-DD' → 'DD/MM'
const shortDate = (d) => {
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
};

const AttendanceTable = ({ lopId, students, canEdit }) => {
  const [namHocList, setNamHocList]   = useState([]);
  const [selNamHoc,  setSelNamHoc]    = useState(null);   // object NamHoc đang chọn
  const [sundays,    setSundays]      = useState([]);
  const [records,    setRecords]      = useState([]);     // [{student, date, present}]
  const [saving,     setSaving]       = useState({});     // { 'studentId-date': true }
  const [loading,    setLoading]      = useState(true);

  // ── Fetch danh sách năm học ──────────────────────────────────────────────
  useEffect(() => {
    api.get('/namhoc').then(r => {
      const list = r.data.data;
      setNamHocList(list);
      const active = list.find(n => n.dangHoatDong) || list[0];
      setSelNamHoc(active || null);
    }).catch(() => {});
  }, []);

  // ── Fetch Chúa Nhật + bản ghi điểm danh khi đổi năm học ────────────────
  const loadData = useCallback(() => {
    if (!selNamHoc) return;
    setLoading(true);

    Promise.all([
      api.get('/attendance/sundays', {
        params: { startDate: selNamHoc.ngayBatDau, endDate: selNamHoc.ngayKetThuc },
      }),
      api.get(`/attendance/${lopId}`, { params: { namHocId: selNamHoc._id } }),
    ]).then(([sunRes, recRes]) => {
      setSundays(sunRes.data.data);
      setRecords(recRes.data.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [lopId, selNamHoc]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helper: lấy trạng thái 1 ô ──────────────────────────────────────────
  const getPresent = (studentId, date) =>
    records.find(r => r.student === studentId && r.date === date)?.present ?? false;

  // ── Toggle 1 ô điểm danh ────────────────────────────────────────────────
  const handleToggle = async (studentId, date, newVal) => {
    const key = `${studentId}-${date}`;
    setSaving(s => ({ ...s, [key]: true }));

    // Optimistic update
    setRecords(prev => {
      const idx = prev.findIndex(r => r.student === studentId && r.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], present: newVal };
        return next;
      }
      return [...prev, { student: studentId, date, present: newVal }];
    });

    try {
      await api.post('/attendance', {
        studentId, lopId, date, present: newVal, namHocId: selNamHoc._id,
      });
    } catch {
      // Rollback nếu lỗi
      setRecords(prev => {
        const idx = prev.findIndex(r => r.student === studentId && r.date === date);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], present: !newVal };
          return next;
        }
        return prev;
      });
    } finally {
      setSaving(s => { const n = { ...s }; delete n[key]; return n; });
    }
  };

  // ── Tính tổng có mặt theo từng học sinh ─────────────────────────────────
  const countPresent = (studentId) =>
    records.filter(r => r.student === studentId && r.present).length;

  // ── Tính tổng có mặt theo từng ngày ─────────────────────────────────────
  const countPresentByDate = (date) =>
    records.filter(r => r.date === date && r.present).length;

  // ── Ngày hôm nay để highlight cột ───────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">Đang tải dữ liệu điểm danh...</div>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar: chọn năm học + tóm tắt */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Năm học:</label>
          <select
            className="input w-auto! py-1! text-sm"
            value={selNamHoc?._id || ''}
            onChange={e => setSelNamHoc(namHocList.find(n => n._id === e.target.value))}
          >
            {namHocList.map(n => (
              <option key={n._id} value={n._id}>
                {n.ten}{n.dangHoatDong ? ' (đang hoạt động)' : ''}
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
        <p className="text-center text-gray-400 py-10">Lớp chưa có đoàn sinh.</p>
      )}

      {students.length > 0 && sundays.length === 0 && (
        <p className="text-center text-gray-400 py-10">Không có dữ liệu Chúa Nhật cho năm học này.</p>
      )}

      {students.length > 0 && sundays.length > 0 && (
        <>
          {/* Chú thích */}
          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm bg-green-500 inline-block" /> Có mặt
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm bg-red-200 inline-block" /> Vắng
            </span>
            {!canEdit && (
              <span className="text-orange-500">Chế độ xem — bạn không có quyền chỉnh sửa lớp này</span>
            )}
          </div>

          {/* Bảng lưới — scroll ngang */}
          <div className="card p-0 overflow-x-auto">
            <table className="text-sm border-collapse min-w-max w-full">
              <thead>
                {/* Hàng tháng */}
                <tr className="bg-gray-50 border-b">
                  <th className="sticky left-0 z-10 bg-gray-50 text-left px-4 py-2 font-medium text-gray-600 min-w-40">
                    Họ tên
                  </th>
                  {sundays.map(d => {
                    const isToday = d === today;
                    return (
                      <th
                        key={d}
                        className={`text-center px-2 py-2 font-medium w-12 ${
                          isToday ? 'bg-red-50 text-red-700' : 'text-gray-500'
                        }`}
                        title={d}
                      >
                        {shortDate(d)}
                      </th>
                    );
                  })}
                  <th className="text-center px-3 py-2 font-medium text-blue-700 bg-blue-50 min-w-15">
                    Có mặt
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-red-700 bg-red-50 min-w-15">
                    Vắng
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-gray-600 min-w-15">
                    %
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((s, idx) => {
                  const soCoMat = countPresent(s._id);
                  const soVang  = sundays.length - soCoMat;
                  const pct     = sundays.length > 0
                    ? Math.round((soCoMat / sundays.length) * 100) : 0;

                  return (
                    <tr
                      key={s._id}
                      className={`border-b last:border-0 hover:bg-gray-50/50 transition ${
                        idx % 2 === 0 ? '' : 'bg-gray-50/30'
                      }`}
                    >
                      {/* Cột tên — sticky */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-gray-800 border-r">
                        <span className="text-blue-600 text-xs mr-1">{s.tenThanh}</span>
                        {s.hoTen}
                      </td>

                      {/* Cột từng ngày */}
                      {sundays.map(d => {
                        const key     = `${s._id}-${d}`;
                        const present = getPresent(s._id, d);
                        const isSaving = saving[key];
                        const isToday  = d === today;

                        return (
                          <td
                            key={d}
                            className={`text-center p-1 ${isToday ? 'bg-red-50/50' : ''}`}
                          >
                            {canEdit ? (
                              <button
                                onClick={() => handleToggle(s._id, d, !present)}
                                disabled={isSaving}
                                className={`w-7 h-7 rounded-md text-xs font-bold transition ${
                                  isSaving
                                    ? 'opacity-50 cursor-wait'
                                    : present
                                      ? 'bg-green-500 hover:bg-green-600 text-white'
                                      : 'bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500'
                                }`}
                                title={present ? 'Có mặt — click để đổi' : 'Vắng — click để đổi'}
                              >
                                {isSaving ? '…' : present ? '✓' : '✗'}
                              </button>
                            ) : (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                                present ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-300'
                              }`}>
                                {present ? '✓' : '✗'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Tổng kết */}
                      <td className="text-center px-3 py-2 font-semibold text-green-700 bg-blue-50/50">
                        {soCoMat}
                      </td>
                      <td className="text-center px-3 py-2 font-semibold text-red-600 bg-red-50/50">
                        {soVang}
                      </td>
                      <td className="text-center px-3 py-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          pct >= 80 ? 'bg-green-100 text-green-700'
                          : pct >= 60 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Hàng tổng kết theo ngày */}
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300">
                  <td className="sticky left-0 z-10 bg-gray-100 px-4 py-2 font-semibold text-gray-600 text-xs border-r">
                    Sĩ số có mặt
                  </td>
                  {sundays.map(d => (
                    <td key={d} className="text-center px-1 py-2 text-xs font-semibold text-gray-600">
                      {countPresentByDate(d)}
                    </td>
                  ))}
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceTable;
