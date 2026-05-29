import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PenLine, CheckCircle2, ChevronDown, ChevronUp, Save, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';

export default function QuizGrade() {
  const { id } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const [expanded, setExpanded] = useState(null);
  const [grades, setGrades] = useState({}); // { attemptId_cauHoiIndex: { diem, nhanXet } }

  const { data: quiz } = useQuery({
    queryKey: ['quiz-grade-info', id],
    queryFn: () => api.get(`/quizzes/${id}`).then(r => r.data.data),
  });

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['quiz-grade-attempts', id],
    queryFn: () => api.get(`/quizzes/${id}/attempts`).then(r => r.data.data),
    enabled: !!id,
  });

  const gradeMutation = useMutation({
    mutationFn: ({ attemptId, cauHoiIndex, diemDat, nhanXet }) =>
      api.post(`/quizzes/${id}/attempts/${attemptId}/grade`, { cauHoiIndex, diemDat, nhanXet }),
    onSuccess: () => {
      toast('Đã lưu điểm', 'success');
      qc.invalidateQueries({ queryKey: ['quiz-grade-attempts', id] });
    },
    onError: () => toast('Lưu điểm thất bại', 'error'),
  });

  const tuLuanQuestions = (quiz?.cauHoi || [])
    .map((c, i) => ({ ...c, index: i }))
    .filter(c => c.loai === 'tu_luan');

  const pendingAttempts = attempts.filter(a =>
    a.daHoanThanh && tuLuanQuestions.some(q => {
      const tr = a.cauTraLoi?.find(r => r.cauHoiIndex === q.index);
      return tr?.baiViet && tr?.dungKhong == null;
    })
  );
  const gradedAttempts = attempts.filter(a => a.daHoanThanh && a.daChayDuTuLuan);

  const getGradeKey = (attemptId, idx) => `${attemptId}_${idx}`;
  const getLocalGrade = (attemptId, idx) => grades[getGradeKey(attemptId, idx)];

  const handleSaveGrade = (attemptId, cauHoiIndex) => {
    const local = getLocalGrade(attemptId, cauHoiIndex);
    if (local?.diem == null || local.diem === '') {
      toast.error('Vui lòng nhập điểm');
      return;
    }
    gradeMutation.mutate({ attemptId, cauHoiIndex, diemDat: Number(local.diem), nhanXet: local.nhanXet || '' });
  };

  const maxDiem = (idx) => quiz?.cauHoi?.[idx]?.diem ?? 1;

  return (
    <div className="page-container py-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/quiz/${id}/monitor`} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <PenLine size={20} className="text-red-700 dark:text-red-400" />
            Chấm bài tự luận
          </h1>
          {quiz && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{quiz.tieuDe}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : pendingAttempts.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-slate-500">
          <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không có bài chờ chấm</p>
          {gradedAttempts.length > 0 && (
            <p className="text-sm mt-1">{gradedAttempts.length} bài đã chấm xong</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {pendingAttempts.length} bài chờ chấm · {gradedAttempts.length} đã chấm xong
          </p>

          {pendingAttempts.map(attempt => {
            const isOpen = expanded === attempt._id;
            const pendingCount = tuLuanQuestions.filter(q => {
              const tr = attempt.cauTraLoi?.find(r => r.cauHoiIndex === q.index);
              return tr?.baiViet && tr?.dungKhong == null;
            }).length;

            return (
              <div key={attempt._id} className="card p-0 overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : attempt._id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 dark:text-slate-100">
                      {attempt.student?.hoTen}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                      {pendingCount} câu chờ chấm
                    </span>
                    {attempt.diem != null && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        TN/ĐK: {attempt.diem}/{attempt.tongDiem}
                      </span>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
                    {tuLuanQuestions.map(q => {
                      const tr = attempt.cauTraLoi?.find(r => r.cauHoiIndex === q.index);
                      if (!tr?.baiViet) return null;
                      const alreadyGraded = tr.dungKhong != null;
                      const key = getGradeKey(attempt._id, q.index);
                      const local = grades[key] ?? { diem: alreadyGraded ? tr.diemDat : '', nhanXet: tr.nhanXetCham || '' };

                      return (
                        <div key={q.index} className="px-4 py-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                              Câu {q.index + 1} · Tự luận · {maxDiem(q.index)} điểm
                            </p>
                            <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">{q.noiDung}</p>
                            {q.goiY && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                                Gợi ý: {q.goiY}
                              </p>
                            )}
                          </div>

                          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5">
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Bài viết của học sinh:</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{tr.baiViet}</p>
                          </div>

                          {alreadyGraded ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <CheckCircle2 size={14} />
                              Đã chấm: {tr.diemDat}/{maxDiem(q.index)} điểm
                              {tr.nhanXetCham && <span className="text-gray-500 dark:text-slate-400 text-xs">· {tr.nhanXetCham}</span>}
                            </div>
                          ) : (
                            <div className="flex items-end gap-3">
                              <div>
                                <label className="label text-xs mb-1">Điểm (tối đa {maxDiem(q.index)})</label>
                                <input
                                  type="number" min={0} max={maxDiem(q.index)} step={0.25}
                                  className="input w-24 text-sm"
                                  value={local.diem}
                                  onChange={e => setGrades(g => ({ ...g, [key]: { ...local, diem: e.target.value } }))}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="label text-xs mb-1">Nhận xét (tuỳ chọn)</label>
                                <input
                                  type="text"
                                  className="input text-sm"
                                  placeholder="Nhận xét ngắn..."
                                  value={local.nhanXet}
                                  onChange={e => setGrades(g => ({ ...g, [key]: { ...local, nhanXet: e.target.value } }))}
                                />
                              </div>
                              <button
                                className="btn-primary text-sm px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0"
                                onClick={() => handleSaveGrade(attempt._id, q.index)}
                                disabled={gradeMutation.isPending}
                              >
                                <Save size={13} /> Lưu
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
