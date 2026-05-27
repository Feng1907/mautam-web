import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, ChevronDown } from 'lucide-react';
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
        <button
          onClick={onCancel}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition px-1"
        >
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
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events-all'],
    queryFn: () => api.get('/events').then(r => r.data.data),
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ eventId, status }) => api.post(`/events/${eventId}/rsvp`, { status }),
    onSuccess: () => qc.invalidateQueries(['events-all']),
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId) => api.delete(`/events/${eventId}/rsvp`),
    onSuccess: () => qc.invalidateQueries(['events-all']),
  });

  const getMyRsvp = (ev) => ev.rsvpList?.find(r =>
    (r.user?._id || r.user)?.toString() === user?._id?.toString()
  );

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
          {isGiaoly && ' · Huynh trưởng có thể đăng ký tham dự'}
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
              {upcoming.map(ev => <EventCard key={ev._id} ev={ev} isGiaoly={isGiaoly} myRsvp={getMyRsvp(ev)} rsvpMutation={rsvpMutation} cancelMutation={cancelMutation} expanded={expanded} setExpanded={setExpanded} />)}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Đã qua</h2>
              {past.map(ev => <EventCard key={ev._id} ev={ev} isGiaoly={false} myRsvp={getMyRsvp(ev)} rsvpMutation={rsvpMutation} cancelMutation={cancelMutation} expanded={expanded} setExpanded={setExpanded} isPast />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ ev, isGiaoly, myRsvp, rsvpMutation, cancelMutation, expanded, setExpanded, isPast: past }) {
  const confirmed = ev.rsvpList?.filter(r => r.status === 'confirmed').length || 0;
  const isExpanded = expanded === ev._id;
  const loading = rsvpMutation.isPending || cancelMutation.isPending;
  const deadlinePassed = ev.rsvpDeadline && new Date() > new Date(ev.rsvpDeadline);

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
            {ev.rsvpEnabled && ev.rsvpDeadline && (
              <span className={`flex items-center gap-1 ${deadlinePassed ? 'text-red-400' : ''}`}>
                <Calendar size={11} /> Hạn ĐK: {new Date(ev.rsvpDeadline).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          {/* RSVP buttons */}
          {isGiaoly && ev.rsvpEnabled && !past && !deadlinePassed && (
            <div className="mt-3">
              <RsvpButtons
                myRsvp={myRsvp}
                loading={loading}
                onRsvp={(status) => rsvpMutation.mutate({ eventId: ev._id, status })}
                onCancel={() => cancelMutation.mutate(ev._id)}
              />
            </div>
          )}
          {isGiaoly && ev.rsvpEnabled && deadlinePassed && !myRsvp && (
            <p className="mt-2 text-xs text-red-400">Đã hết hạn đăng ký</p>
          )}
        </div>

        {isGiaoly && ev.rsvpEnabled && (
          <button onClick={() => setExpanded(isExpanded ? null : ev._id)}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition">
            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Expanded RSVP list (giaoly xem người khác đã đăng ký) */}
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
