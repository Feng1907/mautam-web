import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, ChevronDown, UserCheck, Lock, Unlock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const STATUS_CONFIG = {
  confirmed: { label: 'Tham gia',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: '✅' },
  tentative: { label: 'Dự kiến',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   icon: '🤔' },
  declined:  { label: 'Vắng',      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',           icon: '❌' },
};

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d + (typeof d === 'string' && d.length === 10 ? 'T00:00:00' : ''));
  return dt.toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtDatetime = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

const isPast = (d) => new Date(d + (typeof d === 'string' && d.length === 10 ? 'T23:59:00' : '')) < new Date();

function RsvpButtons({ myRsvp, onRsvp, onCancel, loading }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          disabled={loading}
          onClick={() => myRsvp?.status === key ? onCancel() : onRsvp(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            myRsvp?.status === key
              ? `${cfg.color} border-current`
              : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-400'
          }`}
        >
          <span>{cfg.icon}</span> {cfg.label}
        </button>
      ))}
      {myRsvp && (
        <button onClick={onCancel} disabled={loading}
          className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition px-1">
          Hủy đăng ký
        </button>
      )}
    </div>
  );
}

export default function Events() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);
  const isParent = user?.vaiTro === 'PARENT';
  const [expanded, setExpanded] = useState(null);
  const [studentPanelOpen, setStudentPanelOpen] = useState(null);
  const [lopPanelOpen, setLopPanelOpen] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events-all'],
    queryFn: () => api.get('/events').then(r => r.data.data),
  });

  const { data: myStudents = [] } = useQuery({
    queryKey: ['my-students', user?.lopPhuTrach],
    queryFn: () => api.get(`/students/${user.lopPhuTrach}`).then(r => r.data.data || r.data),
    enabled: isGiaoly && !!user?.lopPhuTrach,
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ eventId, status }) => api.post(`/events/${eventId}/rsvp`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId) => api.delete(`/events/${eventId}/rsvp`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const studentRsvpMutation = useMutation({
    mutationFn: ({ eventId, studentId }) => api.post(`/events/${eventId}/student-rsvp`, { studentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const lopRsvpMutation = useMutation({
    mutationFn: (vars) => api.post(`/events/${vars.eventId}/lop-rsvp`, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const cancelLopRsvpMutation = useMutation({
    mutationFn: ({ eventId, lopId }) => api.delete(`/events/${eventId}/lop-rsvp`, { data: { lopId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const chotMutation = useMutation({
    mutationFn: ({ eventId, lopId }) => api.post(`/events/${eventId}/lop-rsvp/chot`, { lopId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events-all'] }),
  });

  const getMyRsvp = (ev) => ev.rsvpList?.find(r =>
    (r.user?._id || r.user)?.toString() === user?._id?.toString()
  );

  const isStudentRegistered = (ev, studentId) =>
    ev.studentRsvps?.some(r => (r.student?._id || r.student)?.toString() === studentId?.toString());

  // Lấy đăng ký lớp của user (dựa vào lopPhuTrach)
  const getMyLopRsvp = (ev) => {
    if (!user?.lopPhuTrach) return null;
    const myLopIds = Array.isArray(user.lopPhuTrach)
      ? user.lopPhuTrach.map(id => (id?._id || id)?.toString())
      : [user.lopPhuTrach?.toString()];
    return ev.dangKyLop?.find(r => myLopIds.includes((r.lop?._id || r.lop)?.toString()));
  };

  const getMyLopId = () => {
    if (!user?.lopPhuTrach) return null;
    const arr = Array.isArray(user.lopPhuTrach) ? user.lopPhuTrach : [user.lopPhuTrach];
    return (arr[0]?._id || arr[0])?.toString();
  };

  const events = data || [];
  const upcoming = events.filter(e => !isPast(e.date));
  const past     = events.filter(e => isPast(e.date));

  return (
    <div className="page-container py-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <Calendar size={24} className="text-red-700 dark:text-red-400" />
          Sự kiện
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Các sự kiện sắp tới của xứ đoàn
          {isGiaoly && !isParent && ' · Huynh trưởng có thể đăng ký tham dự'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-slate-500">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có sự kiện nào</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sắp tới</h2>
              {upcoming.map(ev => (
                <EventCard
                  key={ev._id} ev={ev} isGiaoly={isGiaoly} isParent={isParent}
                  myRsvp={getMyRsvp(ev)}
                  myLopRsvp={getMyLopRsvp(ev)}
                  myLopId={getMyLopId()}
                  myStudents={myStudents}
                  isStudentRegistered={(sid) => isStudentRegistered(ev, sid)}
                  onStudentToggle={(sid) => studentRsvpMutation.mutate({ eventId: ev._id, studentId: sid })}
                  studentRsvpLoading={studentRsvpMutation.isPending}
                  onLopRsvp={(lopId, soLuong, ghiChu) => lopRsvpMutation.mutate({ eventId: ev._id, lopId, soLuong, ghiChu })}
                  onCancelLopRsvp={(lopId) => cancelLopRsvpMutation.mutate({ eventId: ev._id, lopId })}
                  onChot={(lopId) => chotMutation.mutate({ eventId: ev._id, lopId })}
                  lopRsvpLoading={lopRsvpMutation.isPending || cancelLopRsvpMutation.isPending || chotMutation.isPending}
                  rsvpMutation={rsvpMutation} cancelMutation={cancelMutation}
                  expanded={expanded} setExpanded={setExpanded}
                  studentPanelOpen={studentPanelOpen} setStudentPanelOpen={setStudentPanelOpen}
                  lopPanelOpen={lopPanelOpen} setLopPanelOpen={setLopPanelOpen}
                />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Đã qua</h2>
              {past.map(ev => (
                <EventCard
                  key={ev._id} ev={ev} isGiaoly={false} isParent={isParent}
                  myRsvp={getMyRsvp(ev)}
                  myLopRsvp={getMyLopRsvp(ev)}
                  myLopId={getMyLopId()}
                  myStudents={[]}
                  isStudentRegistered={(sid) => isStudentRegistered(ev, sid)}
                  onStudentToggle={() => {}}
                  studentRsvpLoading={false}
                  onLopRsvp={() => {}} onCancelLopRsvp={() => {}} onChot={() => {}}
                  lopRsvpLoading={false}
                  rsvpMutation={rsvpMutation} cancelMutation={cancelMutation}
                  expanded={expanded} setExpanded={setExpanded}
                  studentPanelOpen={studentPanelOpen} setStudentPanelOpen={setStudentPanelOpen}
                  lopPanelOpen={lopPanelOpen} setLopPanelOpen={setLopPanelOpen}
                  isPast
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function LopRsvpPanel({ ev, myLopRsvp, myLopId, onLopRsvp, onCancelLopRsvp, onChot, loading, isGiaoly, past }) {
  const [soLuong, setSoLuong] = useState(myLopRsvp?.soLuong ?? 0);
  const [ghiChu, setGhiChu]   = useState(myLopRsvp?.ghiChu ?? '');
  const [editing, setEditing]  = useState(!myLopRsvp);

  const now = new Date();
  const inWindow = ev.dangKyLopEnabled &&
    (!ev.dangKyLopMo || now >= new Date(ev.dangKyLopMo)) &&
    (!ev.dangKyLopDong || now <= new Date(ev.dangKyLopDong));

  const canRegister = isGiaoly && !past && inWindow && !myLopRsvp;

  // Tổng hợp danh sách tất cả lớp đăng ký để hiển thị
  const allRegistered = ev.dangKyLop || [];
  const totalSoLuong  = allRegistered.reduce((s, r) => s + (r.soLuong || 0), 0);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
          <Users size={12} /> Đăng ký số lượng lớp
        </p>
        {allRegistered.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {allRegistered.length} lớp · {totalSoLuong} bạn
          </span>
        )}
      </div>

      {/* Window thông báo */}
      {ev.dangKyLopMo && !inWindow && !past && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Clock size={11} />
          {now < new Date(ev.dangKyLopMo)
            ? `Đăng ký mở lúc ${fmtDatetime(ev.dangKyLopMo)}`
            : `Đã kết thúc đăng ký lúc ${fmtDatetime(ev.dangKyLopDong)}`}
        </p>
      )}

      {/* Trạng thái lớp mình */}
      {myLopRsvp ? (
        <div className={`rounded-xl p-3 border ${myLopRsvp.daChot ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40'}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {myLopRsvp.daChot
                  ? <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1"><Lock size={11} /> Đã chốt</span>
                  : <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Đã đăng ký · chờ chốt</span>}
              </div>
              {editing && !myLopRsvp.daChot ? (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 dark:text-slate-400">Số lượng:</label>
                    <input type="number" min={0} value={soLuong}
                      onChange={e => setSoLuong(Number(e.target.value))}
                      className="input text-sm w-20" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-32">
                    <label className="text-xs text-gray-500 dark:text-slate-400">Ghi chú:</label>
                    <input type="text" value={ghiChu} maxLength={200}
                      onChange={e => setGhiChu(e.target.value)}
                      className="input text-sm flex-1" placeholder="Tuỳ chọn..." />
                  </div>
                  <button disabled={loading}
                    onClick={() => { onLopRsvp(myLopId, soLuong, ghiChu); setEditing(false); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition">
                    Cập nhật
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1">Hủy</button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mt-1">
                  {myLopRsvp.soLuong} bạn
                  {myLopRsvp.ghiChu && <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-1.5">· {myLopRsvp.ghiChu}</span>}
                </p>
              )}
              {myLopRsvp.daChot && myLopRsvp.chotLuc && (
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Chốt lúc {fmtDatetime(myLopRsvp.chotLuc)}</p>
              )}
            </div>
            {isGiaoly && !past && inWindow && (
              <div className="flex flex-col gap-1.5 shrink-0">
                {!myLopRsvp.daChot && (
                  <>
                    {!editing && (
                      <button onClick={() => { setSoLuong(myLopRsvp.soLuong); setGhiChu(myLopRsvp.ghiChu || ''); setEditing(true); }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        Sửa
                      </button>
                    )}
                    <button disabled={loading}
                      onClick={() => onChot(myLopId)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition flex items-center gap-1">
                      <Lock size={10} /> Chốt số lượng
                    </button>
                    <button disabled={loading}
                      onClick={() => onCancelLopRsvp(myLopId)}
                      className="text-xs text-gray-400 hover:text-red-500 transition text-center">
                      Hủy đăng ký
                    </button>
                  </>
                )}
                {myLopRsvp.daChot && (
                  <button disabled={loading}
                    onClick={() => onChot(myLopId)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1">
                    <Unlock size={10} /> Bỏ chốt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : canRegister ? (
        <div className="rounded-xl p-3 border border-dashed border-amber-300 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/5">
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Lớp bạn chưa đăng ký</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-slate-400">Số lượng:</label>
              <input type="number" min={0} value={soLuong}
                onChange={e => setSoLuong(Number(e.target.value))}
                className="input text-sm w-20" />
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-32">
              <label className="text-xs text-gray-500 dark:text-slate-400">Ghi chú:</label>
              <input type="text" value={ghiChu} maxLength={200}
                onChange={e => setGhiChu(e.target.value)}
                className="input text-sm flex-1" placeholder="Tuỳ chọn..." />
            </div>
            <button disabled={loading}
              onClick={() => onLopRsvp(myLopId, soLuong, ghiChu)}
              className="text-xs px-4 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition font-medium">
              Đăng ký
            </button>
          </div>
        </div>
      ) : (!isGiaoly || past) && allRegistered.length === 0 ? null : null}

      {/* Danh sách lớp đã đăng ký (read-only) */}
      {allRegistered.length > 0 && (
        <div className="space-y-1">
          {allRegistered.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
              <span className="font-medium text-gray-700 dark:text-slate-300">{r.lop?.tenLop || '—'}</span>
              <span>·</span>
              <span>{r.soLuong} bạn</span>
              {r.daChot && <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400"><Lock size={9} /> Chốt</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  ev, isGiaoly, isParent, myRsvp, myLopRsvp, myLopId, myStudents,
  isStudentRegistered, onStudentToggle, studentRsvpLoading,
  onLopRsvp, onCancelLopRsvp, onChot, lopRsvpLoading,
  rsvpMutation, cancelMutation, expanded, setExpanded,
  studentPanelOpen, setStudentPanelOpen, lopPanelOpen, setLopPanelOpen, isPast: past
}) {
  const confirmed = ev.rsvpList?.filter(r => r.status === 'confirmed').length || 0;
  const registeredStudents = ev.studentRsvps?.length || 0;
  const isExpanded = expanded === ev._id;
  const isStudentPanelOpen = studentPanelOpen === ev._id;
  const isLopPanelOpen = lopPanelOpen === ev._id;
  const loading = rsvpMutation.isPending || cancelMutation.isPending;
  const deadlinePassed = ev.rsvpDeadline && new Date() > new Date(ev.rsvpDeadline);
  const canRsvp = isGiaoly && !isParent && ev.rsvpEnabled && !past && !deadlinePassed;

  const dangKyCount = ev.dangKyLop?.length || 0;
  const totalSoLuong = (ev.dangKyLop || []).reduce((s, r) => s + (r.soLuong || 0), 0);
  const showLopSection = ev.dangKyLopEnabled && (isGiaoly && !isParent);

  return (
    <div className={`card transition-all ${past ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl"
          style={{ background: (ev.color || '#F8D444') + '22', border: `1.5px solid ${ev.color || '#F8D444'}66` }}>
          {ev.icon || '📅'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-800 dark:text-slate-100">{ev.name}</p>
            {myRsvp && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_CONFIG[myRsvp.status]?.color}`}>
                {STATUS_CONFIG[myRsvp.status]?.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1"><Clock size={11} /> {fmtDate(ev.date)}</span>
            {ev.rsvpEnabled && confirmed > 0 && (
              <span className="flex items-center gap-1"><Users size={11} /> {confirmed} xác nhận</span>
            )}
            {registeredStudents > 0 && (
              <span className="flex items-center gap-1"><UserCheck size={11} /> {registeredStudents} thiếu nhi</span>
            )}
            {ev.dangKyLopEnabled && dangKyCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Users size={11} /> {dangKyCount} lớp · {totalSoLuong} bạn
              </span>
            )}
            {ev.rsvpEnabled && ev.rsvpDeadline && (
              <span className={`flex items-center gap-1 ${deadlinePassed ? 'text-red-400' : ''}`}>
                <Calendar size={11} /> Hạn ĐK: {new Date(ev.rsvpDeadline).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          {/* RSVP huynh trưởng */}
          {canRsvp && (
            <div className="mt-3">
              <RsvpButtons
                myRsvp={myRsvp} loading={loading}
                onRsvp={(status) => rsvpMutation.mutate({ eventId: ev._id, status })}
                onCancel={() => cancelMutation.mutate(ev._id)}
              />
            </div>
          )}
          {isGiaoly && !isParent && ev.rsvpEnabled && deadlinePassed && !myRsvp && (
            <p className="mt-2 text-xs text-red-400">Đã hết hạn đăng ký</p>
          )}

          {/* Student RSVP toggle */}
          {isGiaoly && !past && ev.studentRsvpEnabled && myStudents.length > 0 && (
            <button
              onClick={() => setStudentPanelOpen(isStudentPanelOpen ? null : ev._id)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:underline">
              <UserCheck size={13} />
              Đăng ký thiếu nhi ({ev.studentRsvps?.length || 0}/{myStudents.length})
              <ChevronDown size={12} className={`transition-transform ${isStudentPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Lop RSVP toggle */}
          {showLopSection && (
            <button
              onClick={() => setLopPanelOpen(isLopPanelOpen ? null : ev._id)}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline">
              <Users size={13} />
              Đăng ký lớp {myLopRsvp ? (myLopRsvp.daChot ? '· Đã chốt' : `· ${myLopRsvp.soLuong} bạn`) : ''}
              <ChevronDown size={12} className={`transition-transform ${isLopPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {isGiaoly && !isParent && ev.rsvpEnabled && (
          <button onClick={() => setExpanded(isExpanded ? null : ev._id)}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition">
            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Student checklist panel */}
      {isStudentPanelOpen && ev.studentRsvpEnabled && myStudents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Đăng ký thiếu nhi tham dự
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {myStudents.map(s => {
              const checked = isStudentRegistered(s._id);
              return (
                <button key={s._id} disabled={studentRsvpLoading} onClick={() => onStudentToggle(s._id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    checked
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-400'
                  }`}>
                  <span className="text-[10px]">{checked ? '✅' : '⬜'}</span>
                  <span className="truncate">{s.hoTen}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lop RSVP panel */}
      {isLopPanelOpen && showLopSection && (
        <LopRsvpPanel
          ev={ev} myLopRsvp={myLopRsvp} myLopId={myLopId}
          onLopRsvp={onLopRsvp} onCancelLopRsvp={onCancelLopRsvp} onChot={onChot}
          loading={lopRsvpLoading} isGiaoly={isGiaoly} past={past}
        />
      )}

      {/* Expanded RSVP list */}
      {isExpanded && ev.rsvpList?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Danh sách đăng ký</p>
          {ev.rsvpList.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CONFIG[r.status]?.color}`}>
                {STATUS_CONFIG[r.status]?.label}
              </span>
              <span className="text-gray-700 dark:text-slate-300">{r.user?.hoTen || 'Huynh trưởng'}</span>
              {r.note && <span className="text-gray-400 dark:text-slate-500 text-xs">— {r.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
