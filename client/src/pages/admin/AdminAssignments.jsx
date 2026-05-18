import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Send, Eye, X, Check, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import { SkeletonTable } from '../../components/Skeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// ─── Assignee cell picker ─────────────────────────────────────────────────────
function AssigneePicker({ users, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [noteText, setNoteText] = useState('');

  const addUser = (user) => {
    if (value.some(a => a.user === user._id)) return;
    onChange([...value, { user: user._id, name: user.hoTen, note: '' }]);
  };

  const addFree = () => {
    const name = freeText.trim();
    if (!name) return;
    onChange([...value, { user: null, name, note: noteText.trim() }]);
    setFreeText(''); setNoteText('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="relative group">
      {/* Current assignees */}
      <div className="flex flex-wrap gap-1 min-h-[28px]">
        {value.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-[11px] px-1.5 py-0.5 rounded font-medium">
            {a.name}{a.note ? ` ${a.note}` : ''}
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 leading-none">×</button>
          </span>
        ))}
        <button
          onClick={() => setOpen(o => !o)}
          className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
          title="Thêm người"
        >
          <UserPlus size={13} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2">
          {/* Search users */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chọn từ hệ thống</p>
          <div className="max-h-36 overflow-y-auto space-y-0.5">
            {users.filter(u => u.vaiTro === 'giaoly' || u.vaiTro === 'admin').map(u => (
              <button key={u._id}
                onClick={() => addUser(u)}
                disabled={value.some(a => a.user === u._id)}
                className="w-full text-left px-2 py-1.5 text-[12px] rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-slate-200 transition"
              >
                {u.hoTen}
                <span className="text-[10px] text-gray-400 ml-1">({u.chucVu || u.vaiTro})</span>
              </button>
            ))}
          </div>

          {/* Free text */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1 border-t border-gray-100 dark:border-slate-700">Hoặc nhập tên tự do</p>
          <input
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="Tên (vd: C. Lan, A. Phong)"
            className="w-full text-[12px] px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200"
          />
          <input
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Ghi chú (vd: SĐ, VĐ, Châu:...)"
            className="w-full text-[12px] px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200"
          />
          <div className="flex gap-2">
            <button onClick={addFree} disabled={!freeText.trim()}
              className="flex-1 bg-red-600 text-white text-[11px] py-1.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-40 transition">
              Thêm
            </button>
            <button onClick={() => setOpen(false)}
              className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-[11px] py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sheet editor ─────────────────────────────────────────────────────────────
function SheetEditor({ initial, users, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!initial?._id;

  const [title, setTitle]       = useState(initial?.title || '');
  const [desc, setDesc]         = useState(initial?.description || '');
  const [taskTypes, setTaskTypes] = useState(initial?.taskTypes?.length ? initial.taskTypes : ['Dẫn Lễ', 'Đọc Sách', 'Lời Nguyện']);
  const [sessions, setSessions] = useState(
    initial?.sessions?.length ? initial.sessions :
    [{ label: 'Buổi 1', date: '', tasks: [] }]
  );
  const [saving, setSaving]     = useState(false);
  const [newTaskType, setNewTaskType] = useState('');

  // Sync tasks when taskTypes change
  const syncSessions = useCallback((types, sess) =>
    sess.map(s => ({
      ...s,
      tasks: types.map(t => ({
        type: t,
        assignees: s.tasks?.find(tk => tk.type === t)?.assignees || [],
      })),
    })), []);

  const updateTaskTypes = (types) => {
    setTaskTypes(types);
    setSessions(prev => syncSessions(types, prev));
  };

  const addTaskType = () => {
    const v = newTaskType.trim();
    if (!v || taskTypes.includes(v)) return;
    updateTaskTypes([...taskTypes, v]);
    setNewTaskType('');
  };

  const removeTaskType = (i) => updateTaskTypes(taskTypes.filter((_, idx) => idx !== i));

  const addSession = () => {
    setSessions(prev => [...prev, {
      label: `Buổi ${prev.length + 1}`, date: '',
      tasks: taskTypes.map(t => ({ type: t, assignees: [] })),
    }]);
  };

  const removeSession = (i) => setSessions(prev => prev.filter((_, idx) => idx !== i));

  const updateSession = (si, field, val) =>
    setSessions(prev => prev.map((s, i) => i === si ? { ...s, [field]: val } : s));

  const updateAssignees = (si, ti, assignees) =>
    setSessions(prev => prev.map((s, i) => i !== si ? s : {
      ...s,
      tasks: s.tasks.map((t, j) => j !== ti ? t : { ...t, assignees }),
    }));

  const handleSave = async () => {
    if (!title.trim()) return toast('Vui lòng nhập tiêu đề', 'error');
    setSaving(true);
    try {
      const body = { title: title.trim(), description: desc.trim(), taskTypes, sessions };
      const res = isEdit
        ? await api.put(`/assignments/${initial._id}`, body)
        : await api.post('/assignments', body);
      toast(isEdit ? 'Đã cập nhật bảng phân công' : 'Đã tạo bảng phân công', 'success');
      onSaved(res.data.data);
    } catch (err) {
      toast(err.response?.data?.message || 'Lưu thất bại', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl my-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-black text-gray-800 dark:text-slate-100">
            {isEdit ? 'Chỉnh sửa bảng phân công' : 'Tạo bảng phân công mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title + Desc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tiêu đề *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="VD: Phân Công Tuần Thánh 2026"
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mô tả</label>
              <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Ghi chú thêm (tuỳ chọn)"
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
          </div>

          {/* Task types (columns) */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vai trò / Cột</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {taskTypes.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 text-[12px] px-2.5 py-1 rounded-lg font-semibold border border-yellow-200 dark:border-yellow-800">
                  {t}
                  <button onClick={() => removeTaskType(i)} className="text-yellow-400 hover:text-yellow-700 leading-none">×</button>
                </span>
              ))}
              <div className="flex gap-1">
                <input value={newTaskType} onChange={e => setNewTaskType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTaskType()}
                  placeholder="Thêm vai trò..."
                  className="text-[12px] px-2 py-1 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 w-36 focus:outline-none focus:ring-1 focus:ring-red-400" />
                <button onClick={addTaskType}
                  className="px-2 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700 transition">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Bảng phân công</label>
              <button onClick={addSession}
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 transition">
                <Plus size={13} /> Thêm buổi
              </button>
            </div>

            {taskTypes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Thêm ít nhất 1 vai trò để hiển thị bảng.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-yellow-400 text-yellow-900">
                      <th className="px-3 py-2.5 text-left font-black w-32">Buổi / Ngày</th>
                      {taskTypes.map(t => (
                        <th key={t} className="px-3 py-2.5 text-center font-black uppercase tracking-wide">{t}</th>
                      ))}
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, si) => (
                      <tr key={si} className={si % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-blue-50/50 dark:bg-slate-700/50'}>
                        <td className="px-3 py-2 align-top">
                          <input value={session.label} onChange={e => updateSession(si, 'label', e.target.value)}
                            className="w-full text-[12px] font-semibold bg-transparent border-b border-gray-200 dark:border-slate-600 focus:outline-none focus:border-red-400 dark:text-slate-200 text-red-700 dark:text-red-400" />
                          <input value={session.date} onChange={e => updateSession(si, 'date', e.target.value)}
                            placeholder="dd/mm"
                            className="mt-0.5 w-full text-[11px] bg-transparent border-b border-gray-100 dark:border-slate-700 focus:outline-none focus:border-red-300 text-gray-400 dark:text-slate-500" />
                        </td>
                        {(session.tasks || []).map((task, ti) => (
                          <td key={ti} className="px-3 py-2 align-top">
                            <AssigneePicker
                              users={users}
                              value={task.assignees}
                              onChange={(assignees) => updateAssignees(si, ti, assignees)}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 align-top">
                          <button onClick={() => removeSession(si)}
                            className="text-gray-300 hover:text-red-500 transition" title="Xóa buổi">
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition">
            Huỷ
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-60 transition flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
            {isEdit ? 'Cập nhật' : 'Lưu nháp'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View table (published) ────────────────────────────────────────────────────
function SheetView({ sheet, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl my-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-base font-black text-[#8B0000] dark:text-red-400 uppercase tracking-wide">{sheet.title}</h2>
            {sheet.description && <p className="text-xs text-gray-400 mt-0.5">{sheet.description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-yellow-400 text-yellow-900">
                <th className="px-3 py-2.5 text-left font-black border border-yellow-500 w-32"></th>
                {sheet.taskTypes.map(t => (
                  <th key={t} className="px-3 py-2.5 text-center font-black uppercase tracking-wide border border-yellow-500">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.sessions.map((session, si) => (
                <tr key={si} className={si % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-blue-50 dark:bg-slate-700/50'}>
                  <td className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 align-top">
                    <p className="font-bold text-red-700 dark:text-red-400 leading-tight">{session.label}</p>
                    {session.date && <p className="text-[11px] text-gray-400">{session.date}</p>}
                  </td>
                  {sheet.taskTypes.map(type => {
                    const task = session.tasks?.find(t => t.type === type);
                    return (
                      <td key={type} className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 align-top text-center">
                        {task?.assignees?.length ? (
                          <div className="space-y-0.5">
                            {task.assignees.map((a, i) => (
                              <p key={i} className="text-gray-700 dark:text-slate-200 leading-snug">
                                {a.name}{a.note ? <span className="text-gray-400"> {a.note}</span> : ''}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-200 dark:text-slate-600">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAssignments() {
  const toast = useToast();
  const [sheets, setSheets]   = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor]   = useState(null); // null | 'new' | sheet object
  const [viewer, setViewer]   = useState(null); // sheet to view
  const [publishing, setPublishing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [sr, ur] = await Promise.all([
          api.get('/assignments'),
          api.get('/users'),
        ]);
        setSheets(Array.isArray(sr.data?.data) ? sr.data.data : []);
        setUsers(Array.isArray(ur.data?.data) ? ur.data.data : []);
      } catch {
        toast('Không tải được dữ liệu', 'error');
      } finally { setLoading(false); }
    })();
  }, [toast]);

  const handleSaved = (sheet) => {
    setSheets(prev => {
      const idx = prev.findIndex(s => s._id === sheet._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = sheet; return next; }
      return [sheet, ...prev];
    });
    setEditor(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bảng phân công này?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      setSheets(prev => prev.filter(s => s._id !== id));
      toast('Đã xóa', 'success');
    } catch { toast('Xóa thất bại', 'error'); }
  };

  const handlePublish = async (sheet) => {
    setPublishing(sheet._id);
    try {
      const res = await api.post(`/assignments/${sheet._id}/publish`);
      setSheets(prev => prev.map(s => s._id === sheet._id ? { ...s, isPublished: true, notifiedAt: new Date().toISOString() } : s));
      toast(`Đã công bố và thông báo ${res.data.notified} người`, 'success');
    } catch { toast('Công bố thất bại', 'error'); }
    finally { setPublishing(null); }
  };

  const openView = async (sheet) => {
    try {
      const res = await api.get(`/assignments/${sheet._id}`);
      setViewer(res.data.data);
    } catch { toast('Không tải được', 'error'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title text-xl">Phân Công Sự Kiện</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tạo bảng phân công cho Tuần Thánh, Trại, lễ lớn...</p>
        </div>
        <button
          onClick={() => setEditor('new')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-sm"
        >
          <Plus size={15} /> Tạo bảng mới
        </button>
      </div>

      {/* List */}
      {loading ? <SkeletonTable rows={4} cols={4} /> : sheets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold">Chưa có bảng phân công nào.</p>
          <p className="text-sm mt-1">Nhấn "Tạo bảng mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sheets.map(sheet => (
            <div key={sheet._id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800 dark:text-slate-100 truncate">{sheet.title}</p>
                  {sheet.isPublished ? (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      ✓ Đã công bố
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400">
                      Nháp
                    </span>
                  )}
                </div>
                {sheet.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{sheet.description}</p>
                )}
                <p className="text-[11px] text-gray-300 dark:text-slate-500 mt-1">
                  Tạo {fmtDate(sheet.createdAt)}{sheet.createdBy?.hoTen ? ` · ${sheet.createdBy.hoTen}` : ''}
                  {sheet.notifiedAt ? ` · Đã gửi thông báo ${fmtDate(sheet.notifiedAt)}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openView(sheet)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition" title="Xem bảng">
                  <Eye size={15} />
                </button>
                <button onClick={() => setEditor(sheet)}
                  className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition" title="Chỉnh sửa">
                  <Pencil size={15} />
                </button>
                {!sheet.isPublished && (
                  <button
                    onClick={() => handlePublish(sheet)}
                    disabled={publishing === sheet._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition"
                    title="Công bố & gửi thông báo"
                  >
                    {publishing === sheet._id
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Send size={12} />}
                    Công bố
                  </button>
                )}
                <button onClick={() => handleDelete(sheet._id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition" title="Xóa">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editor && (
        <SheetEditor
          initial={editor === 'new' ? null : editor}
          users={users}
          onClose={() => setEditor(null)}
          onSaved={handleSaved}
        />
      )}

      {/* View modal */}
      {viewer && <SheetView sheet={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}
