import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, Trophy, PenLine, BookOpen } from 'lucide-react';
import api from '../services/api';

const STATUS_CFG = {
  draft:     { label: 'Nháp',      cls: 'bg-gray-100 text-gray-600 border-gray-200'     },
  published: { label: 'Đang mở',   cls: 'bg-green-50 text-green-700 border-green-200'   },
  closed:    { label: 'Đã đóng',   cls: 'bg-red-50   text-red-700   border-red-200'     },
  grading:   { label: 'Chấm điểm', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export default function ClassQuizPanel({ lopId, canEdit }) {
  const { data, isLoading } = useQuery({
    queryKey: ['quizzes-class', lopId],
    queryFn: () => api.get('/quizzes', { params: { lopId } }).then(r => r.data.data ?? r.data),
    staleTime: 60_000,
  });

  const quizzes = Array.isArray(data) ? data : data?.quizzes ?? [];

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
    </div>
  );

  if (!quizzes.length) return (
    <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
      <BookOpen className="w-10 h-10 opacity-40" />
      <p className="text-sm">Lớp này chưa có bài kiểm tra nào</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {quizzes.map(quiz => {
        const cfg = STATUS_CFG[quiz.trangThai] ?? STATUS_CFG.draft;
        const hasEssay = quiz.cauHoi?.some(q => q.loai === 'tu_luan');
        return (
          <div key={quiz._id} className="rounded-xl border border-[#e5d5b5] bg-white p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {quiz.cauHoi?.length ?? 0} câu · {quiz.thoiGianLam ?? 0} phút
                  </span>
                </div>
                <p className="font-semibold text-[#3d1515] truncate">{quiz.tieuDe}</p>
                {quiz.moTa && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{quiz.moTa}</p>}
              </div>

              {canEdit && (
                <div className="flex gap-2 flex-wrap shrink-0">
                  <Link
                    to={`/quiz/${quiz._id}/monitor`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Giám sát
                  </Link>
                  <Link
                    to={`/quiz/${quiz._id}/leaderboard`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Xếp hạng
                  </Link>
                  {hasEssay && (
                    <Link
                      to={`/quiz/${quiz._id}/grade`}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
                    >
                      <PenLine className="w-3.5 h-3.5" /> Chấm tự luận
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
