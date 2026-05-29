import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, ClipboardList, Eye, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';


const LOAI_LABELS = { trac_nghiem: 'Trắc nghiệm', dien_khuyet: 'Điền khuyết', tu_luan: 'Tự luận' };
const LOAI_COLORS = { trac_nghiem: 'bg-blue-100 text-blue-700', dien_khuyet: 'bg-amber-100 text-amber-700', tu_luan: 'bg-purple-100 text-purple-700' };

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

export default function AdminQuiz() {
  const { user } = useAuth();
  const isGiaoly = user?.vaiTro === 'giaoly';
  const qc = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ);
  const [expandedQ, setExpandedQ] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterLop, setFilterLop] = useState('');

  const { data: allClasses = [] } = useQuery({
    queryKey: ['classes-quiz'],
    queryFn: () => api.get('/classes').then(r => r.data.data || r.data),
  });

  // Giaoly chỉ thấy lớp mình phụ trách
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
  };

  const resetForm = () => {
    setEditId(null);
    // Giaoly có 1 lớp → tự điền sẵn
    const defaultLop = isGiaoly && classes.length === 1 ? classes[0]._id : '';
    setForm({ ...EMPTY_QUIZ, lop: defaultLop });
    setExpandedQ(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tieuDe.trim() || !form.lop)
      return alert('Vui lòng nhập tiêu đề và chọn lớp');
    setSaving(true);
    try {
      const payload = {
        ...form,
        batDauTu: form.batDauTu || null,
        ketThucLuc: form.ketThucLuc || null,
      };
      if (editId) await api.put(`/quizzes/${editId}`, payload);
      else await api.post('/quizzes', payload);
      qc.invalidateQueries({ queryKey: ['quizzes-admin'] });
      resetForm();
    } finally { setSaving(false); }
  };

  // ── Câu hỏi helpers ────────────────────────────────────
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList size={20} className="text-red-700 dark:text-red-400" />
          Quản lý bài kiểm tra
        </h1>
        <button onClick={() => { resetForm(); }} className="btn-primary text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Plus size={14} /> Tạo bài mới
        </button>
      </div>

      {/* ── Form tạo / sửa ── */}
      {(editId !== null || form !== EMPTY_QUIZ) && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-200">
            {editId ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Tiêu đề *</label>
              <input className="input" value={form.tieuDe} placeholder="VD: Ôn tập Chúa Nhật tuần 3"
                onChange={e => setForm(f => ({ ...f, tieuDe: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Mô tả</label>
              <textarea className="input min-h-16 resize-none" value={form.moTa}
                placeholder="Nội dung ôn tập, ghi chú cho học sinh..."
                onChange={e => setForm(f => ({ ...f, moTa: e.target.value }))} />
            </div>
            <div>
              <label className="label">Lớp *</label>
              <select className="input" value={form.lop} onChange={e => setForm(f => ({ ...f, lop: e.target.value }))} required>
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

          {/* ── Câu hỏi ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Câu hỏi ({form.cauHoi.length})
              </span>
              <button type="button" onClick={addCauHoi}
                className="text-xs flex items-center gap-1 text-red-700 dark:text-red-400 hover:underline">
                <Plus size={13} /> Thêm câu
              </button>
            </div>

            <div className="space-y-2">
              {form.cauHoi.map((cau, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                  {/* Header câu hỏi */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-800/50">
                    <button type="button" onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                      className="flex-1 flex items-center gap-2 text-left">
                      <span className="text-xs font-bold text-gray-400 dark:text-slate-500 w-5">#{idx+1}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${LOAI_COLORS[cau.loai]}`}>
                        {LOAI_LABELS[cau.loai]}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-slate-300 truncate flex-1">
                        {cau.noiDung || '(chưa nhập câu hỏi)'}
                      </span>
                      <span className="text-xs text-gray-400">{cau.diem} đ</span>
                      {expandedQ === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button type="button" onClick={() => removeCauHoi(idx)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Body câu hỏi */}
                  {expandedQ === idx && (
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
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
                          <label className="label text-xs">Điểm</label>
                          <input type="number" className="input text-sm" min={0} max={10} step={0.5}
                            value={cau.diem} onChange={e => updateCauHoi(idx, { diem: Number(e.target.value) })} />
                        </div>
                      </div>

                      <div>
                        <label className="label text-xs">Nội dung câu hỏi *</label>
                        <textarea className="input text-sm min-h-16 resize-none" value={cau.noiDung}
                          placeholder={cau.loai === 'dien_khuyet' ? 'Dùng ___ cho chỗ trống. VD: Kính mừng ___ đầy ơn phúc' : 'Nhập câu hỏi...'}
                          onChange={e => updateCauHoi(idx, { noiDung: e.target.value })} />
                      </div>

                      {/* Trắc nghiệm */}
                      {cau.loai === 'trac_nghiem' && (
                        <div className="space-y-1.5">
                          <label className="label text-xs">Đáp án (click nút chữ để chọn đáp án đúng)</label>
                          {cau.dapAn.map((d, di) => (
                            <div key={d.chu} className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => setDapAnDung(idx, d.chu)}
                                className={`w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition ${
                                  d.dungKhong ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                                }`}>
                                {d.chu}
                              </button>
                              <input className="input text-sm flex-1" placeholder={`Đáp án ${d.chu}`}
                                value={d.noiDung}
                                onChange={e => updateDapAn(idx, di, { noiDung: e.target.value })} />
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">
                            Click vào nút A/B/C/D để chọn đáp án đúng (nền xanh)
                          </p>
                        </div>
                      )}

                      {/* Điền khuyết */}
                      {cau.loai === 'dien_khuyet' && (
                        <div className="space-y-2">
                          <label className="label text-xs">Đáp án đúng (có thể thêm nhiều alias)</label>
                          {(cau.dapAnDung || ['']).map((d, di) => (
                            <div key={di} className="flex items-center gap-2">
                              <input className="input text-sm flex-1" value={d} placeholder="Nhập đáp án..."
                                onChange={e => {
                                  const arr = [...(cau.dapAnDung || [''])];
                                  arr[di] = e.target.value;
                                  updateCauHoi(idx, { dapAnDung: arr });
                                }} />
                              {di > 0 && (
                                <button type="button" onClick={() => {
                                  const arr = (cau.dapAnDung || ['']).filter((_, i) => i !== di);
                                  updateCauHoi(idx, { dapAnDung: arr });
                                }} className="text-red-400 p-1"><Trash2 size={13} /></button>
                              )}
                            </div>
                          ))}
                          <button type="button"
                            onClick={() => updateCauHoi(idx, { dapAnDung: [...(cau.dapAnDung || ['']), ''] })}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            <Plus size={11} /> Thêm đáp án alias
                          </button>
                          <label className="flex items-center gap-2 cursor-pointer w-fit text-xs text-gray-600 dark:text-slate-400">
                            <input type="checkbox" checked={cau.caseSensitive}
                              onChange={e => updateCauHoi(idx, { caseSensitive: e.target.checked })} />
                            Phân biệt hoa/thường
                          </label>
                        </div>
                      )}

                      {/* Tự luận */}
                      {cau.loai === 'tu_luan' && (
                        <div>
                          <label className="label text-xs">Gợi ý đáp án (cho huynh trưởng tham khảo khi chấm)</label>
                          <textarea className="input text-sm min-h-16 resize-none" value={cau.goiY || ''}
                            placeholder="VD: Kinh Lạy Cha: Lạy Cha chúng con ở trên trời..."
                            onChange={e => updateCauHoi(idx, { goiY: e.target.value })} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {form.cauHoi.length === 0 && (
                <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm border border-dashed border-gray-200 dark:border-slate-600 rounded-xl">
                  Chưa có câu hỏi. Nhấn "Thêm câu" để bắt đầu.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="btn-primary text-sm px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {saving ? '...' : (editId ? 'Lưu thay đổi' : 'Tạo bài kiểm tra')}
            </button>
            <button type="button" onClick={resetForm}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700">
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* ── Danh sách quiz ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <select className="input max-w-48 text-sm" value={filterLop}
            onChange={e => setFilterLop(e.target.value)}>
            <option value="">Tất cả lớp</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.tenLop}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card text-center py-12 text-gray-400 dark:text-slate-500">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có bài kiểm tra nào</p>
          </div>
        ) : quizzes.map(quiz => (
          <div key={quiz._id} className="card flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{quiz.tieuDe}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${quiz.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {quiz.active ? 'Đang mở' : 'Chưa mở'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {quiz.lop?.tenLop} · {quiz.cauHoi?.length || 0} câu · {quiz.thoiGianLam} phút
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActiveMutation.mutate({ id: quiz._id, active: !quiz.active })}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition" title={quiz.active ? 'Tắt' : 'Mở'}>
                {quiz.active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
              </button>
              <Link to={`/quiz/${quiz._id}/monitor`}
                className="p-1.5 text-gray-400 hover:text-red-700 dark:hover:text-red-400 transition" title="Giám sát">
                <Eye size={16} />
              </Link>
              {(quiz.cauHoi || []).some(c => c.loai === 'tu_luan') && (
                <Link to={`/quiz/${quiz._id}/grade`}
                  className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition" title="Chấm bài tự luận">
                  <PenLine size={16} />
                </Link>
              )}
              <button onClick={() => openEdit(quiz)} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                <Edit2 size={15} />
              </button>
              <button onClick={() => { if (confirm('Xóa bài kiểm tra này?')) deleteMutation.mutate(quiz._id); }}
                className="p-1.5 text-gray-400 hover:text-red-600 transition">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
