import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, Calendar, ToggleLeft, ToggleRight,
  Users, ChevronDown, Lock, Clock } from 'lucide-react';
import api from '../../services/api';

const ICON_PRESETS = [
  '🎊','🧧','🌺',
  '⛺','🏕️','🔥',
  '🥮','🏮','🌕',
  '🎄','⭐','🔔',
  '✝️','🕯️','🙏',
];
const COLOR_PRESETS = [
  { label: 'Vàng kim',    v: '#F8D444' },
  { label: 'Vàng cam',    v: '#FBBF24' },
  { label: 'Cam',         v: '#f97316' },
  { label: 'Đỏ son',      v: '#ef4444' },
  { label: 'Hồng',        v: '#f472b6' },
  { label: 'Tím',         v: '#a855f7' },
  { label: 'Lam',         v: '#3b82f6' },
  { label: 'Xanh lá',     v: '#22c55e' },
  { label: 'Ngọc',        v: '#14b8a6' },
  { label: 'Trắng bạc',   v: '#e2e8f0' },
];

const EMPTY_FORM = {
  name: '', date: '', icon: '📅', color: '#F8D444', active: true, order: 0,
  rsvpEnabled: false, rsvpDeadline: '', studentRsvpEnabled: false,
  dangKyLopEnabled: false, dangKyLopMo: '', dangKyLopDong: '',
};

const normDate   = (v) => v ? v.slice(0, 16) : '';
const normDate10 = (v) => v ? v.slice(0, 10) : '';

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d + (typeof d === 'string' && d.length === 10 ? 'T00:00:00' : ''));
  return dt.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtDatetime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isPast = (d) => new Date(d + (d.length === 10 ? 'T23:59:00' : '')) < new Date();

export default function AdminEvents() {
  const [events,    setEvents]   = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [showForm,  setShowForm] = useState(false);
  const [form,      setForm]     = useState(EMPTY_FORM);
  const [editId,    setEditId]   = useState(null);
  const [saving,    setSaving]   = useState(false);
  const [delId,     setDelId]    = useState(null);
  const [error,     setError]    = useState('');
  const [lopPanel,  setLopPanel] = useState(null); // eventId being viewed
  const [lopList,   setLopList]  = useState([]);
  const [lopSummary, setLopSummary] = useState(null);
  const [lopLoading, setLopLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const r = await api.get('/events/all');
      setEvents(r.data.data);
    } catch { setError('Không tải được danh sách sự kiện.'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(true); setError(''); };
  const openEdit   = (ev) => {
    setForm({
      name: ev.name, date: normDate(ev.date), icon: ev.icon, color: ev.color,
      active: ev.active, order: ev.order ?? 0,
      rsvpEnabled: ev.rsvpEnabled ?? false, rsvpDeadline: normDate10(ev.rsvpDeadline),
      studentRsvpEnabled: ev.studentRsvpEnabled ?? false,
      dangKyLopEnabled: ev.dangKyLopEnabled ?? false,
      dangKyLopMo:   ev.dangKyLopMo   ? normDate(ev.dangKyLopMo)   : '',
      dangKyLopDong: ev.dangKyLopDong ? normDate(ev.dangKyLopDong) : '',
    });
    setEditId(ev._id);
    setShowForm(true);
    setError('');
  };
  const cancelForm = () => { setShowForm(false); setEditId(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) { setError('Tên và ngày là bắt buộc.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) {
        await api.put(`/events/${editId}`, form);
      } else {
        await api.post('/events', form);
      }
      await fetchEvents();
      cancelForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch { setError('Không xóa được.'); }
    finally  { setDelId(null); }
  };

  const toggleActive = async (ev) => {
    try {
      await api.put(`/events/${ev._id}`, { ...ev, active: !ev.active });
      setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, active: !e.active } : e));
    } catch { setError('Không cập nhật được.'); }
  };

  const openLopPanel = async (evId) => {
    if (lopPanel === evId) { setLopPanel(null); return; }
    setLopPanel(evId);
    setLopLoading(true);
    try {
      const r = await api.get(`/events/${evId}/lop-rsvp`);
      setLopList(r.data.data);
      setLopSummary(r.data.summary);
    } catch { setLopList([]); setLopSummary(null); }
    finally { setLopLoading(false); }
  };

  const deleteLopRsvp = async (evId, lopId) => {
    try {
      await api.delete(`/events/${evId}/lop-rsvp`, { data: { lopId } });
      setLopList(prev => prev.filter(r => (r.lop?._id || r.lop) !== lopId));
    } catch (err) { setError(err.response?.data?.message || 'Không xóa được.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title text-xl">Quản lý Sự kiện</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Sự kiện gần nhất sẽ tự động hiển thị trên trang chủ.
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 btn-primary text-sm px-3 py-2 rounded-lg">
          <Plus size={15} /> Thêm sự kiện
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
          <X size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* ── Form tạo / chỉnh sửa ── */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="card border-2 border-red-200 dark:border-red-800 space-y-4"
          >
            <h2 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-red-600" />
              {editId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Tên sự kiện *</label>
                <input className="input" placeholder="VD: Lễ Quan Thầy Anrê Phú Yên"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input type="date" className="input"
                  value={form.date?.slice(0, 10) ?? ''}
                  onChange={e => {
                    const d = e.target.value;
                    const t = form.date?.slice(11) || '';
                    setForm(f => ({ ...f, date: t ? `${d}T${t}` : d }));
                  }} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                  Giờ <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input type="time" className="input"
                  value={form.date?.length > 10 ? form.date.slice(11, 16) : ''}
                  onChange={e => {
                    const t = e.target.value;
                    const d = form.date?.slice(0, 10) || '';
                    setForm(f => ({ ...f, date: t ? `${d}T${t}` : d }));
                  }} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Thứ tự hiển thị</label>
                <input type="number" className="input" min={0} max={99}
                  value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Biểu tượng</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ICON_PRESETS.map(ic => (
                    <button key={ic} type="button"
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`text-xl w-9 h-9 rounded-lg border-2 transition ${form.icon === ic ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-200 dark:border-slate-600 hover:border-gray-400'}`}>
                      {ic}
                    </button>
                  ))}
                  <input className="input w-16 text-center text-lg" maxLength={4}
                    value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Màu số đếm</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button key={c.v} type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.v }))}
                      className={`w-7 h-7 rounded-full border-2 transition ${form.color === c.v ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c.v }} title={c.label} />
                  ))}
                  <input className="input w-24 font-mono text-xs" placeholder="#F8D444"
                    value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                  <div className="w-7 h-7 rounded-full border border-gray-200" style={{ background: form.color }} />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-slate-700">
              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" className="sr-only" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                {form.active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                <span className="text-sm text-gray-700 dark:text-slate-300">Kích hoạt sự kiện</span>
              </label>

              {/* RSVP huynh trưởng */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className="sr-only" checked={form.rsvpEnabled}
                    onChange={e => setForm(f => ({ ...f, rsvpEnabled: e.target.checked }))} />
                  {form.rsvpEnabled ? <ToggleRight size={22} className="text-blue-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                  <span className="text-sm text-gray-700 dark:text-slate-300">Cho phép Huynh trưởng đăng ký tham dự</span>
                </label>
                {form.rsvpEnabled && (
                  <div className="ml-7">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Hạn đăng ký (tuỳ chọn)</label>
                    <input type="date" className="input max-w-45"
                      value={form.rsvpDeadline}
                      onChange={e => setForm(f => ({ ...f, rsvpDeadline: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Student RSVP */}
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" className="sr-only" checked={form.studentRsvpEnabled}
                  onChange={e => setForm(f => ({ ...f, studentRsvpEnabled: e.target.checked }))} />
                {form.studentRsvpEnabled ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                <span className="text-sm text-gray-700 dark:text-slate-300">Cho phép đăng ký thiếu nhi (sự kiện trại)</span>
              </label>

              {/* Đăng ký lớp */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className="sr-only" checked={form.dangKyLopEnabled}
                    onChange={e => setForm(f => ({ ...f, dangKyLopEnabled: e.target.checked }))} />
                  {form.dangKyLopEnabled ? <ToggleRight size={22} className="text-amber-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                  <span className="text-sm text-gray-700 dark:text-slate-300">Cho phép đăng ký số lượng theo lớp</span>
                </label>
                {form.dangKyLopEnabled && (
                  <div className="ml-7 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Mở đăng ký</label>
                      <input type="datetime-local" className="input text-sm"
                        value={form.dangKyLopMo}
                        onChange={e => setForm(f => ({ ...f, dangKyLopMo: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Đóng đăng ký</label>
                      <input type="datetime-local" className="input text-sm"
                        value={form.dangKyLopDong}
                        onChange={e => setForm(f => ({ ...f, dangKyLopDong: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 btn-primary text-sm px-4 py-2 rounded-lg disabled:opacity-50">
                {saving ? '...' : <><Check size={14} /> {editId ? 'Lưu thay đổi' : 'Tạo sự kiện'}</>}
              </button>
              <button type="button" onClick={cancelForm}
                className="flex items-center gap-1.5 btn-ghost text-sm px-4 py-2 rounded-lg">
                <X size={14} /> Hủy
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Danh sách ── */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 dark:text-slate-500">
          <Calendar size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có sự kiện nào. Hãy thêm sự kiện đầu tiên.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const past = isPast(ev.date);
            const isLopPanelOpen = lopPanel === ev._id;
            const dangKyCount = ev.dangKyLop?.length || 0;

            return (
              <div key={ev._id}>
                <motion.div
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`card flex items-center gap-3 py-3 px-4 transition-opacity ${!ev.active ? 'opacity-50' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: ev.color + '22', border: `1.5px solid ${ev.color}66` }}>
                    {ev.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm truncate">{ev.name}</p>
                    <p className={`text-xs mt-0.5 ${past ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>
                      {fmtDate(ev.date)} {past ? '· Đã qua' : ''}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {!ev.active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-400">Tắt</span>
                    )}
                    {past && ev.active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Đã qua</span>
                    )}
                    {!past && ev.active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sắp tới</span>
                    )}
                    {ev.dangKyLopEnabled && (
                      <button
                        onClick={() => openLopPanel(ev._id)}
                        className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold transition ${
                          isLopPanelOpen
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200'
                        }`}>
                        <Users size={9} /> {dangKyCount} lớp đăng ký
                        <ChevronDown size={9} className={`transition-transform ${isLopPanelOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(ev)} title={ev.active ? 'Tắt' : 'Bật'}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                      {ev.active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => openEdit(ev)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition">
                      <Pencil size={14} />
                    </button>
                    {delId === ev._id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(ev._id)}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition">Xóa</button>
                        <button onClick={() => setDelId(null)}
                          className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 transition">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => setDelId(ev._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Panel đăng ký lớp */}
                <AnimatePresence>
                  {isLopPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="mx-1 mb-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-b-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} /> Danh sách đăng ký lớp
                          </p>
                          {lopSummary && (
                            <div className="flex items-center gap-3 text-xs text-amber-700 dark:text-amber-400">
                              <span>{lopSummary.tongLop} lớp</span>
                              <span>·</span>
                              <span>{lopSummary.tongSoLuong} bạn</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Lock size={10} /> {lopSummary.daChot} đã chốt</span>
                            </div>
                          )}
                        </div>

                        {lopLoading ? (
                          <div className="space-y-2">
                            {[1,2,3].map(i => <div key={i} className="h-8 rounded bg-amber-100 dark:bg-amber-900/20 animate-pulse" />)}
                          </div>
                        ) : lopList.length === 0 ? (
                          <p className="text-xs text-amber-600 dark:text-amber-500 text-center py-4">Chưa có lớp nào đăng ký</p>
                        ) : (
                          <div className="space-y-1.5">
                            {lopList.map((r, i) => {
                              const lopId = r.lop?._id || r.lop;
                              return (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-gray-800 dark:text-slate-200">{r.lop?.tenLop || '—'}</span>
                                    {r.lop?.nganh && <span className="ml-1.5 text-[10px] text-gray-400">{r.lop.nganh}</span>}
                                  </div>
                                  <span className="text-gray-600 dark:text-slate-400 text-xs font-medium">{r.soLuong} bạn</span>
                                  {r.daChot ? (
                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                                      <Lock size={8} /> Đã chốt
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">Chờ chốt</span>
                                  )}
                                  <span className="text-[10px] text-gray-400 dark:text-slate-500 items-center gap-0.5 hidden sm:inline-flex">
                                    <Clock size={9} /> {fmtDatetime(r.dangKyLuc)}
                                  </span>
                                  {r.ghiChu && <span className="text-xs text-gray-400 italic truncate max-w-32 hidden md:block">{r.ghiChu}</span>}
                                  <button
                                    onClick={() => deleteLopRsvp(ev._id, lopId)}
                                    className="p-1 text-gray-300 dark:text-slate-600 hover:text-red-500 transition">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {ev.dangKyLopMo && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-3">
                            Thời gian đăng ký: {fmtDatetime(ev.dangKyLopMo)} → {ev.dangKyLopDong ? fmtDatetime(ev.dangKyLopDong) : 'không giới hạn'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-slate-600">
        * Trang chủ tự động chọn sự kiện <strong>active</strong> có ngày gần nhất trong tương lai để đếm ngược.
        Khi tất cả sự kiện đã qua, thanh đếm ngược sẽ tự ẩn.
      </p>
    </div>
  );
}
