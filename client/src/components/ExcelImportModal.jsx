import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, X, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';

const LOAI_DIEM_MAP = {
  'miệng': 'mieng', 'mieng': 'mieng',
  '15phút': '15phut', '15phut': '15phut', '15': '15phut',
  '1tiết': '1tiet', '1tiet': '1tiet', '1t': '1tiet',
};

const normalizePresent = (v) => {
  if (v === true || v === 1) return true;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'có' || s === 'co' || s === 'true' || s === 'x';
};

function parseGradeSheet(rows) {
  return rows.map((row, i) => {
    const studentId = row['studentId'] || row['ID'] || row['id'];
    const loaiRaw = String(row['loaiDiem'] || row['Loại điểm'] || '').toLowerCase().trim();
    const loaiDiem = LOAI_DIEM_MAP[loaiRaw] || loaiRaw;
    const hocKy = Number(row['hocKy'] || row['Học kỳ'] || row['HK'] || 1);
    const diem = Number(row['diem'] || row['Điểm'] || row['diem']);
    const ghiChu = row['ghiChu'] || row['Ghi chú'] || '';
    const hoTen = row['hoTen'] || row['Họ tên'] || '';
    const errors = [];
    if (!studentId) errors.push('Thiếu studentId');
    if (!['mieng', '15phut', '1tiet'].includes(loaiDiem)) errors.push(`Loại điểm "${loaiRaw}" không hợp lệ`);
    if (![1, 2].includes(hocKy)) errors.push(`Học kỳ "${hocKy}" không hợp lệ`);
    if (isNaN(diem) || diem < 0 || diem > 10) errors.push(`Điểm "${row['diem'] ?? row['Điểm']}" không hợp lệ`);
    return { row: i + 1, studentId, hoTen, loaiDiem, hocKy, diem, ghiChu, errors };
  });
}

function parseAttendanceSheet(rows) {
  return rows.map((row, i) => {
    const studentId = row['studentId'] || row['ID'] || row['id'];
    const date = row['date'] || row['Ngày'] || row['ngay'] || '';
    const presentRaw = row['present'] ?? row['Có mặt'] ?? row['Điểm danh'] ?? '';
    const present = normalizePresent(presentRaw);
    const ghiChu = row['ghiChu'] || row['Ghi chú'] || '';
    const hoTen = row['hoTen'] || row['Họ tên'] || '';
    const errors = [];
    if (!studentId) errors.push('Thiếu studentId');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`Ngày "${date}" không đúng định dạng YYYY-MM-DD`);
    return { row: i + 1, studentId, hoTen, date, present, ghiChu, errors };
  });
}

export default function ExcelImportModal({ type, lopId, onSuccess, onClose }) {
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const toast = useToast();

  const isGrades = type === 'grades';
  const templateUrl = isGrades
    ? `/api/export/grades/${lopId}`
    : `/api/export/attendance/${lopId}`;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const result = isGrades ? parseGradeSheet(rows) : parseAttendanceSheet(rows);
      setParsed(result);
    };
    reader.readAsArrayBuffer(file);
  };

  const validRows = parsed?.filter(r => r.errors.length === 0) ?? [];
  const errorRows = parsed?.filter(r => r.errors.length > 0) ?? [];

  const handleSubmit = async () => {
    if (!validRows.length) return;
    setLoading(true);
    try {
      const endpoint = isGrades ? '/grades/import' : '/attendance/import';
      const { data } = await api.post(endpoint, { lopId, rows: validRows });
      toast(`Đã nhập ${data.inserted + data.updated} bản ghi${errorRows.length ? `, bỏ qua ${errorRows.length} hàng lỗi` : ''}.`, 'success');
      onSuccess();
      onClose();
    } catch {
      toast('Nhập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#3d1515]">
            Nhập {isGrades ? 'điểm' : 'điểm danh'} từ Excel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Bước 1 — Tải file mẫu</p>
            <a
              href={templateUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" /> Tải mẫu Excel
            </a>
            <p className="text-xs text-blue-600 mt-2">
              Điền vào file mẫu, giữ nguyên cột <code>studentId</code>. Không xóa hoặc đổi tên cột.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-[#e5d5b5] p-4">
            <p className="text-sm font-semibold text-[#3d1515] mb-2">Bước 2 — Tải file lên</p>
            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl py-8 hover:border-[#8B0000] transition">
              <Upload className="w-8 h-8 text-gray-300" />
              <span className="text-sm text-gray-500">Chọn file .xlsx hoặc .csv</span>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* Preview */}
          {parsed && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                {validRows.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> {validRows.length} hàng hợp lệ
                  </span>
                )}
                {errorRows.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errorRows.length} hàng lỗi (sẽ bỏ qua)
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <th className="px-3 py-2 text-left font-semibold">Họ tên</th>
                      {isGrades ? (
                        <>
                          <th className="px-3 py-2 text-left font-semibold">Loại</th>
                          <th className="px-3 py-2 text-left font-semibold">HK</th>
                          <th className="px-3 py-2 text-left font-semibold">Điểm</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-left font-semibold">Ngày</th>
                          <th className="px-3 py-2 text-left font-semibold">Có mặt</th>
                        </>
                      )}
                      <th className="px-3 py-2 text-left font-semibold">Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 15).map(r => (
                      <tr key={r.row} className={r.errors.length ? 'bg-red-50' : ''}>
                        <td className="px-3 py-1.5 text-gray-400">{r.row}</td>
                        <td className="px-3 py-1.5 font-medium text-[#3d1515]">{r.hoTen || '—'}</td>
                        {isGrades ? (
                          <>
                            <td className="px-3 py-1.5">{r.loaiDiem}</td>
                            <td className="px-3 py-1.5">{r.hocKy}</td>
                            <td className="px-3 py-1.5">{r.diem}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-1.5">{r.date}</td>
                            <td className="px-3 py-1.5">{r.present ? '✓' : '✗'}</td>
                          </>
                        )}
                        <td className="px-3 py-1.5 text-red-600">{r.errors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 15 && (
                  <p className="text-xs text-gray-400 text-center py-2">... và {parsed.length - 15} hàng nữa</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 font-medium transition">
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!validRows.length || loading}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-[#8B0000] text-white hover:bg-[#6a0000] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang nhập...' : `Xác nhận nhập ${validRows.length > 0 ? `(${validRows.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
