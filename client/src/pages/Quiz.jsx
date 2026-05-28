import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, BookOpen, AlertCircle, Eye, PenLine, Settings, Trophy } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;

function QuizStatusBadge({ quiz }) {
  const now = new Date();
  const start = quiz.batDauTu ? new Date(quiz.batDauTu) : null;
  const end   = quiz.ketThucLuc ? new Date(quiz.ketThucLuc) : null;

  if (!quiz.active) return <span className="badge-gray">Chưa mở</span>;
  if (start && now < start) return <span className="badge-amber">Sắp mở lúc {fmtDate(quiz.batDauTu)}</span>;
  if (end && now > end) return <span className="badge-red">Đã đóng</span>;
  return <span className="badge-green">Đang mở</span>;
}

function canTake(quiz) {
  if (!quiz.active) return false;
  const now = new Date();
  if (quiz.batDauTu && now < new Date(quiz.batDauTu)) return false;
  if (quiz.ketThucLuc && now > new Date(quiz.ketThucLuc)) return false;
  return true;
}

export default function QuizPage() {
  const { user } = useAuth();
  const isGiaoly = user && ['admin', 'giaoly'].includes(user.vaiTro);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Phụ huynh chọn con
  const { data: linkedStudents = [] } = useQuery({
    queryKey: ['linked-students'],
    queryFn: () => api.get('/parent/students').then(r => r.data.data || []),
    enabled: user?.vaiTro === 'PARENT',
  });

  const lopId = isGiaoly ? user?.lopPhuTrach : null;

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes', lopId, selectedStudent],
    queryFn: () => api.get('/quizzes', {
      params: { lopId: lopId || undefined, studentId: selectedStudent || undefined },
    }).then(r => r.data.data),
    enabled: isGiaoly || !!selectedStudent || user?.vaiTro !== 'PARENT',
  });

  const active   = quizzes.filter(q => q.active && canTake(q));
  const upcoming = quizzes.filter(q => q.active && q.batDauTu && new Date() < new Date(q.batDauTu));
  const closed   = quizzes.filter(q => !canTake(q));

  return (
    <div className="page-container py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList size={24} className="text-red-700 dark:text-red-400" />
            Bài kiểm tra
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Các bài kiểm tra giáo lý của lớp
          </p>
        </div>
        {isGiaoly && (
          <Link to="/admin/quiz"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition shrink-0">
            <Settings size={14} /> Quản lý
          </Link>
        )}
      </div>

      {/* Phụ huynh: chọn con */}
      {user?.vaiTro === 'PARENT' && linkedStudents.length > 0 && (
        <div className="card">
          <label className="label text-sm">Chọn thiếu nhi</label>
          <select className="input max-w-64" value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}>
            <option value="">-- Chọn con --</option>
            {linkedStudents.map(s => (
              <option key={s._id} value={s._id}>{s.hoTen}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center py-16 text-gray-400 dark:text-slate-500">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có bài kiểm tra nào</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Đang mở</h2>
              {active.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} studentId={selectedStudent} canTake isGiaoly={isGiaoly} />
              ))}
            </section>
          )}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sắp tới</h2>
              {upcoming.map(quiz => <QuizCard key={quiz._id} quiz={quiz} studentId={selectedStudent} isGiaoly={isGiaoly} />)}
            </section>
          )}
          {closed.length > 0 && (
            <section className="space-y-3 opacity-60">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Đã đóng</h2>
              {closed.map(quiz => <QuizCard key={quiz._id} quiz={quiz} studentId={selectedStudent} isGiaoly={isGiaoly} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function QuizCard({ quiz, studentId, canTake: openNow, isGiaoly }) {
  const loaiCount = { trac_nghiem: 0, dien_khuyet: 0, tu_luan: 0 };
  (quiz.cauHoi || []).forEach(c => { loaiCount[c.loai] = (loaiCount[c.loai] || 0) + 1; });

  return (
    <div className="card transition-all">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center shrink-0">
          <ClipboardList size={20} className="text-red-700 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-800 dark:text-slate-100">{quiz.tieuDe}</p>
            <QuizStatusBadge quiz={quiz} />
          </div>
          {quiz.moTa && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">{quiz.moTa}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1"><Clock size={11} /> {quiz.thoiGianLam} phút</span>
            <span className="flex items-center gap-1"><BookOpen size={11} /> {quiz.cauHoi?.length || 0} câu</span>
            {loaiCount.trac_nghiem > 0 && <span className="text-blue-500">{loaiCount.trac_nghiem} TN</span>}
            {loaiCount.dien_khuyet > 0 && <span className="text-amber-500">{loaiCount.dien_khuyet} ĐK</span>}
            {loaiCount.tu_luan > 0 && <span className="text-purple-500">{loaiCount.tu_luan} TL</span>}
          </div>
          {quiz.ketThucLuc && (
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
              Hạn nộp: {fmtDate(quiz.ketThucLuc)}
            </p>
          )}
        </div>
      </div>

      {isGiaoly && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2 flex-wrap">
          <Link to={`/quiz/${quiz._id}/monitor`}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition">
            <Eye size={12} /> Giám sát
          </Link>
          <Link to={`/quiz/${quiz._id}/leaderboard`}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
            <Trophy size={12} /> Xếp hạng
          </Link>
          {(quiz.cauHoi || []).some(c => c.loai === 'tu_luan') && (
            <Link to={`/quiz/${quiz._id}/grade`}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
              <PenLine size={12} /> Chấm tự luận
            </Link>
          )}
        </div>
      )}

      {openNow && !isGiaoly && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          {studentId ? (
            <Link to={`/quiz/${quiz._id}/take?studentId=${studentId}`}
              className="btn-primary text-sm px-4 py-2 rounded-lg inline-flex items-center gap-1.5">
              <BookOpen size={14} /> Bắt đầu làm bài
            </Link>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={13} /> Vui lòng chọn thiếu nhi để bắt đầu
            </p>
          )}
        </div>
      )}
    </div>
  );
}
