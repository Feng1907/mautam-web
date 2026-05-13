/**
 * QrScanPage — Đoàn sinh quét mã QR điểm danh
 * Flow: Camera quét QR → verify token → chọn tên → ghi có mặt
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle, Loader2, QrCode, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const SCANNER_ID = 'qr-scanner-region';

// ── Trạng thái màn hình ───────────────────────────────────────────────────────
const STEP = {
  SCAN:    'scan',    // Camera đang bật, chờ quét
  VERIFY:  'verify',  // Đang verify token
  SELECT:  'select',  // Chọn tên trong danh sách
  LOADING: 'loading', // Đang gửi lên server
  SUCCESS: 'success', // Điểm danh thành công
  ERROR:   'error',   // Lỗi (token hết hạn, đã điểm danh, ...)
};

// ── Avatar placeholder ────────────────────────────────────────────────────────
const GRAD = ['#8B0000,#c0392b','#1A5276,#2980b9','#145A32,#27ae60',
              '#6C3483,#9b59b6','#7D6608,#f39c12','#1A5276,#16a085'];
function AvatarFallback({ name, size = 40 }) {
  const g = GRAD[name.charCodeAt(0) % GRAD.length].split(',');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg,${g[0]},${g[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QrScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlToken = searchParams.get('token'); // token từ QR URL (nếu mở link trực tiếp)

  const [step, setStep] = useState(urlToken ? STEP.VERIFY : STEP.SCAN);
  const [token, setToken] = useState(urlToken || '');
  const [sessionInfo, setSessionInfo] = useState(null); // { lopId, lopName, date, students, expiresAt }
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState(null); // { message, tenThanh, hoTen }
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const scannerRef = useRef(null);
  const scannerStarted = useRef(false);

  // ── Auto-verify nếu có token trong URL ────────────────────────────────────
  useEffect(() => {
    if (urlToken) verifyToken(urlToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Khởi động camera khi ở bước SCAN ─────────────────────────────────────
  useEffect(() => {
    if (step !== STEP.SCAN) return;
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    scannerStarted.current = false;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' }, // Camera sau
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            // QR chứa URL: https://mautam.net/diem-danh-qr?token=...
            try {
              const url = new URL(decodedText);
              const t = url.searchParams.get('token');
              if (t) {
                stopScanner(scanner);
                setToken(t);
                verifyToken(t);
              }
            } catch {
              // Thử dùng thẳng nếu là token thuần
              if (decodedText.length > 20) {
                stopScanner(scanner);
                setToken(decodedText);
                verifyToken(decodedText);
              }
            }
          },
          () => {} // frame error — bỏ qua
        );
        scannerStarted.current = true;
      } catch {
        setErrorMsg('Không thể truy cập camera. Vui lòng cho phép quyền camera.');
        setStep(STEP.ERROR);
      }
    };

    startScanner();
    return () => { stopScanner(scanner); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stopScanner = (sc) => {
    const s = sc || scannerRef.current;
    if (s && scannerStarted.current) {
      s.stop().catch(() => {});
      scannerStarted.current = false;
    }
  };

  // ── Verify token ──────────────────────────────────────────────────────────
  const verifyToken = useCallback(async (t) => {
    setStep(STEP.VERIFY);
    try {
      const { data } = await api.get(`/attendance/qr-verify?token=${encodeURIComponent(t)}`);
      setSessionInfo(data.data);
      setStep(STEP.SELECT);
    } catch (e) {
      const msg = e.response?.data?.message || 'Mã QR không hợp lệ';
      setErrorMsg(msg);
      setStep(STEP.ERROR);
    }
  }, []);

  // ── Gửi điểm danh ────────────────────────────────────────────────────────
  const submitScan = useCallback(async () => {
    if (!selectedId) return;
    setStep(STEP.LOADING);
    try {
      const { data } = await api.post('/attendance/qr-scan', { token, studentId: selectedId });
      setResult(data);
      setStep(STEP.SUCCESS);
    } catch (e) {
      const d = e.response?.data;
      setErrorMsg(d?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setStep(d?.alreadyChecked ? STEP.SUCCESS : STEP.ERROR);
      if (d?.alreadyChecked) setResult({ message: d.message, alreadyChecked: true });
    }
  }, [token, selectedId]);

  // ── Filter search ─────────────────────────────────────────────────────────
  const filtered = (sessionInfo?.students || []).filter(s =>
    s.hoTen.toLowerCase().includes(search.toLowerCase()) ||
    s.tenThanh.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-start"
      style={{ background: '#0a0f1a', fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="w-full max-w-md px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={20} style={{ color: '#D4AF37' }} />
          <span className="font-bold text-base" style={{ color: '#D4AF37', fontFamily: '"EB Garamond",serif' }}>
            Điểm Danh QR
          </span>
        </div>
        <p className="text-xs text-white/30">Xứ Đoàn Anrê Phú Yên – Mẫu Tâm</p>
      </div>

      <div className="w-full max-w-md px-4 pb-10 flex-1">
        <AnimatePresence mode="wait">

          {/* ── BƯỚC 1: Camera quét ── */}
          {step === STEP.SCAN && (
            <motion.div key="scan"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden border border-white/10 mt-2"
                style={{ background: '#0d1117' }}>
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-sm text-white/60 text-center">
                    Hướng camera vào mã QR trên màn hình
                  </p>
                </div>
                {/* Camera region */}
                <div className="relative" style={{ minHeight: 300 }}>
                  <div id={SCANNER_ID} className="w-full" />
                  {/* Khung ngắm */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-60 h-60">
                      {/* 4 góc */}
                      {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-lg'],
                        ['top-0 right-0','border-t-2 border-r-2 rounded-tr-lg'],
                        ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-lg'],
                        ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-lg'],
                      ].map(([pos, cls], i) => (
                        <div key={i} className={`absolute w-8 h-8 ${pos} ${cls}`}
                          style={{ borderColor: '#D4AF37' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-white/25">Tự động nhận diện khi có mã QR</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BƯỚC 2: Đang verify ── */}
          {step === STEP.VERIFY && (
            <motion.div key="verify"
              className="flex flex-col items-center justify-center gap-4 mt-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 size={40} className="animate-spin" style={{ color: '#D4AF37' }} />
              <p className="text-white/60 text-sm">Đang xác thực mã QR...</p>
            </motion.div>
          )}

          {/* ── BƯỚC 3: Chọn tên ── */}
          {step === STEP.SELECT && sessionInfo && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Session info card */}
              <div className="rounded-xl px-4 py-3 mt-2 mb-4"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>{sessionInfo.lopName}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Ngày {new Date(sessionInfo.date).toLocaleDateString('vi-VN', { weekday:'long', day:'numeric', month:'long' })}
                </p>
              </div>

              <p className="text-sm text-white/60 mb-3 font-medium">Bạn là ai?</p>

              {/* Search */}
              <input
                type="text"
                placeholder="Tìm tên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
                  text-sm text-white placeholder-white/25 focus:outline-none
                  focus:border-amber-500/40 mb-3"
              />

              {/* Danh sách */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-0.5">
                {filtered.map(s => (
                  <button key={s._id}
                    onClick={() => setSelectedId(prev => prev === s._id ? '' : s._id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left"
                    style={selectedId === s._id
                      ? { background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.4)' }
                      : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {s.avatar
                      ? <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      : <AvatarFallback name={s.hoTen} />
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{s.hoTen}</p>
                      <p className="text-xs text-white/40 truncate">{s.tenThanh}</p>
                    </div>
                    {selectedId === s._id && (
                      <CheckCircle2 size={18} style={{ color: '#D4AF37', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-white/30 text-sm py-6">Không tìm thấy</p>
                )}
              </div>

              {/* Nút xác nhận */}
              <button
                onClick={submitScan}
                disabled={!selectedId}
                className="w-full mt-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                style={selectedId
                  ? { background: '#D4AF37', color: '#12100c' }
                  : { background: 'rgba(212,175,55,0.15)', color: 'rgba(212,175,55,0.4)' }
                }
              >
                Xác nhận điểm danh
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── BƯỚC 4: Loading submit ── */}
          {step === STEP.LOADING && (
            <motion.div key="loading"
              className="flex flex-col items-center justify-center gap-4 mt-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 size={40} className="animate-spin" style={{ color: '#D4AF37' }} />
              <p className="text-white/60 text-sm">Đang ghi điểm danh...</p>
            </motion.div>
          )}

          {/* ── BƯỚC 5: Thành công ── */}
          {step === STEP.SUCCESS && result && (
            <motion.div key="success"
              className="flex flex-col items-center gap-5 mt-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {result.alreadyChecked
                ? <AlertTriangle size={64} style={{ color: '#f97316' }} />
                : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                    <CheckCircle2 size={80} style={{ color: '#22c55e' }} />
                  </motion.div>
                )
              }
              <div>
                <p className="text-lg font-bold text-white mb-1">
                  {result.alreadyChecked ? 'Đã điểm danh trước đó' : 'Điểm danh thành công!'}
                </p>
                <p className="text-white/50 text-sm px-4">{result.message}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Về trang chủ
              </button>
            </motion.div>
          )}

          {/* ── Lỗi ── */}
          {step === STEP.ERROR && (
            <motion.div key="error"
              className="flex flex-col items-center gap-5 mt-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <XCircle size={72} style={{ color: '#ef4444' }} />
              <div>
                <p className="text-lg font-bold text-white mb-1">Không thể điểm danh</p>
                <p className="text-white/50 text-sm px-4">{errorMsg}</p>
              </div>
              <button
                onClick={() => { setStep(STEP.SCAN); setErrorMsg(''); setToken(''); }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                Quét lại
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
