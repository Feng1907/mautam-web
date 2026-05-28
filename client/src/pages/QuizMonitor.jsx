import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Eye, AlertTriangle, CheckCircle2, Clock, Users, Flag, PenLine, Trophy } from 'lucide-react';
import api from '../services/api';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

const VIOLATION_LABELS = { chuyen_tab: 'Chuyển tab', mat_focus: 'Mất focus', dong_trang: 'Đóng trang' };

export default function QuizMonitor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const socketRef = useRef(null);
  const [liveData, setLiveData] = useState({}); // { studentId: { soViPham, biFlagged, status, diem } }

  const { data: quiz } = useQuery({
    queryKey: ['quiz-monitor-info', id],
    queryFn: () => api.get(`/quizzes/${id}`).then(r => r.data.data),
  });

  const { data: monitor, isLoading } = useQuery({
    queryKey: ['quiz-monitor', id],
    queryFn: () => api.get(`/quizzes/${id}/monitor`, { params: { lopId: quiz?.lop?._id || quiz?.lop } }).then(r => r.data.data),
    enabled: !!quiz,
    refetchInterval: 30000,
  });

  const { data: results } = useQuery({
    queryKey: ['quiz-results', id],
    queryFn: () => api.get(`/quizzes/${id}/results`).then(r => r.data),
    enabled: !!id,
    refetchInterval: 15000,
  });

  // Socket real-time
  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.emit('join:quiz', id);
    socketRef.current.emit('join:lop', quiz?.lop?._id || quiz?.lop);

    socketRef.current.on('quiz:violation', (data) => {
      setLiveData(prev => ({
        ...prev,
        [data.studentId]: {
          ...prev[data.studentId],
          soViPham: data.soViPham,
          biFlagged: data.biFlagged,
          lastViolation: data.loai,
        },
      }));
    });

    socketRef.current.on('quiz:submitted', (data) => {
      setLiveData(prev => ({
        ...prev,
        [data.studentId]: {
          ...prev[data.studentId],
          status: 'submitted',
          diem: data.diem,
          tongDiem: data.tongDiem,
        },
      }));
      qc.invalidateQueries({ queryKey: ['quiz-results', id] });
    });

    return () => {
      socketRef.current?.emit('leave:quiz', id);
      socketRef.current?.disconnect();
    };
  }, [id, quiz]);

  const rows = monitor || [];
  const summary = results?.summary || {};

  const getStatus = (row) => {
    const live = liveData[row.student?._id];
    if (live?.status === 'submitted') return 'submitted';
    if (row.attempt?.daHoanThanh) return 'submitted';
    if (row.attempt?.batDau) return 'taking';
    return 'waiting';
  };

  const getViPham = (row) => {
    const live = liveData[row.student?._id];
    return live?.soViPham ?? row.attempt?.soViPham ?? 0;
  };

  const isFlagged = (row) => {
    const live = liveData[row.student?._id];
    return live?.biFlagged ?? row.attempt?.biFlagged ?? false;
  };

  const getDiem = (row) => {
    const live = liveData[row.student?._id];
    if (live?.diem != null) return `${live.diem}/${live.tongDiem}`;
    if (row.attempt?.diem != null) return `${row.attempt.diem}/${row.attempt.tongDiem}`;
    return '—';
  };

  return (
    <div className="page-container py-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Eye size={20} className="text-red-700 dark:text-red-400" />
            Giám sát bài kiểm tra
          </h1>
          {quiz && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{quiz.tieuDe} · {quiz.lop?.tenLop}</p>}
        </div>
        <div className="flex items-center gap-3">
          {quiz && (quiz.cauHoi || []).some(c => c.loai === 'tu_luan') && (
            <Link to={`/quiz/${id}/grade`}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
              <PenLine size={13} /> Chấm tự luận
            </Link>
          )}
          <Link to={`/quiz/${id}/leaderboard`}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
            <Trophy size={13} /> Xếp hạng
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-slate-400">Theo dõi real-time</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Tổng HS', value: summary.tong ?? rows.length, color: 'text-blue-600' },
          { icon: CheckCircle2, label: 'Đã nộp', value: summary.daNop ?? 0, color: 'text-green-600' },
          { icon: Clock, label: 'Đang làm', value: summary.dangLam ?? 0, color: 'text-amber-600' },
          { icon: Flag, label: 'Nghi vấn', value: summary.coBiFlagged ?? 0, color: 'text-red-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center py-3">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-gray-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Bảng theo dõi */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Học sinh</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Trạng thái</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Vi phạm</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                    {[1,2,3,4].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">Không có dữ liệu</td></tr>
              ) : rows.map((row) => {
                const status   = getStatus(row);
                const viPham   = getViPham(row);
                const flagged  = isFlagged(row);
                const liveInfo = liveData[row.student?._id];

                return (
                  <tr key={row.student?._id}
                    className={`border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                      flagged ? 'bg-red-50 dark:bg-red-900/10' : ''
                    }`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {flagged && <Flag size={12} className="text-red-500 shrink-0" />}
                        <span className="font-medium text-gray-800 dark:text-slate-200">{row.student?.hoTen}</span>
                        {liveInfo?.lastViolation && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 animate-pulse">
                            ({VIOLATION_LABELS[liveInfo.lastViolation]})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 size={10} /> Đã nộp
                        </span>
                      )}
                      {status === 'taking' && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock size={10} className="animate-pulse" /> Đang làm
                        </span>
                      )}
                      {status === 'waiting' && (
                        <span className="text-[11px] text-gray-400 dark:text-slate-500">Chưa vào</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {viPham > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          flagged ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          <AlertTriangle size={12} /> {viPham}
                          {flagged && <span className="text-[10px]">🚨</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{getDiem(row)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {summary.diemTB && (
        <p className="text-sm text-gray-500 dark:text-slate-400 text-right">
          Điểm trung bình lớp: <strong className="text-gray-800 dark:text-slate-200">{summary.diemTB}</strong>
        </p>
      )}
    </div>
  );
}
