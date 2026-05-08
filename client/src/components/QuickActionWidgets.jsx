/**
 * QuickActionWidgets — action widgets cho AdminDashboard:
 *  1. AddStudentModal       — thêm đoàn sinh nhanh
 *  2. ExportDropdown        — xuất Excel / in PDF
 *  3. SendNotifyModal       — gửi thông báo khẩn
 *  4. StickyNote            — ghi chú nhanh (localStorage)
 *  5. QuickAttendanceModal  — điểm danh nhanh ngay trên Dashboard
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, FileSpreadsheet, Bell, StickyNote as NoteIcon,
  X, Loader2, ChevronDown, Printer, CheckCircle2, AlertCircle,
  Search, CalendarCheck, Check, Minus,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import { formatClassName } from '../utils/formatClassName';

// ── Shared: Modal backdrop + container ───────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 'max-w-md' }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Panel */}
        <motion.div
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} z-10 overflow-hidden`}
          initial={{ scale: 0.94, y: 12, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 340, damping: 28 } }}
          exit={{ scale: 0.94, y: 12, opacity: 0, transition: { duration: 0.15 } }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Shared: Toast nhỏ hiện kết quả
const Toast = ({ msg, type }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        className={`flex items-center gap-2 mt-3 text-xs font-medium px-3 py-2 rounded-lg ${
          type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      >
        {type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
        {msg}
      </motion.div>
    )}
  </AnimatePresence>
);

// Shared: Field label + input
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
const inputCls = 'w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition bg-white';

// ── 1. ADD STUDENT MODAL ──────────────────────────────────────────────────────
export const AddStudentModal = ({ open, onClose, classes, onSuccess }) => {
  const empty = { hoTen: '', tenThanh: '', gioiTinh: 'Nam', lopId: '', soDienThoai: '' };
  const [form, setForm]       = useState(empty);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoTen.trim() || !form.tenThanh.trim() || !form.lopId) {
      setToast({ type: 'err', msg: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      await api.post('/students', {
        hoTen:    form.hoTen.trim(),
        tenThanh: form.tenThanh.trim(),
        gioiTinh: form.gioiTinh,
        lop:      form.lopId,
        lopId:    form.lopId,   // cho checkClassPermission middleware
        phuHuynh: form.soDienThoai ? { soDienThoai: form.soDienThoai.trim() } : undefined,
      });
      setToast({ type: 'ok', msg: 'Thêm đoàn sinh thành công!' });
      setTimeout(() => { setForm(empty); setToast(null); onSuccess?.(); onClose(); }, 1200);
    } catch (err) {
      setToast({ type: 'err', msg: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="✝ Thêm Đoàn Sinh Nhanh">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ và tên" required>
            <input className={inputCls} placeholder="Nguyễn Văn A" value={form.hoTen} onChange={e => set('hoTen', e.target.value)} />
          </Field>
          <Field label="Tên Thánh" required>
            <input className={inputCls} placeholder="Giuse" value={form.tenThanh} onChange={e => set('tenThanh', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Giới tính" required>
            <select className={inputCls} value={form.gioiTinh} onChange={e => set('gioiTinh', e.target.value)}>
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
            </select>
          </Field>
          <Field label="Lớp" required>
            <select className={inputCls} value={form.lopId} onChange={e => set('lopId', e.target.value)}>
              <option value="">— Chọn lớp —</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{formatClassName(c.tenLop)}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="SĐT Phụ huynh">
          <input className={inputCls} placeholder="0912 345 678 (không bắt buộc)" value={form.soDienThoai} onChange={e => set('soDienThoai', e.target.value)} />
        </Field>

        <Toast msg={toast?.msg} type={toast?.type} />

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 h-9 text-sm font-semibold border border-slate-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
            Hủy
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-9 text-sm font-semibold bg-red-700 hover:bg-red-800 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Đang lưu…' : 'Lưu Đoàn Sinh'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── 2. EXPORT DROPDOWN ────────────────────────────────────────────────────────
export const ExportDropdown = ({ classes, users }) => {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(null); // 'excel' | 'pdf' | null
  const ref                   = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const exportExcel = async () => {
    setLoading('excel');
    setOpen(false);
    try {
      // Lấy tất cả đoàn sinh từ tất cả lớp
      const rows = [];
      for (const lop of classes) {
        try {
          const res = await api.get(`/students/${lop._id}`);
          const students = res.data?.data || [];
          students.forEach(s => rows.push({
            'Lớp':        formatClassName(lop.tenLop),
            'Ngành':      lop.nhanh,
            'Họ và tên':  s.hoTen,
            'Tên Thánh':  s.tenThanh,
            'Giới tính':  s.gioiTinh,
            'SĐT PH':     s.phuHuynh?.soDienThoai || '',
          }));
        } catch { /* bỏ qua lớp lỗi */ }
      }

      if (rows.length === 0) { alert('Chưa có đoàn sinh nào.'); return; }

      const ws = XLSX.utils.json_to_sheet(rows);
      // Độ rộng cột
      ws['!cols'] = [16, 12, 24, 16, 10, 16].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đoàn sinh');
      XLSX.writeFile(wb, `DanhSach_DoanSinh_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
    } finally {
      setLoading(null);
    }
  };

  const exportPDF = () => {
    setOpen(false);
    window.print();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={!!loading}
        className="bg-linear-to-br from-red-600 to-rose-800 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm text-xs font-semibold disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
        <span className="hidden md:inline">Xuất Báo Cáo</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
          >
            <button onClick={exportExcel}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition text-left">
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-xs">Xuất Excel Đoàn Sinh</p>
                <p className="text-[10px] text-gray-400">Tất cả lớp · .xlsx</p>
              </div>
            </button>
            <div className="h-px bg-slate-100 mx-3" />
            <button onClick={exportPDF}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-left">
              <Printer className="w-4 h-4 shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold text-xs">In / Xuất PDF</p>
                <p className="text-[10px] text-gray-400">In trang hiện tại</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── 3. SEND NOTIFY MODAL ──────────────────────────────────────────────────────
export const SendNotifyModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const empty = { tieuDe: '', noiDung: '' };
  const [form, setForm]       = useState(empty);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tieuDe.trim() || !form.noiDung.trim()) {
      setToast({ type: 'err', msg: 'Vui lòng điền tiêu đề và nội dung.' });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      await api.post('/posts', {
        tieuDe:  form.tieuDe.trim(),
        noiDung: form.noiDung.trim(),
        tacGia:  user?._id,
        daDang:  true,
      });
      setToast({ type: 'ok', msg: 'Thông báo đã được gửi thành công!' });
      setTimeout(() => { setForm(empty); setToast(null); onSuccess?.(); onClose(); }, 1200);
    } catch (err) {
      setToast({ type: 'err', msg: err.response?.data?.message || 'Gửi thất bại, vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="🔔 Gửi Thông Báo Khẩn" width="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Tiêu đề thông báo" required>
          <input className={inputCls} placeholder="VD: Thông báo nghỉ lễ ngày…"
            value={form.tieuDe} onChange={e => set('tieuDe', e.target.value)} />
        </Field>
        <Field label="Nội dung" required>
          <textarea
            className={`${inputCls} h-28 py-2 resize-none`}
            placeholder="Nhập nội dung thông báo gửi đến toàn thể hệ thống…"
            value={form.noiDung} onChange={e => set('noiDung', e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Bell className="w-3.5 h-3.5 shrink-0" />
          Thông báo sẽ được đăng ngay và hiển thị cho tất cả người dùng.
        </div>

        <Toast msg={toast?.msg} type={toast?.type} />

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 h-9 text-sm font-semibold border border-slate-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
            Hủy
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-9 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            {loading ? 'Đang gửi…' : 'Gửi Thông Báo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── 4. STICKY NOTE ────────────────────────────────────────────────────────────
const NOTE_KEY = 'admin_dashboard_note';

export const StickyNote = ({ open, onClose }) => {
  const [text, setText] = useState(() => localStorage.getItem(NOTE_KEY) || '');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setSaved(false);
    clearTimeout(timerRef.current);
    // Auto-save sau 600ms không gõ
    timerRef.current = setTimeout(() => {
      localStorage.setItem(NOTE_KEY, val);
      setSaved(true);
    }, 600);
  };

  const handleClear = () => {
    setText('');
    localStorage.removeItem(NOTE_KEY);
    setSaved(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="📌 Ghi Chú Nhanh">
      <div className="flex flex-col gap-3">
        <textarea
          className="w-full h-44 px-3 py-2.5 text-sm border border-amber-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none bg-amber-50/60 placeholder:text-amber-300 text-amber-900 leading-relaxed"
          placeholder="Ghi chú công việc hôm nay…&#10;— Họp ban huynh trưởng lúc 19:00&#10;— Kiểm tra điểm danh lớp Nghĩa Sĩ&#10;— Gửi thông báo cuối tuần…"
          value={text}
          onChange={handleChange}
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-400 italic">
            {saved ? '✓ Đã lưu tự động' : 'Tự động lưu khi dừng gõ'}
          </p>
          <div className="flex gap-2">
            <button onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-600 font-semibold transition px-2 py-1 rounded hover:bg-red-50">
              Xóa tất cả
            </button>
            <button onClick={onClose}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── 5. QUICK ATTENDANCE MODAL ─────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

export const QuickAttendanceModal = ({ open, onClose, classes }) => {
  // Bước 1: chọn lớp  |  Bước 2: điểm danh
  const [step,       setStep]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [selClass,   setSelClass]   = useState(null);   // object lớp đã chọn
  const [students,   setStudents]   = useState([]);     // danh sách đoàn sinh
  const [attendance, setAttendance] = useState({});     // { studentId: true/false }
  const [fetching,   setFetching]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [date,       setDate]       = useState(TODAY);

  // Reset khi đóng
  const handleClose = () => {
    setStep(1); setSearch(''); setSelClass(null);
    setStudents([]); setAttendance({}); setToast(null);
    onClose();
  };

  // Lọc lớp theo search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? classes.filter(c => formatClassName(c.tenLop).toLowerCase().includes(q))
      : classes;
  }, [classes, search]);

  // Chọn lớp → fetch đoàn sinh
  const selectClass = async (lop) => {
    setSelClass(lop);
    setFetching(true);
    try {
      const res = await api.get(`/students/${lop._id}`);
      const list = res.data?.data || [];
      setStudents(list);
      // Mặc định tất cả có mặt
      const init = {};
      list.forEach(s => { init[s._id] = true; });
      setAttendance(init);
      setStep(2);
    } catch {
      setToast({ type: 'err', msg: 'Không thể tải danh sách đoàn sinh.' });
    } finally {
      setFetching(false);
    }
  };

  const toggle = (id) => setAttendance(a => ({ ...a, [id]: !a[id] }));

  const toggleAll = () => {
    const allPresent = students.every(s => attendance[s._id]);
    const next = {};
    students.forEach(s => { next[s._id] = !allPresent; });
    setAttendance(next);
  };

  // Lưu điểm danh — gửi tuần tự (upsert từng record)
  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      await Promise.all(
        students.map(s =>
          api.post('/attendance', {
            studentId: s._id,
            lopId:     selClass._id,
            date,
            present:   !!attendance[s._id],
          })
        )
      );
      setToast({ type: 'ok', msg: `Đã lưu điểm danh ${students.length} đoàn sinh!` });
      setTimeout(handleClose, 1300);
    } catch (err) {
      setToast({ type: 'err', msg: err.response?.data?.message || 'Lưu thất bại, vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => attendance[s._id]).length;
  const absentCount  = students.length - presentCount;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? '📋 Điểm Danh Nhanh — Chọn lớp' : `📋 ${formatClassName(selClass?.tenLop)}`}
      width="max-w-lg"
    >
      {/* ── Bước 1: Tìm & chọn lớp ── */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm lớp… VD: Xưng Tội, Nghĩa Sĩ"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 transition"
            />
          </div>

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {fetching && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
            {!fetching && filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 italic py-6">Không tìm thấy lớp nào.</p>
            )}
            {!fetching && filtered.map(lop => (
              <button key={lop._id} onClick={() => selectClass(lop)}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-100 hover:border-green-300 hover:bg-green-50 transition text-left group">
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">
                    {formatClassName(lop.tenLop)}
                  </p>
                  <p className="text-xs text-gray-400">{lop.siSo ?? 0} đoàn sinh</p>
                </div>
                <CalendarCheck className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bước 2: Điểm danh ── */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          {/* Ngày + nút quay lại */}
          <div className="flex items-center gap-3">
            <button onClick={() => { setStep(1); setStudents([]); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition font-medium">
              ← Chọn lại lớp
            </button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="ml-auto h-8 px-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-green-300" />
          </div>

          {/* Stat bar */}
          <div className="flex gap-3 text-xs">
            <span className="bg-green-50 border border-green-200 text-green-700 font-bold px-2.5 py-1 rounded-full">
              ✓ Có mặt: {presentCount}
            </span>
            <span className="bg-red-50 border border-red-200 text-red-600 font-bold px-2.5 py-1 rounded-full">
              ✗ Vắng: {absentCount}
            </span>
            <button onClick={toggleAll}
              className="ml-auto text-[10px] font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-50 transition">
              {students.every(s => attendance[s._id]) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          {/* Danh sách */}
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            {students.map((s, i) => {
              const present = !!attendance[s._id];
              return (
                <button key={s._id} onClick={() => toggle(s._id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition text-left ${
                    present
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}>
                  {/* Checkbox visual */}
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition ${
                    present ? 'bg-green-500 border-green-500' : 'bg-white border-red-300'
                  }`}>
                    {present
                      ? <Check className="w-3 h-3 text-white" />
                      : <Minus className="w-3 h-3 text-red-400" />
                    }
                  </div>
                  <span className="text-xs font-semibold text-gray-700 flex-1">
                    <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                    {s.tenThanh} {s.hoTen}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    present ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {present ? 'Có mặt' : 'Vắng'}
                  </span>
                </button>
              );
            })}
          </div>

          <Toast msg={toast?.msg} type={toast?.type} />

          <div className="flex gap-2 pt-1">
            <button onClick={handleClose}
              className="flex-1 h-9 text-sm font-semibold border border-slate-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving || students.length === 0}
              className="flex-1 h-9 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
              {saving ? 'Đang lưu…' : `Xác nhận (${students.length} DS)`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
