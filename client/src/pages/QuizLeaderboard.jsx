import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ArrowLeft, Clock, Flag, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function QuizLeaderboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-leaderboard', id],
    queryFn: () => api.get(`/quizzes/${id}/leaderboard`).then(r => r.data),
    refetchInterval: 30000,
  });

  const rows = data?.data || [];
  const quiz = data?.quiz;

  const fmtTime = (d) => d
    ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—';

  const pct = (diem, tong) => tong ? Math.round(diem / tong * 100) : 0;
  const scoreColor = (p) => p >= 80 ? 'text-emerald-700 dark:text-emerald-400' : p >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="page-container py-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={isGiaoly ? `/quiz/${id}/monitor` : '/quiz'}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Bảng xếp hạng
          </h1>
          {quiz && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{quiz.tieuDe}</p>}
        </div>
      </div>

      {/* Top 3 podium */}
      {!isLoading && rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">🥈</div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-xl pt-4 pb-3 flex flex-col items-center gap-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 text-center px-1 truncate w-full text-center">
                {rows[1].hoTen}
              </p>
              <p className={`text-base font-black ${scoreColor(pct(rows[1].diem, rows[1].tongDiem))}`}>
                {rows[1].diem}/{rows[1].tongDiem}
              </p>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl">🥇</div>
            <div className="w-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-t-xl pt-5 pb-3 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-100 text-center px-1 truncate w-full text-center">
                {rows[0].hoTen}
              </p>
              <p className={`text-lg font-black ${scoreColor(pct(rows[0].diem, rows[0].tongDiem))}`}>
                {rows[0].diem}/{rows[0].tongDiem}
              </p>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">🥉</div>
            <div className="w-full bg-orange-50 dark:bg-orange-900/10 rounded-t-xl pt-3 pb-3 flex flex-col items-center gap-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 text-center px-1 truncate w-full text-center">
                {rows[2].hoTen}
              </p>
              <p className={`text-base font-black ${scoreColor(pct(rows[2].diem, rows[2].tongDiem))}`}>
                {rows[2].diem}/{rows[2].tongDiem}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 w-10">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Học sinh</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">Điểm</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hidden sm:table-cell">Nộp lúc</th>
                {isGiaoly && (
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">VP</th>
                )}
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
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
                    Chưa có học sinh nộp bài
                  </td>
                </tr>
              ) : rows.map((row) => {
                const p = pct(row.diem, row.tongDiem);
                return (
                  <tr key={row.studentId}
                    className={`border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                      row.rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
                    }`}>
                    <td className="px-3 py-3 text-center">
                      {row.rank <= 3
                        ? <span className="text-base">{MEDAL[row.rank - 1]}</span>
                        : <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">{row.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800 dark:text-slate-200">{row.hoTen}</span>
                      {row.tenThanh && (
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">{row.tenThanh}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${scoreColor(p)}`}>{row.diem}/{row.tongDiem}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">({p}%)</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 justify-center">
                        <Clock size={10} /> {fmtTime(row.nopLuc)}
                      </span>
                    </td>
                    {isGiaoly && (
                      <td className="px-3 py-3 text-center">
                        {row.soViPham > 0 ? (
                          <span className={`text-xs font-bold flex items-center gap-0.5 justify-center ${row.biFlagged ? 'text-red-600 dark:text-red-400' : 'text-amber-500'}`}>
                            <AlertTriangle size={11} />{row.soViPham}
                            {row.biFlagged && <Flag size={10} />}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
        Tự động cập nhật mỗi 30 giây · {rows.length} học sinh đã nộp bài
      </p>
    </div>
  );
}
