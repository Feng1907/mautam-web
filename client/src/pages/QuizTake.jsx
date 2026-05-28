import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Clock, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

const LOAI_LABELS = { trac_nghiem: 'Trắc nghiệm', dien_khuyet: 'Điền khuyết', tu_luan: 'Tự luận' };

function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function QuizTake() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(null);
  const [cauHoi, setCauHoi] = useState([]);
  const [answers, setAnswers] = useState({});   // { cauHoiIndex: value }
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [violations, setViolations] = useState(0);
  const [warningMsg, setWarningMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const tabLeftAt = useRef(null);
  const blurAt    = useRef(null);
  const timerRef  = useRef(null);

  const { data: quizInfo } = useQuery({
    queryKey: ['quiz-info', id],
    queryFn: () => api.get(`/quizzes/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  // ── Bắt đầu làm bài ────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: () => api.post(`/quizzes/${id}/start`, { studentId }),
    onSuccess: (res) => {
      const d = res.data.data;
      setAttemptId(d.attemptId);
      setCauHoi(d.cauHoi);
      const secs = (d.thoiGianLam || 30) * 60;
      setTimeLeft(secs);
      // Khôi phục câu trả lời cũ nếu có
      const prev = {};
      (d.cauTraLoiHienTai || []).forEach(tr => {
        if (tr.loai === 'trac_nghiem') prev[tr.cauHoiIndex] = tr.dapAnChon;
        else if (tr.loai === 'dien_khuyet') prev[tr.cauHoiIndex] = tr.noiDungDien;
        else if (tr.loai === 'tu_luan') prev[tr.cauHoiIndex] = tr.baiViet;
      });
      setAnswers(prev);
      setStarted(true);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Không thể bắt đầu bài kiểm tra');
    },
  });

  // ── Nộp bài ─────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: () => {
      const cauTraLoi = cauHoi.map((c, idx) => ({
        cauHoiIndex: idx,
        loai: c.loai,
        dapAnChon:   c.loai === 'trac_nghiem' ? (answers[idx] || null) : undefined,
        noiDungDien: c.loai === 'dien_khuyet' ? (answers[idx] || '') : undefined,
        baiViet:     c.loai === 'tu_luan'     ? (answers[idx] || '') : undefined,
      }));
      return api.post(`/quizzes/${id}/submit`, { attemptId, cauTraLoi });
    },
    onSuccess: (res) => {
      clearInterval(timerRef.current);
      setResult(res.data.data);
      setSubmitted(true);
    },
  });

  // ── Báo vi phạm ─────────────────────────────────────────
  const reportViolation = useCallback((loai, soGiay = 0) => {
    if (!attemptId || submitted) return;
    setViolations(v => {
      const newCount = v + 1;
      if (newCount === 1) setWarningMsg('⚠️ Bạn đã thoát khỏi trang thi — huynh trưởng đã được thông báo');
      else if (newCount >= 3) setWarningMsg('🚨 Bài thi của bạn đã bị đánh dấu nghi vấn');
      setTimeout(() => setWarningMsg(''), 5000);
      return newCount;
    });
    // Gửi qua fetch thường (attemptId đã có)
    fetch(`${API_BASE}/api/quizzes/${id}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, loai, soGiay }),
      keepalive: true,
    }).catch(() => {});
  }, [attemptId, submitted, id]);

  // ── Anti-cheat event listeners ───────────────────────────
  useEffect(() => {
    if (!started || submitted) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        tabLeftAt.current = Date.now();
      } else {
        if (tabLeftAt.current) {
          const soGiay = (Date.now() - tabLeftAt.current) / 1000;
          if (soGiay > 5) reportViolation('chuyen_tab', Math.round(soGiay));
          tabLeftAt.current = null;
        }
      }
    };

    const onBlur = () => { blurAt.current = Date.now(); };
    const onFocus = () => {
      if (blurAt.current) {
        const soGiay = (Date.now() - blurAt.current) / 1000;
        if (soGiay > 5) reportViolation('mat_focus', Math.round(soGiay));
        blurAt.current = null;
      }
    };

    const onBeforeUnload = () => {
      if (attemptId) {
        navigator.sendBeacon(
          `${API_BASE}/api/quizzes/${id}/violation`,
          new Blob([JSON.stringify({ attemptId, loai: 'dong_trang', soGiay: 0 })],
            { type: 'application/json' })
        );
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [started, submitted, attemptId, reportViolation, id]);

  // ── Đồng hồ đếm ngược ───────────────────────────────────
  useEffect(() => {
    if (!started || submitted || timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitMutation.mutate();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  // ── Chưa bắt đầu ────────────────────────────────────────
  if (!started) {
    return (
      <div className="page-container py-8 max-w-2xl mx-auto">
        <div className="card text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
            <Clock size={28} className="text-red-700 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{quizInfo?.tieuDe}</h1>
            {quizInfo?.moTa && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{quizInfo.moTa}</p>}
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {quizInfo?.thoiGianLam} phút</span>
            <span>{quizInfo?.cauHoi?.length} câu hỏi</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300 text-left space-y-1">
            <p className="font-semibold">⚠️ Lưu ý quan trọng:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li>Không chuyển tab, không tắt trang trong khi làm bài</li>
              <li>Huynh trưởng sẽ được thông báo ngay nếu bạn rời khỏi trang</li>
              <li>Nếu rời trang quá 3 lần, bài sẽ bị đánh dấu nghi vấn</li>
              <li>Bài tự động nộp khi hết giờ</li>
            </ul>
          </div>
          {!studentId && (
            <p className="text-sm text-red-500">Thiếu thông tin học sinh. Vui lòng quay lại trang danh sách.</p>
          )}
          <button
            disabled={!studentId || startMutation.isPending}
            onClick={() => startMutation.mutate()}
            className="btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 mx-auto">
            {startMutation.isPending ? 'Đang tải...' : 'Bắt đầu làm bài'}
          </button>
        </div>
      </div>
    );
  }

  // ── Đã nộp ──────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="page-container py-8 max-w-2xl mx-auto space-y-4">
        <div className="card text-center space-y-3">
          <CheckCircle2 size={40} className="text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Đã nộp bài!</h2>
          {result.coTuLuan ? (
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Điểm tự động: <strong>{result.diem}</strong>/{result.tongDiem} điểm<br />
              <span className="text-amber-600 dark:text-amber-400">Câu tự luận đang chờ huynh trưởng chấm</span>
            </p>
          ) : (
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Kết quả: <strong className="text-2xl text-red-700 dark:text-red-400">{result.diem}</strong>/{result.tongDiem} điểm
            </p>
          )}
          {violations > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">Vi phạm: {violations} lần</p>
          )}
        </div>

        {/* Chi tiết kết quả */}
        <div className="space-y-3">
          {cauHoi.map((c, idx) => {
            const tr = result.ketQua?.find(t => t.cauHoiIndex === idx);
            const dung = tr?.dungKhong;
            return (
              <div key={idx} className={`card border-l-4 ${
                tr?.loai === 'tu_luan' ? 'border-purple-400' :
                dung ? 'border-green-400' : 'border-red-400'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-0.5 w-5 shrink-0">#{idx+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-slate-100">{c.noiDung}</p>
                    <div className="mt-1.5">
                      {c.loai === 'trac_nghiem' && (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${dung ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Bạn chọn: {tr?.dapAnChon || '(không chọn)'}
                          </span>
                          {!dung && tr?.dapAnChon && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              ✓ Đáp án: {c.dapAn?.find(d => d.dungKhong)?.chu}
                            </span>
                          )}
                        </div>
                      )}
                      {c.loai === 'dien_khuyet' && (
                        <div className="text-xs">
                          <span className={`px-2 py-0.5 rounded font-semibold ${dung ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Bạn điền: "{answers[idx] || ''}"
                          </span>
                        </div>
                      )}
                      {c.loai === 'tu_luan' && (
                        <span className="text-xs text-purple-600 dark:text-purple-400">Chờ huynh trưởng chấm</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {tr?.diemDat != null ? `${tr.diemDat}/${c.diem}đ` : `/${c.diem}đ`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate('/quiz')}
          className="btn-secondary text-sm px-4 py-2 rounded-lg">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  // ── Đang làm bài ────────────────────────────────────────
  const cau = cauHoi[current];
  const answered = Object.keys(answers).filter(k => {
    const v = answers[k];
    return v !== null && v !== undefined && v !== '';
  }).length;
  const urgent = timeLeft !== null && timeLeft <= 300; // 5 phút cuối

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header cố định */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">
            {quizInfo?.tieuDe}
          </span>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-lg ${
            urgent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
          }`}>
            <Clock size={14} className={urgent ? 'animate-pulse' : ''} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </div>

      {/* Cảnh báo vi phạm */}
      {warningMsg && (
        <div className={`fixed top-14 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-semibold ${
          violations >= 3 ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'
        }`}>
          {warningMsg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Câu {current + 1} / {cauHoi.length}</span>
          <span>{answered}/{cauHoi.length} đã trả lời</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
          <div className="bg-red-600 dark:bg-red-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((current + 1) / cauHoi.length) * 100}%` }} />
        </div>

        {/* Câu hỏi */}
        {cau && (
          <div className="card space-y-4">
            <div className="flex items-start gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 mt-0.5 ${
                cau.loai === 'trac_nghiem' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                cau.loai === 'dien_khuyet' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {LOAI_LABELS[cau.loai]}
              </span>
              <p className="text-gray-800 dark:text-slate-100 font-medium leading-relaxed flex-1">{cau.noiDung}</p>
            </div>

            {/* Trắc nghiệm */}
            {cau.loai === 'trac_nghiem' && (
              <div className="grid grid-cols-1 gap-2">
                {cau.dapAn?.map(d => (
                  <button key={d.chu} onClick={() => setAnswers(a => ({ ...a, [current]: d.chu }))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                      answers[current] === d.chu
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-400'
                    }`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      answers[current] === d.chu
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                    }`}>{d.chu}</span>
                    <span className="text-sm text-gray-700 dark:text-slate-300">{d.noiDung}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Điền khuyết */}
            {cau.loai === 'dien_khuyet' && (
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Điền từ vào chỗ trống (___)</p>
                <input
                  className="input text-base"
                  placeholder="Nhập câu trả lời..."
                  value={answers[current] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [current]: e.target.value }))}
                  autoFocus
                />
              </div>
            )}

            {/* Tự luận */}
            {cau.loai === 'tu_luan' && (
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                  Viết câu trả lời của bạn — ({(answers[current] || '').length} ký tự)
                </p>
                <textarea
                  className="input min-h-32 resize-none text-sm leading-relaxed"
                  placeholder="Nhập câu trả lời..."
                  value={answers[current] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [current]: e.target.value }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Điều hướng câu hỏi */}
        <div className="flex items-center justify-between gap-2">
          <button disabled={current === 0}
            onClick={() => setCurrent(c => c - 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-slate-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700">
            <ChevronLeft size={16} /> Câu trước
          </button>

          {current < cauHoi.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700">
              Câu sau <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => setShowConfirm(true)}
              className="btn-primary flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm">
              <Send size={14} /> Nộp bài
            </button>
          )}
        </div>

        {/* Grid câu hỏi */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">Tổng quan</p>
          <div className="flex flex-wrap gap-1.5">
            {cauHoi.map((_, idx) => {
              const done = answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '';
              return (
                <button key={idx} onClick={() => setCurrent(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    idx === current ? 'ring-2 ring-red-600 dark:ring-red-500' : ''
                  } ${done
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                  }`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút nộp bài (nếu chưa ở câu cuối) */}
        {current < cauHoi.length - 1 && (
          <div className="text-center">
            <button onClick={() => setShowConfirm(true)}
              className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 mx-auto">
              <Send size={13} /> Nộp bài ngay
            </button>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="text-amber-500 shrink-0" />
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">Xác nhận nộp bài</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Bạn đã trả lời <strong>{answered}</strong>/{cauHoi.length} câu.{' '}
              {answered < cauHoi.length && <span className="text-amber-600 dark:text-amber-400">Còn {cauHoi.length - answered} câu chưa trả lời. </span>}
              Sau khi nộp không thể sửa.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowConfirm(false); submitMutation.mutate(); }}
                disabled={submitMutation.isPending}
                className="btn-primary flex-1 py-2 rounded-lg text-sm disabled:opacity-50">
                {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-slate-400">
                Tiếp tục làm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
