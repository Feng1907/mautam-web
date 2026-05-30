import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
  ClipboardList, Eye, PenLine, Trophy, Clock, BookOpen, X, Save, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';

const LOAI_LABELS = { trac_nghiem: 'Trắc nghiệm', dien_khuyet: 'Điền khuyết', tu_luan: 'Tự luận' };
const LOAI_COLORS = {
  trac_nghiem: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dien_khuyet: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  tu_luan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const EMPTY_QUIZ = {
  tieuDe: '', moTa: '', lop: '', thoiGianLam: 30,
  batDauTu: '', ketThucLuc: '', active: false, cauHoi: [],
};

const EMPTY_CAU_HOI = {
  loai: 'trac_nghiem', noiDung: '', diem: 1,
  dapAn: [
    { chu: 'A', noiDung: '', dungKhong: false },
    { chu: 'B', noiDung: '', dungKhong: false },
    { chu: 'C', noiDung: '', dungKhong: false },
    { chu: 'D', noiDung: '', dungKhong: false },
  ],
  dapAnDung: [''],
  caseSensitive: false,
  goiY: '',
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

function QuizStatusBadge({ quiz }) {
  const now = new Date();
  const start = quiz.batDauTu ? new Date(quiz.batDauTu) : null;
  const end   = quiz.ketThucLuc ? new Date(quiz.ketThucLuc) : null;
  if (!quiz.active) return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"><Circle size={6} className="fill-current" />Chưa mở</span>;
  if (start && now < start) return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Circle size={6} className="fill-current" />Sắp mở</span>;
  if (end && now > end) return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"><Circle size={6} className="fill-current" />Đã đóng</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={8} />Đang mở</span>;
}

export default function AdminQuiz() {
  const { user } = useAuth();
  const isGiaoly = user?.vaiTro === 'giaoly';
  const qc = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_QUIZ);
  const [expandedQ, setExpandedQ] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterLop, setFilterLop] = useState('');
  const [previewQuiz, setPreviewQuiz] = useState(null);

  const { data: allClasses = [] } = useQuery({
    queryKey: ['classes-quiz'],
    queryFn: () => api.get('/classes').then(r => r.data.data || r.data),
  });

  const lopPhuTrach = user?.lopPhuTrach || [];
  const classes = isGiaoly
    ? allClasses.filter(c => lopPhuTrach.some(id => id === c._id || id?._id === c._id || id?.toString() === c._id))
    : allClasses;

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes-admin', filterLop],
    queryFn: () => api.get('/quizzes', { params: { lopId: filterLop || undefined } }).then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/quizzes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizzes-admin'] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => api.put(`/quizzes/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizzes-admin'] }),
  });

  const openCreate = () => {
    setEditId(null);
    const defaultLop = isGiaoly && classes.length === 1 ? classes[0]._id : '';
    setForm({ ...EMPTY_QUIZ, lop: defaultLop });
    setExpandedQ(null);
    setShowForm(true);
  };

  const openEdit = (quiz) => {
    setEditId(quiz._id);
    setForm({
      tieuDe: quiz.tieuDe, moTa: quiz.moTa || '',
      lop: quiz.lop?._id || quiz.lop || '',
      thoiGianLam: quiz.thoiGianLam || 30,
      batDauTu: quiz.batDauTu ? quiz.batDauTu.slice(0, 16) : '',
      ketThucLuc: quiz.ketThucLuc ? quiz.ketThucLuc.slice(0, 16) : '',
      active: quiz.active,
      cauHoi: quiz.cauHoi || [],
    });
    setExpandedQ(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_QUIZ);
    setExpandedQ(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tieuDe.trim() || !form.lop)
      return alert('Vui lòng nhập tiêu đề và chọn lớp');
    setSaving(true);
    try {
      const payload = { ...form, batDauTu: form.batDauTu || null, ketThucLuc: form.ketThucLuc || null };
      if (editId) await api.put(`/quizzes/${editId}`, payload);
      else await api.post('/quizzes', payload);
      qc.invalidateQueries({ queryKey: ['quizzes-admin'] });
      closeForm();
    } finally { setSaving(false); }
  };

  const addCauHoi = () => {
    setForm(f => ({ ...f, cauHoi: [...f.cauHoi, { ...EMPTY_CAU_HOI, dapAn: EMPTY_CAU_HOI.dapAn.map(d => ({ ...d })) }] }));
    setExpandedQ(form.cauHoi.length);
  };

  const removeCauHoi = (idx) => {
    setForm(f => ({ ...f, cauHoi: f.cauHoi.filter((_, i) => i !== idx) }));
    setExpandedQ(null);
  };

  const updateCauHoi = (idx, patch) => {
    setForm(f => {
      const cauHoi = [...f.cauHoi];
      cauHoi[idx] = { ...cauHoi[idx], ...patch };
      return { ...f, cauHoi };
    });
  };

  const updateDapAn = (cauHoiIdx, dapAnIdx, patch) => {
    setForm(f => {
      const cauHoi = [...f.cauHoi];
      const dapAn = cauHoi[cauHoiIdx].dapAn.map((d, i) => i === dapAnIdx ? { ...d, ...patch } : d);
      cauHoi[cauHoiIdx] = { ...cauHoi[cauHoiIdx], dapAn };
      return { ...f, cauHoi };
    });
  };

  const setDapAnDung = (cauHoiIdx, chu) => {
    setForm(f => {
      const cauHoi = [...f.cauHoi];
      cauHoi[cauHoiIdx] = {
        ...cauHoi[cauHoiIdx],
        dapAn: cauHoi[cauHoiIdx].dapAn.map(d => ({ ...d, dungKhong: d.chu === chu })),
      };
      return { ...f, cauHoi };
    });
  };

  const totalQuestions = quizzes.reduce((s, q) => s + (q.cauHoi?.length || 0), 0);
  const openCount = quizzes.filter(q => q.active).length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList size={20} className="text-red-700 dark:text-red-400" />
            Quản lý bài kiểm tra
          </h1>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {quizzes.length} bài · {openCount} đang mở · {totalQuestions} câu hỏi
          </p>
        </div>
        <button onClick={openCreate}
          className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> Tạo bài mới
        </button>
      </div>

      {/* ── Form tạo / sửa (slide-in panel) ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={closeForm} />
          {/* Panel */}
          <div className="relative ml-auto w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <ClipboardList size={16} className="text-red-700 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 dark:text-slate-100 text-sm">
                    {editId ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
                  </h2>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{form.cauHoi.length} câu hỏi</p>
                </div>
              </div>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">

                {/* Section 1: Thông tin cơ bản */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Tiêu đề bài kiểm tra *</label>
                      <input className="input" value={form.tieuDe}
                        placeholder="VD: Ôn tập Chúa Nhật tuần 3"
                        onChange={e => setForm(f => ({ ...f, tieuDe: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="label">Mô tả <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                      <textarea className="input min-h-15 resize-none" value={form.moTa}
                        placeholder="Nội dung ôn tập, ghi chú cho học sinh..."
                        onChange={e => setForm(f => ({ ...f, moTa: e.target.value }))} />
                    </div>
                  </div>
                </section>

                {/* Section 2: Cài đặt */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Cài đặt
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Lớp *</label>
                      <select className="input" value={form.lop}
                        onChange={e => setForm(f => ({ ...f, lop: e.target.value }))} required>
                        <option value="">-- Chọn lớp --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.tenLop}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Thời gian làm bài (phút)</label>
                      <input type="number" className="input" min={1} max={180} value={form.thoiGianLam}
                        onChange={e => setForm(f => ({ ...f, thoiGianLam: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="label">Mở từ</label>
                      <input type="datetime-local" className="input" value={form.batDauTu}
                        onChange={e => setForm(f => ({ ...f, batDauTu: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Đóng lúc</label>
                      <input type="datetime-local" className="input" value={form.ketThucLuc}
                        onChange={e => setForm(f => ({ ...f, ketThucLuc: e.target.value }))} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer mt-3 w-fit">
                    <div
                      onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {form.active ? 'Đang mở cho học sinh' : 'Chưa mở (nháp)'}
                    </span>
                  </label>
                </section>

                {/* Section 3: Câu hỏi */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                      Câu hỏi <span className="text-gray-300 dark:text-slate-600 font-normal normal-case">({form.cauHoi.length})</span>
                    </h3>
                    <button type="button" onClick={addCauHoi}
                      className="inline-flex items-center gap-1 text-xs text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium">
                      <Plus size={13} /> Thêm câu hỏi
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.cauHoi.length === 0 ? (
                      <button type="button" onClick={addCauHoi}
                        className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-gray-400 dark:text-slate-500 text-sm hover:border-red-300 hover:text-red-400 transition flex flex-col items-center gap-1.5">
                        <Plus size={20} className="opacity-50" />
                        Nhấn để thêm câu hỏi đầu tiên
                      </button>
                    ) : form.cauHoi.map((cau, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                        {/* Câu hỏi header */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-slate-800">
                          <button type="button"
                            onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                            className="flex-1 flex items-center gap-2 text-left min-w-0">
                            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${LOAI_COLORS[cau.loai]}`}>
                              {LOAI_LABELS[cau.loai]}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-slate-300 truncate flex-1">
                              {cau.noiDung || <span className="text-gray-400 dark:text-slate-500 italic">Chưa nhập câu hỏi</span>}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{cau.diem}đ</span>
                            {expandedQ === idx ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                          </button>
                          <button type="button" onClick={() => removeCauHoi(idx)}
                            className="p-1 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Câu hỏi body */}
                        {expandedQ === idx && (
                          <div className="p-4 space-y-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="label text-xs">Loại câu hỏi</label>
                                <select className="input text-sm" value={cau.loai}
                                  onChange={e => updateCauHoi(idx, { loai: e.target.value })}>
                                  <option value="trac_nghiem">Trắc nghiệm A/B/C/D</option>
                                  <option value="dien_khuyet">Điền vào chỗ trống</option>
                                  <option value="tu_luan">Tự luận / Viết kinh</option>
                                </select>
                              </div>
                              <div>
                                <label className="label text-xs">Điểm số</label>
                                <input type="number" className="input text-sm" min={0} max={10} step={0.5}
                                  value={cau.diem} onChange={e => updateCauHoi(idx, { diem: Number(e.target.value) })} />
                              </div>
                            </div>

                            <div>
                              <label className="label text-xs">Nội dung câu hỏi *</label>
                              <textarea className="input text-sm min-h-18 resize-none" value={cau.noiDung}
                                placeholder={cau.loai === 'dien_khuyet'
                                  ? 'Dùng ___ cho chỗ trống. VD: Kính mừng ___ đầy ơn phúc'
                                  : 'Nhập nội dung câu hỏi...'}
                                onChange={e => updateCauHoi(idx, { noiDung: e.target.value })} />
                            </div>

                            {cau.loai === 'trac_nghiem' && (
                              <div>
                                <label className="label text-xs mb-2">Đáp án — click vào chữ cái để chọn đáp án đúng</label>
                                <div className="space-y-2">
                                  {cau.dapAn.map((d, di) => (
                                    <div key={d.chu} className={`flex items-center gap-2 p-2 rounded-lg border transition ${d.dungKhong ? 'border-green-300 bg-green-50 dark:border-green-700/50 dark:bg-green-900/10' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'}`}>
                                      <button type="button"
                                        onClick={() => setDapAnDung(idx, d.chu)}
                                        className={`w-7 h-7 rounded-full text-xs font-bold shrink-0 transition ${
                                          d.dungKhong ? 'bg-green-500 text-white shadow-sm' : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400'
                                        }`}>
                                        {d.chu}
                                      </button>
                                      <input className="bg-transparent text-sm flex-1 outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400"
                                        placeholder={`Nhập đáp án ${d.chu}...`}
                                        value={d.noiDung}
                                        onChange={e => updateDapAn(idx, di, { noiDung: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {cau.loai === 'dien_khuyet' && (
                              <div>
                                <label className="label text-xs mb-2">Đáp án đúng (có thể nhập nhiều cách viết)</label>
                                <div className="space-y-2">
                                  {(cau.dapAnDung || ['']).map((d, di) => (
                                    <div key={di} className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400 dark:text-slate-500 w-4 text-center">{di + 1}.</span>
                                      <input className="input text-sm flex-1" value={d} placeholder="Nhập đáp án..."
                                        onChange={e => {
                                          const arr = [...(cau.dapAnDung || [''])];
                                          arr[di] = e.target.value;
                                          updateCauHoi(idx, { dapAnDung: arr });
                                        }} />
                                      {di > 0 && (
                                        <button type="button"
                                          onClick={() => updateCauHoi(idx, { dapAnDung: (cau.dapAnDung || ['']).filter((_, i) => i !== di) })}
                                          className="p-1 text-gray-300 dark:text-slate-600 hover:text-red-400 transition">
                                          <X size={13} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <button type="button"
                                    onClick={() => updateCauHoi(idx, { dapAnDung: [...(cau.dapAnDung || ['']), ''] })}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                    <Plus size={11} /> Thêm cách viết khác
                                  </button>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 dark:text-slate-400">
                                    <input type="checkbox" checked={cau.caseSensitive}
                                      onChange={e => updateCauHoi(idx, { caseSensitive: e.target.checked })} />
                                    Phân biệt hoa/thường
                                  </label>
                                </div>
                              </div>
                            )}

                            {cau.loai === 'tu_luan' && (
                              <div>
                                <label className="label text-xs">Gợi ý đáp án <span className="text-gray-400 font-normal">(để huynh trưởng tham khảo khi chấm)</span></label>
                                <textarea className="input text-sm min-h-15 resize-none" value={cau.goiY || ''}
                                  placeholder="VD: Kinh Lạy Cha: Lạy Cha chúng con ở trên trời..."
                                  onChange={e => updateCauHoi(idx, { goiY: e.target.value })} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {form.cauHoi.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                      <span>Tổng: {form.cauHoi.reduce((s, c) => s + (c.diem || 0), 0)} điểm</span>
                      <button type="button" onClick={addCauHoi}
                        className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline">
                        <Plus size={11} /> Thêm câu hỏi
                      </button>
                    </div>
                  )}
                </section>
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 px-6 py-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex-1 btn-primary py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 text-sm font-medium">
                  <Save size={15} />
                  {saving ? 'Đang lưu...' : (editId ? 'Lưu thay đổi' : 'Tạo bài kiểm tra')}
                </button>
                <button type="button" onClick={closeForm}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewQuiz(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 dark:text-slate-100">{previewQuiz.tieuDe}</h2>
                {previewQuiz.moTa && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{previewQuiz.moTa}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 dark:text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen size={10} />{previewQuiz.lop?.tenLop || '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{previewQuiz.thoiGianLam} phút</span>
                  <span>{previewQuiz.cauHoi?.length || 0} câu hỏi</span>
                </div>
              </div>
              <button onClick={() => setPreviewQuiz(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {(previewQuiz.cauHoi || []).length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">Chưa có câu hỏi nào.</p>
              ) : (previewQuiz.cauHoi || []).map((cau, idx) => (
                <div key={idx} className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <div className="flex-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2 ${LOAI_COLORS[cau.loai]}`}>{LOAI_LABELS[cau.loai]}</span>
                      <span className="text-[10px] text-gray-400">{cau.diem} điểm</span>
                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-slate-200">{cau.noiDung}</p>
                    </div>
                  </div>
                  {cau.loai === 'trac_nghiem' && (
                    <div className="grid grid-cols-2 gap-2 ml-8">
                      {(cau.dapAn || []).map((d) => (
                        <div key={d.chu} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          d.dungKhong
                            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                        }`}>
                          <span className="font-bold text-xs">{d.chu}.</span>
                          <span className="truncate">{d.noiDung || <span className="italic text-gray-300">Trống</span>}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cau.loai === 'dien_khuyet' && (
                    <div className="ml-8 text-xs text-gray-500 dark:text-slate-400">
                      Đáp án: {(cau.dapAnDung || []).filter(Boolean).join(' / ') || '—'}
                    </div>
                  )}
                  {cau.loai === 'tu_luan' && cau.goiY && (
                    <div className="ml-8 text-xs text-gray-500 dark:text-slate-400 italic">Gợi ý: {cau.goiY}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bộ lọc ── */}
      <div className="flex items-center gap-3">
        <select className="input max-w-48 text-sm" value={filterLop} onChange={e => setFilterLop(e.target.value)}>
          <option value="">Tất cả lớp</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.tenLop}</option>)}
        </select>
        {quizzes.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-slate-500">{quizzes.length} bài kiểm tra</p>
        )}
      </div>

      {/* ── Danh sách quiz ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <ClipboardList size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm font-medium">Chưa có bài kiểm tra nào</p>
          <p className="text-xs mt-1">Nhấn "Tạo bài mới" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => {
            const loaiCount = { trac_nghiem: 0, dien_khuyet: 0, tu_luan: 0 };
            (quiz.cauHoi || []).forEach(c => { loaiCount[c.loai] = (loaiCount[c.loai] || 0) + 1; });
            const hasTuLuan = loaiCount.tu_luan > 0;

            return (
              <div key={quiz._id}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition hover:shadow-sm ${
                  quiz.active
                    ? 'border-green-200 dark:border-green-800/40'
                    : 'border-gray-200 dark:border-slate-700'
                }`}>
                <div className="flex items-start gap-3 p-4">
                  {/* Left accent + toggle */}
                  <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: quiz._id, active: !quiz.active })}
                      title={quiz.active ? 'Tắt bài kiểm tra' : 'Mở bài kiểm tra'}
                      className="transition">
                      {quiz.active
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-gray-300 dark:text-slate-600" />}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm leading-tight">{quiz.tieuDe}</p>
                      <QuizStatusBadge quiz={quiz} />
                    </div>
                    {quiz.moTa && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{quiz.moTa}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <BookOpen size={11} className="text-gray-400" />
                        {quiz.lop?.tenLop || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Clock size={11} />
                        {quiz.thoiGianLam} phút
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{quiz.cauHoi?.length || 0} câu</span>
                      {loaiCount.trac_nghiem > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">{loaiCount.trac_nghiem} TN</span>}
                      {loaiCount.dien_khuyet > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">{loaiCount.dien_khuyet} ĐK</span>}
                      {loaiCount.tu_luan > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium">{loaiCount.tu_luan} TL</span>}
                    </div>
                    {(quiz.batDauTu || quiz.ketThucLuc) && (
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5">
                        {quiz.batDauTu && <>Mở: {fmtDate(quiz.batDauTu)}</>}
                        {quiz.batDauTu && quiz.ketThucLuc && <span className="mx-1">·</span>}
                        {quiz.ketThucLuc && <>Đóng: {fmtDate(quiz.ketThucLuc)}</>}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setPreviewQuiz(quiz)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition"
                      title="Xem trước nội dung">
                      <Eye size={13} />
                      <span className="hidden sm:inline">Xem trước</span>
                    </button>
                    <Link to={`/quiz/${quiz._id}/monitor`}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 transition"
                      title="Giám sát">
                      <Eye size={13} />
                      <span className="hidden sm:inline">Giám sát</span>
                    </Link>
                    <Link to={`/quiz/${quiz._id}/leaderboard`}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                      title="Xếp hạng">
                      <Trophy size={13} />
                      <span className="hidden sm:inline">Xếp hạng</span>
                    </Link>
                    {hasTuLuan && (
                      <Link to={`/quiz/${quiz._id}/grade`}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                        title="Chấm tự luận">
                        <PenLine size={13} />
                        <span className="hidden sm:inline">Chấm</span>
                      </Link>
                    )}
                    <button onClick={() => openEdit(quiz)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                      title="Chỉnh sửa">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if (confirm('Xóa bài kiểm tra này?')) deleteMutation.mutate(quiz._id); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
