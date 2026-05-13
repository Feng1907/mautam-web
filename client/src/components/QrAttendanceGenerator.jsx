/**
 * QrAttendanceGenerator — Admin tạo mã QR điểm danh cho buổi học
 * JWT sessionToken TTL 3–5 phút để tránh chia sẻ ảnh QR từ xa
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, RefreshCw, Clock, Loader2, ChevronDown, MapPin, MapPinOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const TTL_OPTIONS = [
  { label: '1 phút', value: 1 },
  { label: '2 phút', value: 2 },
  { label: '3 phút', value: 3 },
];

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, display: `${mm}:${ss}`, expired: remaining === 0 };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function QrAttendanceGenerator({ classes = [], defaultDate, defaultLopId, defaultLopName }) {
  const [open, setOpen] = useState(false);
  const [lopId, setLopId] = useState(defaultLopId || '');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [ttl, setTtl] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); // { qrDataUrl, expiresAt, requiresLocation, ... }
  const printRef = useRef(null);

  // Vị trí của admin (tuỳ chọn)
  const [requireLoc, setRequireLoc] = useState(false);
  const [adminGps, setAdminGps] = useState(null);  // { lat, lng }
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | ok | error
  const [maxDistance, setMaxDistance] = useState(200); // mét

  const { remaining, display, expired } = useCountdown(session?.expiresAt);

  // % còn lại để vẽ progress ring
  const progress = session
    ? Math.round((remaining / session.ttlSeconds) * 100)
    : 100;

  // Lấy GPS của admin khi bật toggle vị trí
  const fetchAdminGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAdminGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('ok');
      },
      () => setGpsStatus('error'),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const handleToggleLoc = (val) => {
    setRequireLoc(val);
    if (val && gpsStatus === 'idle') fetchAdminGps();
  };

  const generate = useCallback(async () => {
    if (!lopId || !date) return setError('Vui lòng chọn lớp và ngày.');
    if (requireLoc && gpsStatus !== 'ok')
      return setError('Chưa lấy được vị trí. Vui lòng thử lại hoặc tắt yêu cầu vị trí.');
    setError('');
    setLoading(true);
    try {
      const body = { lopId, date, ttlMinutes: ttl };
      if (requireLoc && adminGps) {
        body.lat = adminGps.lat;
        body.lng = adminGps.lng;
        body.maxDistance = maxDistance;
      }
      const { data } = await api.post('/attendance/qr-session', body);
      setSession(data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Không tạo được mã QR.');
    } finally {
      setLoading(false);
    }
  }, [lopId, date, ttl]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    const lopName = classes.find(c => c._id === lopId)?.tenLop || lopId;
    w.document.write(`
      <html><head><title>QR Điểm Danh — ${lopName}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center;
               justify-content: center; min-height: 100vh; font-family: sans-serif; }
        h2 { color: #8B0000; margin-bottom: 4px; font-size: 22px; }
        p  { color: #555; margin: 2px 0; font-size: 14px; }
        img { width: 320px; height: 320px; margin: 20px 0; display: block; }
        .warn { color: #cc0000; font-size: 13px; margin-top: 8px; }
      </style></head><body>
      <h2>Điểm Danh QR — ${lopName}</h2>
      <p>Ngày: ${date}</p>
      <p>Hết hạn lúc: ${new Date(session.expiresAt).toLocaleTimeString('vi-VN')}</p>
      <img src="${session.qrDataUrl}" />
      <p class="warn">⚠ Mã QR chỉ có hiệu lực ${ttl} phút. Không chia sẻ ảnh này.</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const reset = () => setSession(null);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
          bg-amber-500/10 border border-amber-500/20 text-amber-400
          hover:bg-amber-500/20 transition"
      >
        <QrCode size={16} />
        QR Điểm Danh
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-200 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#12100c,#0d0b08)', border: '1px solid rgba(212,175,55,0.2)' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ background: 'rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
                <div className="flex items-center gap-2">
                  <QrCode size={18} style={{ color: '#D4AF37' }} />
                  <span className="font-bold text-base" style={{ color: '#D4AF37', fontFamily: '"EB Garamond",serif' }}>
                    Tạo QR Điểm Danh
                  </span>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition">
                  <X size={15} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {!session ? (
                  /* ── Form chọn lớp / ngày / TTL ── */
                  <>
                    {/* Chọn lớp — ẩn khi đã được truyền từ ClassDetail */}
                    {defaultLopId ? (
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Lớp</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5">
                          <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
                            {defaultLopName || lopId}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Lớp</label>
                        <div className="relative">
                          <select
                            value={lopId}
                            onChange={e => setLopId(e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg
                              px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="" style={{ background: '#1c1410', color: '#e2d5c0' }}>— Chọn lớp —</option>
                            {classes.map(c => (
                              <option key={c._id} value={c._id} style={{ background: '#1c1410', color: '#e2d5c0' }}>{c.tenLop}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-3 text-white/30 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Ngày */}
                    <div>
                      <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Ngày</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg
                          px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40"
                      />
                    </div>

                    {/* TTL */}
                    <div>
                      <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">
                        Thời hạn mã QR
                      </label>
                      <div className="flex gap-2">
                        {TTL_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setTtl(opt.value)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold border transition"
                            style={ttl === opt.value
                              ? { background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-white/30 mt-1.5">
                        Sau {ttl} phút mã sẽ hết hạn — đoàn sinh không thể dùng lại.
                      </p>
                    </div>

                    {/* Toggle yêu cầu vị trí */}
                    <div className="rounded-xl border overflow-hidden"
                      style={{ border: requireLoc ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)', background: requireLoc ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleLoc(!requireLoc)}
                        className="w-full flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          {requireLoc ? <MapPin size={15} style={{ color: '#D4AF37' }} /> : <MapPinOff size={15} className="text-white/30" />}
                          <span className="text-sm font-medium" style={{ color: requireLoc ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>
                            Yêu cầu xác nhận vị trí
                          </span>
                        </div>
                        {/* Toggle switch */}
                        <div className="relative w-10 h-5 rounded-full transition"
                          style={{ background: requireLoc ? '#D4AF37' : 'rgba(255,255,255,0.12)' }}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                            style={{ left: requireLoc ? '1.375rem' : '0.125rem' }} />
                        </div>
                      </button>
                      {requireLoc && (
                        <div className="px-4 pb-3 space-y-2">
                          {/* GPS status */}
                          <div className="flex items-center gap-2 text-xs">
                            {gpsStatus === 'loading' && <Loader2 size={12} className="animate-spin text-amber-400" />}
                            {gpsStatus === 'ok' && <ShieldCheck size={12} style={{ color: '#22c55e' }} />}
                            {gpsStatus === 'error' && <MapPinOff size={12} className="text-red-400" />}
                            <span style={{ color: gpsStatus === 'ok' ? '#22c55e' : gpsStatus === 'error' ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                              {gpsStatus === 'idle' && 'Đang chờ vị trí...'}
                              {gpsStatus === 'loading' && 'Đang lấy vị trí...'}
                              {gpsStatus === 'ok' && `Đã lấy vị trí (${adminGps?.lat?.toFixed(4)}, ${adminGps?.lng?.toFixed(4)})`}
                              {gpsStatus === 'error' && 'Không lấy được vị trí'}
                            </span>
                            {gpsStatus === 'error' && (
                              <button onClick={fetchAdminGps} className="text-amber-400 underline">Thử lại</button>
                            )}
                          </div>
                          {/* Bán kính */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40 shrink-0">Bán kính:</span>
                            {[50, 100, 200, 500].map(m => (
                              <button key={m} onClick={() => setMaxDistance(m)}
                                className="px-2.5 py-0.5 rounded-lg text-xs font-semibold transition"
                                style={maxDistance === m
                                  ? { background: 'rgba(212,175,55,0.25)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }
                                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
                                }>
                                {m}m
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={generate}
                      disabled={loading || !lopId || !date}
                      className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                      style={{ background: (!lopId || !date) ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.85)', color: '#12100c' }}
                    >
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                      {loading ? 'Đang tạo...' : 'Tạo mã QR'}
                    </button>
                  </>
                ) : (
                  /* ── Hiển thị QR + countdown — flex column, không absolute ── */
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>

                    {/* CSS animations */}
                    <style>{`
                      @keyframes qr-warn-pulse {
                        from { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
                        to   { box-shadow: 0 0 0 10px rgba(239,68,68,0.35); }
                      }
                      @keyframes qr-blink {
                        0%,100% { opacity:1; } 50% { opacity:0.55; }
                      }
                    `}</style>

                    {/* 1 ── Vòng tròn đếm ngược (120×120, không absolute) */}
                    {(() => {
                      const S = 120, SW = 7, R = (S - SW) / 2;
                      const CIRC = 2 * Math.PI * R;
                      const warn = remaining <= 10 && !expired;
                      const col  = expired || warn ? '#ef4444'
                        : progress > 30 ? '#F8D444' : '#f97316';
                      return (
                        <svg width={S} height={S} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
                          <circle cx={S/2} cy={S/2} r={R}
                            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
                          <circle cx={S/2} cy={S/2} r={R}
                            fill="none" stroke={col} strokeWidth={SW} strokeLinecap="round"
                            strokeDasharray={CIRC}
                            strokeDashoffset={CIRC * (1 - progress / 100)}
                            style={{
                              transition: 'stroke-dashoffset 1s linear, stroke 0.4s',
                              filter: `drop-shadow(0 0 ${warn ? 8 : 4}px ${col}${warn ? '' : '90'})`,
                              animation: warn ? 'qr-blink 0.8s ease-in-out infinite' : 'none',
                            }}
                          />
                        </svg>
                      );
                    })()}

                    {/* 2 ── Mã QR (nền trắng, border-radius, padding) */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: 10,
                      width: 220, height: 220,
                      flexShrink: 0,
                      position: 'relative',
                      animation: remaining <= 10 && !expired
                        ? 'qr-warn-pulse 0.8s ease-in-out infinite alternate' : 'none',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    }}>
                      <img
                        src={session.qrDataUrl}
                        alt="QR điểm danh"
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'contain',
                          filter: expired ? 'grayscale(1) opacity(0.25)' : 'none',
                          transition: 'filter 0.3s',
                          borderRadius: 8,
                        }}
                      />
                      {expired && (
                        <div style={{
                          position:'absolute', inset:0, borderRadius:16,
                          background:'rgba(0,0,0,0.65)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          <span style={{ color:'#ef4444', fontWeight:900, fontSize:16, letterSpacing:'0.15em' }}>HẾT HẠN</span>
                        </div>
                      )}
                    </div>

                    {/* 3 ── Text đếm ngược + thông tin */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: 32,
                        lineHeight: 1,
                        letterSpacing: '0.05em',
                        color: expired ? '#ef4444'
                          : remaining <= 10 ? '#ef4444'
                          : progress > 30 ? '#F8D444' : '#f97316',
                        textShadow: remaining <= 10 && !expired
                          ? '0 0 14px rgba(239,68,68,0.7)' : 'none',
                        animation: remaining <= 10 && !expired
                          ? 'qr-blink 0.8s ease-in-out infinite' : 'none',
                      }}>
                        {display}
                      </span>
                      <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em' }}>
                        {expired ? 'Đã hết hạn' : 'còn lại'}
                      </span>
                    </div>

                    <p className="text-white/40 text-xs text-center">
                      Lớp: <span className="text-white/70">{classes.find(c => c._id === session.lopId)?.tenLop}</span>
                      {' · '}Ngày: <span className="text-white/70">{session.date}</span>
                    </p>
                    {session.requiresLocation && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                        <ShieldCheck size={12} />
                        Yêu cầu xác nhận vị trí (trong vòng {maxDistance}m)
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handlePrint}
                        disabled={expired}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border transition flex items-center justify-center gap-1.5"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: expired ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}
                      >
                        In QR
                      </button>
                      <button
                        onClick={reset}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition"
                        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}
                      >
                        <RefreshCw size={13} />
                        Tạo lại
                      </button>
                    </div>

                    {expired && (
                      <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 w-full">
                        Mã QR đã hết hạn. Nhấn "Tạo lại" để tạo mã mới.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
