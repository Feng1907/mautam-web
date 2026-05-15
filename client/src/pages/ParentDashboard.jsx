import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquareText,
  Send,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import {
  getNotificationSettingsHint,
  getPushPermissionState,
  isPushNotificationSupported,
  registerPushNotifications,
} from '../utils/pushNotifications';

const scoreTypeLabel = {
  mieng: 'Miệng',
  '15phut': '15 phút',
  '1tiet': '1 tiết',
};

const SectionCard = ({ icon: Icon, title, subtitle, children, className = '', accent = 'red', action }) => {
  const accentMap = {
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentMap[accent] || accentMap.red}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
};

const StatPill = ({ label, value, color = 'gray' }) => {
  const colorMap = {
    gray: 'border-gray-200 bg-gray-50 text-gray-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-red-200 bg-red-50 text-red-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-70">{label}</p>
    </div>
  );
};

const AttendanceChart = ({ summary }) => {
  const present = summary?.present || 0;
  const absent = summary?.absent || 0;
  const total = summary?.total || 0;
  const percentage = summary?.percentage || 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = total ? (percentage / 100) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={percentage >= 80 ? '#16a34a' : percentage >= 60 ? '#d97706' : '#dc2626'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900">{percentage}%</span>
          <span className="text-xs font-semibold text-gray-400">chuyên cần</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        <StatPill label="Tổng buổi" value={total} />
        <StatPill label="Có mặt" value={present} color="emerald" />
        <StatPill label="Vắng" value={absent} color="red" />
      </div>
    </div>
  );
};

const LatestGrades = ({ grades }) => {
  const latest = useMemo(
    () => [...grades].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [grades]
  );

  if (!latest.length) {
    return <p className="py-8 text-center text-sm text-gray-400">Chưa có điểm nào được cập nhật.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left">Loại điểm</th>
            <th className="px-4 py-3 text-center">Học kỳ</th>
            <th className="px-4 py-3 text-center">Điểm</th>
            <th className="px-4 py-3 text-right">Ngày cập nhật</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {latest.map((grade) => {
            const score = Number(grade.diem);
            const scoreColor = score >= 8 ? 'bg-emerald-50 text-emerald-700' : score >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
            return (
              <tr key={grade._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{scoreTypeLabel[grade.loaiDiem] || grade.loaiDiem}</td>
                <td className="px-4 py-3 text-center text-gray-500">HK {grade.hocKy}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex min-w-10 justify-center rounded-full px-2 py-1 text-sm font-bold ${scoreColor}`}>
                    {score.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-400">
                  {grade.createdAt ? new Date(grade.createdAt).toLocaleDateString('vi-VN') : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const RecentPosts = ({ posts }) => {
  if (!posts.length) {
    return <p className="py-8 text-center text-sm text-gray-400">Chưa có thông báo mới.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => (
        <a
          key={post._id}
          href={`/tin-tuc/${post._id}`}
          className="block rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-1">{post.tieuDe}</p>
              {post.tomTat && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{post.tomTat}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              post.loai === 'thongbaokhan' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {post.loai === 'thongbaokhan' ? 'Khẩn' : 'Mới'}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

const SemesterReport = ({ report, onExportPdf }) => {
  const grades = report?.grades || [];
  const chuyenCan = report?.chuyenCan;
  const avg = report?.gradeAverage;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-800">Báo cáo học kỳ {report?.hocKy || 1}</p>
        </div>
        {grades.length ? (
          <table className="w-full text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Loại điểm</th>
                <th className="px-4 py-3 text-center">Điểm</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((grade) => {
                const score = Number(grade.diem);
                const scoreColor = score >= 8 ? 'text-emerald-700' : score >= 5 ? 'text-amber-700' : 'text-red-700';
                return (
                  <tr key={grade._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{scoreTypeLabel[grade.loaiDiem] || grade.loaiDiem}</td>
                    <td className={`px-4 py-3 text-center font-bold ${scoreColor}`}>{score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-500">{grade.ghiChu || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Chưa có dữ liệu báo cáo học kỳ.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Nhận xét của Giáo lý viên</p>
          </div>
          <p className="text-sm leading-6 text-gray-700 italic">
            {report?.teacherComment || 'Chưa có nhận xét từ Giáo lý viên.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
            <p className="text-2xl font-black text-gray-900">{avg != null ? Number(avg).toFixed(1) : '—'}</p>
            <p className="mt-0.5 text-xs text-gray-400">Trung bình điểm</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
            <p className="text-2xl font-black text-emerald-700">{chuyenCan?.diem ?? '—'}</p>
            <p className="mt-0.5 text-xs text-emerald-600">Điểm chuyên cần</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
        >
          <Download className="h-4 w-4" />
          Tải báo cáo PDF
        </button>
      </div>
    </div>
  );
};

const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const EVENT_TYPE_STYLE = {
  class: 'bg-blue-500',
  le: 'bg-red-500',
  hoitrai: 'bg-amber-500',
  default: 'bg-violet-500',
};

const MonthCalendar = ({ events }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const classDays = useMemo(() => {
    const days = [];
    const d = new Date(today);
    d.setDate(today.getDate() + ((0 - today.getDay() + 7) % 7));
    for (let i = 0; i < 8; i++) {
      days.push({ _id: `class-${i}`, name: 'Giờ học giáo lý', date: d.toISOString().slice(0, 10), type: 'class' });
      d.setDate(d.getDate() + 7);
    }
    return days;
  }, []);

  const allEvents = useMemo(() => {
    const merged = [...events, ...classDays];
    const map = {};
    for (const ev of merged) {
      const day = ev.date?.slice(0, 10);
      if (!day) continue;
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    }
    return map;
  }, [events, classDays]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = today.toISOString().slice(0, 10);

  const selectedKey = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedEvents = selectedKey ? allEvents[selectedKey] || [] : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-bold text-gray-900">{MONTH_NAMES[month]} {year}</p>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <div key={d} className="py-1.5 text-[11px] font-bold uppercase text-gray-400">{d}</div>
          ))}
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = allEvents[key] || [];
            const isToday = key === todayStr;
            const isSelected = day === selectedDay;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${isToday ? 'bg-red-700 text-white font-bold' : ''}
                  ${isSelected && !isToday ? 'bg-blue-100 text-blue-800' : ''}
                  ${!isToday && !isSelected ? 'text-gray-800 hover:bg-gray-100' : ''}
                `}
              >
                {day}
                {dayEvents.length > 0 && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span key={i} className={`h-1 w-1 rounded-full ${EVENT_TYPE_STYLE[ev.type] || EVENT_TYPE_STYLE.default}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {selectedKey ? `Sự kiện ngày ${selectedDay}/${month + 1}` : 'Sắp tới'}
        </p>
        {(selectedKey ? selectedEvents : Object.entries(allEvents)
          .flatMap(([, evs]) => evs)
          .filter((ev) => ev.date >= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 6)
        ).map((ev) => (
          <div key={ev._id} className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_TYPE_STYLE[ev.type] || EVENT_TYPE_STYLE.default}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{ev.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(ev.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {!selectedKey && Object.entries(allEvents).flatMap(([, evs]) => evs).filter((ev) => ev.date >= todayStr).length === 0 && (
          <p className="text-sm text-gray-400">Không có sự kiện sắp tới.</p>
        )}
        {selectedKey && selectedEvents.length === 0 && (
          <p className="text-sm text-gray-400">Không có sự kiện trong ngày này.</p>
        )}
      </div>
    </div>
  );
};

const AbsenceRequestCard = ({ selectedStudent, onSubmit }) => {
  const [form, setForm] = useState({ date: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setMessage(null);
    try {
      await onSubmit(form);
      setForm({ date: '', reason: '' });
      setMessage({ ok: true, text: 'Đã gửi xin phép nghỉ đến Huynh trưởng lớp.' });
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Chưa gửi được xin phép nghỉ. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày nghỉ</label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lý do</label>
          <input
            className="input"
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
            placeholder="Nhập lý do xin nghỉ..."
            maxLength={500}
            required
          />
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !selectedStudent}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Gửi xin phép nghỉ đến Huynh trưởng
      </button>
    </form>
  );
};

const PushNotificationCard = () => {
  const [permission, setPermission] = useState(() => getPushPermissionState());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const supported = isPushNotificationSupported();
  const enabled = permission === 'granted';
  const denied = permission === 'denied';

  const handleEnable = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await registerPushNotifications();
      setPermission(getPushPermissionState());
      if (result.success) setMessage('Đã bật thông báo cho tài khoản này.');
      else if (result.reason === 'denied') setMessage(getNotificationSettingsHint());
      else if (result.reason === 'unsupported') setMessage('Trình duyệt này chưa hỗ trợ push notification.');
      else setMessage('Chưa thể bật thông báo. Vui lòng thử lại sau.');
    } catch (err) {
      setPermission(getPushPermissionState());
      setMessage(err.response?.data?.message || 'Chưa thể lưu đăng ký thông báo. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-5 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-amber-700">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-gray-900">Thông báo cho phụ huynh</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Nhận tin khẩn, điểm danh muộn và nhắc sự kiện ngay cả khi không mở trang.
            </p>
            {enabled && <p className="mt-1 text-sm font-semibold text-emerald-700">✓ Thông báo đang bật.</p>}
            {denied && <p className="mt-1 text-sm text-red-700">{getNotificationSettingsHint()}</p>}
            {message && !denied && <p className="mt-1 text-sm text-gray-700">{message}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleEnable}
          disabled={!supported || enabled || denied || saving}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {enabled ? 'Đã bật thông báo' : 'Bật thông báo'}
        </button>
      </div>
    </section>
  );
};

const ParentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState([]);
  const [semesterReport, setSemesterReport] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      setLoading(true);
      setError('');
      try {
        const [studentRes, postRes, eventRes] = await Promise.all([
          api.get('/parent/students'),
          api.get('/posts', { params: { limit: 5 } }),
          api.get('/events'),
        ]);
        if (cancelled) return;
        const list = studentRes.data.data || [];
        setStudents(list);
        setSelectedId(list[0]?._id || '');
        setPosts(postRes.data.data || []);
        setEvents(eventRes.data.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Không tải được dashboard phụ huynh');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadInitial();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const loadStudentData = async () => {
      setDetailLoading(true);
      setError('');
      try {
        const [gradeRes, attendanceRes, reportRes] = await Promise.all([
          api.get(`/parent/students/${selectedId}/grades`),
          api.get(`/parent/students/${selectedId}/attendance`),
          api.get(`/parent/students/${selectedId}/semester-report`, { params: { hocKy: 1 } }),
        ]);
        if (cancelled) return;
        setGrades(gradeRes.data.data?.grades || []);
        setAttendance(attendanceRes.data.data || null);
        setSemesterReport(reportRes.data.data || null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Không tải được dữ liệu của đoàn sinh');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    loadStudentData();
    return () => { cancelled = true; };
  }, [selectedId]);

  const selectedStudent = students.find((s) => s._id === selectedId);

  const handleAbsenceSubmit = async (payload) => {
    if (!selectedId) return null;
    return api.post(`/parent/students/${selectedId}/absence-request`, payload);
  };

  const handleExportPdf = () => {
    if (!semesterReport) return;
    const student = selectedStudent;
    const grades = semesterReport.grades || [];
    const rows = grades.map((g) => `<tr><td>${scoreTypeLabel[g.loaiDiem] || g.loaiDiem}</td><td>${Number(g.diem).toFixed(1)}</td><td>${g.ghiChu || '—'}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo cáo học kỳ</title>
      <style>body{font-family:sans-serif;padding:32px;color:#111}h1{font-size:20px;margin-bottom:4px}
      p{margin:4px 0;font-size:14px;color:#555}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f3f4f6;font-size:12px;text-transform:uppercase}
      .comment{background:#fffbeb;border:1px solid #fcd34d;padding:12px;border-radius:8px;margin-top:16px;font-style:italic}</style>
      </head><body>
      <h1>Báo cáo học kỳ ${semesterReport.hocKy || 1}</h1>
      <p>Đoàn sinh: <strong>${student?.tenThanh || ''} ${student?.hoTen || ''}</strong></p>
      <p>Lớp: ${student?.lop?.tenLop || '—'} &nbsp;|&nbsp; Trung bình: <strong>${semesterReport.gradeAverage != null ? Number(semesterReport.gradeAverage).toFixed(1) : '—'}</strong></p>
      <table><thead><tr><th>Loại điểm</th><th>Điểm</th><th>Ghi chú</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="comment"><strong>Nhận xét của Giáo lý viên:</strong><br/>${semesterReport.teacherComment || 'Chưa có nhận xét.'}</div>
      </body></html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  if (loading) {
    return (
      <main className="page-container max-w-6xl py-10">
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang tải dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="page-container max-w-6xl py-8">
      <Helmet>
        <title>Dashboard Phụ Huynh | Mâu Tâm</title>
      </Helmet>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Phụ huynh</p>
          <h1 className="mt-1 text-3xl font-black text-gray-900">Dashboard theo dõi con em</h1>
        </div>

        {students.length > 0 && (
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Chọn đoàn sinh
            <select className="input min-w-60" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.tenThanh} {s.hoTen}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <PushNotificationCard />

      {!students.length ? (
        <section className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-800">Chưa có đoàn sinh liên kết</h2>
          <p className="mt-1 text-sm text-gray-500">Vui lòng liên hệ Ban quản trị để liên kết tài khoản phụ huynh với hồ sơ con em.</p>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Hàng 1: Chuyên cần + Xin phép nghỉ */}
          <SectionCard
            icon={CalendarCheck}
            title="Chuyên cần"
            accent="emerald"
            subtitle={selectedStudent ? `${selectedStudent.tenThanh} ${selectedStudent.hoTen}${selectedStudent.lop?.tenLop ? ` · ${selectedStudent.lop.tenLop}` : ''}` : ''}
            className="lg:col-span-2"
          >
            {detailLoading && <Loader2 className="mb-3 h-4 w-4 animate-spin text-gray-400" />}
            <AttendanceChart summary={attendance?.summary} />
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {(attendance?.records || []).slice(-4).reverse().map((record) => (
                <div key={record._id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm">
                  <span className="font-medium text-gray-700">
                    {new Date(record.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${record.present ? 'text-emerald-700' : 'text-red-700'}`}>
                    {record.present ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {record.present ? 'Có mặt' : 'Vắng'}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={ClipboardList}
            title="Xin phép nghỉ"
            accent="red"
            subtitle="Gửi trực tiếp đến Huynh trưởng lớp của đoàn sinh"
          >
            <AbsenceRequestCard selectedStudent={selectedStudent} onSubmit={handleAbsenceSubmit} />
          </SectionCard>

          {/* Hàng 2: Điểm số */}
          <SectionCard
            icon={GraduationCap}
            title="Điểm số"
            accent="amber"
            subtitle="Các điểm được cập nhật gần nhất từ Giáo lý viên"
            className="lg:col-span-3"
          >
            {detailLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải điểm số...
              </div>
            ) : (
              <LatestGrades grades={grades} />
            )}
          </SectionCard>

          {/* Hàng 3: Học tập - Báo cáo học kỳ */}
          <SectionCard
            icon={FileText}
            title="Học tập"
            accent="violet"
            subtitle="Nhận xét của Giáo lý viên và báo cáo học kỳ chi tiết"
            className="lg:col-span-3"
          >
            {detailLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải báo cáo...
              </div>
            ) : (
              <SemesterReport report={semesterReport} onExportPdf={handleExportPdf} />
            )}
          </SectionCard>

          {/* Hàng 4: Lịch sự kiện + Tin tức */}
          <SectionCard
            icon={CalendarDays}
            title="Lịch sự kiện"
            accent="blue"
            subtitle="Ngày lễ đoàn, hội trại và các giờ học giáo lý sắp tới"
            className="lg:col-span-2"
          >
            <MonthCalendar events={events} />
          </SectionCard>

          <SectionCard icon={Bell} title="Tin tức" accent="blue" subtitle="Thông báo mới từ xứ đoàn">
            <RecentPosts posts={posts} />
          </SectionCard>
        </div>
      )}
    </main>
  );
};

export default ParentDashboard;
