/**
 * QrAttendanceGenerator — Admin tạo mã QR điểm danh cho buổi học
 * JWT sessionToken TTL 3–5 phút để tránh chia sẻ ảnh QR từ xa
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, RefreshCw, Clock, Loader2, ChevronDown } from 'lucide-react';
import api from '../services/api';

const TTL_OPTIONS = [
  { label: '3 phút', value: 3 },
  { label: '5 phút', value: 5 },
  { label: '10 phút', value: 10 },
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
export default function QrAttendanceGenerator({ classes = [], defaultDate }) {
  const [open, setOpen] = useState(false);
  const [lopId, setLopId] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [ttl, setTtl] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); // { qrDataUrl, expiresAt, ... }
  const printRef = useRef(null);

  const { remaining, display, expired } = useCountdown(session?.expiresAt);

  // % còn lại để vẽ progress ring
  const progress = session
    ? Math.round((remaining / session.ttlSeconds) * 100)
    : 100;

  const generate = useCallback(async () => {
    if (!lopId || !date) return setError('Vui lòng chọn lớp và ngày.');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/attendance/qr-session', {
        lopId, date, ttlMinutes: ttl,
      });
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
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
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
                    {/* Chọn lớp */}
                    <div>
                      <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Lớp</label>
                      <div className="relative">
                        <select
                          value={lopId}
                          onChange={e => setLopId(e.target.value)}
                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg
                            px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40"
                        >
                          <option value="">— Chọn lớp —</option>
                          {classes.map(c => (
                            <option key={c._id} value={c._id}>{c.tenLop}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-white/30 pointer-events-none" />
                      </div>
                    </div>

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
                  /* ── Hiển thị QR + countdown ── */
                  <div className="flex flex-col items-center gap-4">
                    {/* Progress ring + QR */}
                    <div className="relative" style={{ width: 230, height: 230 }}>
                      {/* SVG ring countdown */}
                      <svg className="absolute inset-0" width="230" height="230" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="115" cy="115" r="110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle
                          cx="115" cy="115" r="110" fill="none"
                          stroke={expired ? '#ef4444' : progress > 30 ? '#D4AF37' : '#f97316'}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 110}`}
                          strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)}`}
                          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                        />
                      </svg>
                      {/* QR image */}
                      <img
                        src={session.qrDataUrl}
                        alt="QR điểm danh"
                        className="absolute inset-2 rounded-xl object-cover"
                        style={{ filter: expired ? 'grayscale(1) opacity(0.3)' : 'none' }}
                      />
                      {expired && (
                        <div className="absolute inset-2 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.7)' }}>
                          <span className="text-red-400 font-bold text-sm">HẾT HẠN</span>
                        </div>
                      )}
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: expired ? '#ef4444' : '#D4AF37' }} />
                      <span
                        className="font-mono text-xl font-bold"
                        style={{ color: expired ? '#ef4444' : progress > 30 ? '#D4AF37' : '#f97316' }}
                      >
                        {display}
                      </span>
                      <span className="text-white/40 text-xs">còn lại</span>
                    </div>

                    <p className="text-white/40 text-xs text-center">
                      Lớp: <span className="text-white/70">{classes.find(c => c._id === session.lopId)?.tenLop}</span>
                      {' · '}Ngày: <span className="text-white/70">{session.date}</span>
                    </p>

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
