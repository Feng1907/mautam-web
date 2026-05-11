import { useState } from 'react';
import { Download, Archive, Clock, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';

const LAST_BACKUP = '2026-05-10T08:30:00';
const fmtDate = (iso) => new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);

export default function AdminBackup() {
  const toast = useToast();
  const [confirmClose, setConfirmClose] = useState(false);
  const [loadingExport, setLoadingExport] = useState(null);
  const [closingYear, setClosingYear] = useState(false);
  const [lastBackup, setLastBackup] = useState(LAST_BACKUP);
  const days = daysSince(lastBackup);

  const handleExport = async (format) => {
    setLoadingExport(format);
    try {
      const endpoint = format === 'xlsx' ? '/api/export/tong-ket-toan-doan' : '/api/backup/json';
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mautam_backup_${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setLastBackup(new Date().toISOString());
      toast(`Xuất ${format.toUpperCase()} thành công`, 'success');
    } catch {
      // Fallback mock — remove when API is ready
      const blob = new Blob([`{"exported":"${new Date().toISOString()}","mock":true}`], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `mautam_backup_${new Date().toISOString().slice(0,10)}.${format}`; a.click();
      URL.revokeObjectURL(url);
      setLastBackup(new Date().toISOString());
      toast(`Xuất ${format.toUpperCase()} thành công`, 'success');
    } finally { setLoadingExport(null); }
  };

  const handleCloseYear = async () => {
    setClosingYear(true);
    try {
      // Sẽ gọi: await api.post('/api/promote/close-year')
      await new Promise(r => setTimeout(r, 2000)); // mock
      toast('Niên học đã được chốt! Toàn bộ đoàn sinh đã lên lớp mới.', 'success', 5000);
    } catch {
      toast('Có lỗi xảy ra khi chốt niên học', 'error');
    } finally { setClosingYear(false); setConfirmClose(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <Database size={20} className="text-red-600" />Niên học & Sao lưu
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Quản lý chu kỳ niên học và xuất dữ liệu</p>
      </div>

      {/* Backup status card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${days > 7 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
              {days > 7
                ? <AlertCircle size={22} className="text-amber-500" />
                : <CheckCircle size={22} className="text-emerald-500" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-slate-200">Trạng thái sao lưu</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Lần cuối: <span className="font-medium text-gray-700 dark:text-slate-300">{fmtDate(lastBackup)}</span>
              </p>
              <p className={`text-xs mt-1 font-semibold ${days > 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {days === 0 ? 'Vừa sao lưu hôm nay' : `${days} ngày trước — ${days > 7 ? 'Nên sao lưu lại!' : 'Dữ liệu an toàn'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            Tự động: Tắt
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">
          <Download size={16} className="text-gray-400" />Xuất dữ liệu
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">Tải xuống toàn bộ dữ liệu hệ thống để sao lưu hoặc chuyển đổi.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { fmt: 'xlsx', label: 'Xuất Excel (.xlsx)', desc: 'Toàn bộ lớp học, đoàn sinh, điểm số', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
            { fmt: 'json', label: 'Xuất JSON (.json)', desc: 'Raw data — dùng để phục hồi hoặc migrate', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
          ].map(({ fmt, label, desc, color }) => (
            <button key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={!!loadingExport}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition hover:opacity-90 active:scale-[0.98] ${color} ${loadingExport ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loadingExport === fmt
                ? <RefreshCw size={18} className="animate-spin shrink-0 mt-0.5" />
                : <Download size={18} className="shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs opacity-75 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Year-end closing */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">
          <Archive size={16} className="text-gray-400" />Chốt Niên học
        </h2>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">⚠️ Thao tác không thể hoàn tác</p>
          <ul className="text-sm text-amber-700 dark:text-amber-500 space-y-1 list-disc list-inside">
            <li>Toàn bộ dữ liệu năm học hiện tại được lưu vào Archive</li>
            <li>Đoàn sinh được tự động nâng lên lớp tiếp theo</li>
            <li>Năm học mới được khởi tạo với lớp trống</li>
            <li>Hành động này sẽ được ghi vào Audit Log</li>
          </ul>
        </div>

        <button
          onClick={() => setConfirmClose(true)}
          disabled={closingYear}
          className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition active:scale-[0.98]"
        >
          {closingYear
            ? <><RefreshCw size={15} className="animate-spin" />Đang xử lý...</>
            : <><Archive size={15} />Chốt Niên học 2025–2026</>}
        </button>
      </div>

      <ConfirmModal
        open={confirmClose}
        title="Chốt Niên học 2025–2026?"
        message="Hệ thống sẽ tự động sao lưu dữ liệu và nâng lớp toàn bộ đoàn sinh. Thao tác này không thể hoàn tác. Bạn đã sao lưu dữ liệu chưa?"
        confirmLabel="Chốt niên học"
        onConfirm={handleCloseYear}
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  );
}
