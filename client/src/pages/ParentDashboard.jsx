import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  MessageSquareText,
  Search,
  Send,

  X,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Ngày nghỉ */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
          <CalendarCheck className="h-3.5 w-3.5 text-red-400" />
          Ngày nghỉ
        </label>
        <input
          type="date"
          className="input"
          value={form.date}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          required
        />
      </div>

      {/* Lý do */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
          <ClipboardList className="h-3.5 w-3.5 text-red-400" />
          Lý do xin nghỉ
        </label>
        <textarea
          className="input resize-none leading-relaxed"
          rows={4}
          value={form.reason}
          onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          placeholder="Mô tả lý do xin nghỉ học buổi này..."
          maxLength={500}
          required
        />
        <p className="text-right text-[11px] text-gray-400">{form.reason.length}/500</p>
      </div>

      {/* Thông báo kết quả */}
      {message && (
        <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
          message.ok
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.ok
            ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          {message.text}
        </div>
      )}

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={saving || !selectedStudent}
        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition
          bg-linear-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700
          disabled:cursor-not-allowed disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {saving ? 'Đang gửi...' : 'Gửi xin phép nghỉ đến Huynh trưởng'}
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

const QUAN_HE_OPTIONS = ['Cha/Mẹ', 'Cha', 'Mẹ', 'Ông/Bà', 'Anh/Chị', 'Người giám hộ'];

const STATUS_CFG = {
  pending:  { label: 'Chờ duyệt',      cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  active:   { label: 'Đã liên kết',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Bị từ chối',      cls: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle },
  inactive: { label: 'Vô hiệu',         cls: 'bg-gray-100 text-gray-500 border-gray-200',     icon: XCircle },
};

const LinkRequestSection = ({ onLinked: _onLinked }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quanHe, setQuanHe]     = useState('Cha/Mẹ');
  const [sending, setSending]   = useState(false);
  const [message, setMessage]   = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const debounce = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    api.get('/parent/link-requests').then(r => setMyRequests(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (selected) setSelected(null);
    clearTimeout(debounce.current);
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/parent/search-students', { params: { q } });
        setResults(res.data.data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const handleSelect = (s) => {
    setSelected(s);
    setQuery(`${s.tenThanh} ${s.hoTen}`);
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSending(true);
    setMessage(null);
    try {
      await api.post('/parent/link-request', { studentId: selected._id, quanHe });
      setMessage({ ok: true, text: 'Đã gửi yêu cầu liên kết. Admin sẽ duyệt trong thời gian sớm nhất.' });
      setSelected(null);
      setQuery('');
      const res = await api.get('/parent/link-requests');
      setMyRequests(res.data.data || []);
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Form gửi yêu cầu */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700">
            <Link2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-gray-900">Liên kết đoàn sinh</h2>
            <p className="text-xs text-gray-500">Tìm con em và gửi yêu cầu cho Admin duyệt</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Tên đoàn sinh</label>
            <div ref={wrapRef} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9! pr-8!"
                placeholder="Nhập tên thánh hoặc họ tên (ít nhất 2 ký tự)..."
                value={query}
                onChange={handleSearch}
                readOnly={!!selected}
              />
              {(query || selected) && (
                <button type="button" onClick={() => { setSelected(null); setQuery(''); setResults([]); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {open && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  {searching && <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Đang tìm...</div>}
                  {!searching && results.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">Không tìm thấy kết quả.</p>}
                  {results.map((s) => (
                    <button key={s._id} type="button" onMouseDown={() => handleSelect(s)}
                      className="w-full border-b border-gray-50 px-4 py-2.5 text-left text-sm hover:bg-gray-50 last:border-0">
                      <span className="font-medium text-gray-900">{s.tenThanh} {s.hoTen}</span>
                      {s.tenLop && <span className="ml-2 text-xs text-gray-400">— {s.tenLop}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selected?.tenLop && <p className="text-xs text-gray-400 pl-1">Lớp: {selected.tenLop}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Quan hệ</label>
            <select className="input" value={quanHe} onChange={(e) => setQuanHe(e.target.value)}>
              {QUAN_HE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {message && (
            <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${message.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.ok ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              {message.text}
            </div>
          )}

          <button type="submit" disabled={!selected || sending}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-700 to-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:from-red-800 hover:to-red-700 disabled:cursor-not-allowed disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Đang gửi...' : 'Gửi yêu cầu liên kết'}
          </button>
        </form>
      </section>

      {/* Danh sách yêu cầu đã gửi */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-gray-900">Yêu cầu đã gửi</h2>
            <p className="text-xs text-gray-500">Trạng thái các yêu cầu liên kết của bạn</p>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Chưa có yêu cầu nào được gửi.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myRequests.map((req) => {
              const cfg = STATUS_CFG[req.trangThai] || STATUS_CFG.pending;
              const Icon = cfg.icon;
              return (
                <div key={req._id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-amber-600 font-medium">{req.student?.tenThanh}</p>
                    <p className="font-semibold text-gray-900">{req.student?.hoTen}</p>
                    {req.student?.lop?.tenLop && <p className="text-xs text-gray-400">Lớp: {req.student.lop.tenLop}</p>}
                    {req.trangThai === 'rejected' && req.rejectedReason && (
                      <p className="mt-1 text-xs text-red-600">Lý do: {req.rejectedReason}</p>
                    )}
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${cfg.cls}`}>
                    <Icon className="h-3 w-3" />{cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const ParentDashboard = () => {
  const [selectedId, setSelectedId] = useState('');

  // ── Query 1: dữ liệu khởi tạo — students, posts, events ──────────────────
  const [studentsQ, postsQ, eventsQ] = useQueries({
    queries: [
      {
        queryKey: ['parentStudents'],
        queryFn: () => api.get('/parent/students').then(r => r.data.data || []),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['posts', 'dashboard'],
        queryFn: () => api.get('/posts', { params: { limit: 5 } }).then(r => r.data.data || []),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['events'],
        queryFn: () => api.get('/events').then(r => r.data.data || []),
        staleTime: 10 * 60 * 1000,
        retry: 3,
      },
    ],
  });

  const students = Array.isArray(studentsQ.data) ? studentsQ.data : [];
  const posts    = Array.isArray(postsQ.data)    ? postsQ.data    : [];
  const events   = Array.isArray(eventsQ.data)   ? eventsQ.data   : [];
  const loading  = studentsQ.isLoading || postsQ.isLoading || eventsQ.isLoading;
  const error    = studentsQ.error?.message || postsQ.error?.message || eventsQ.error?.message || '';

  // Auto-select đoàn sinh đầu tiên khi students load xong
  useEffect(() => {
    if (students.length && !selectedId) setSelectedId(students[0]._id);
  }, [students, selectedId]);

  // ── Query 2: chi tiết đoàn sinh — grades, attendance, semester report ─────
  const [gradesQ, attendanceQ, reportQ] = useQueries({
    queries: [
      {
        queryKey: ['studentGrades', selectedId],
        queryFn: () => api.get(`/parent/students/${selectedId}/grades`).then(r => r.data.data?.grades || []),
        enabled: !!selectedId,
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['studentAttendance', selectedId],
        queryFn: () => api.get(`/parent/students/${selectedId}/attendance`).then(r => r.data.data || null),
        enabled: !!selectedId,
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['studentSemesterReport', selectedId],
        queryFn: () => api.get(`/parent/students/${selectedId}/semester-report`, { params: { hocKy: 1 } }).then(r => r.data.data || null),
        enabled: !!selectedId,
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
    ],
  });

  const grades        = gradesQ.data        || [];
  const attendance    = attendanceQ.data    || null;
  const semesterReport = reportQ.data       || null;
  const detailLoading = gradesQ.isLoading   || attendanceQ.isLoading || reportQ.isLoading;

  const selectedStudent = students.find((s) => s._id === selectedId);

  const handleAbsenceSubmit = async (payload) => {
    if (!selectedId) return null;
    return api.post(`/parent/students/${selectedId}/absence-request`, payload);
  };

  const handleExportPdf = () => {
    if (!semesterReport) return;
    const student = selectedStudent;
    const grades = Array.isArray(semesterReport?.grades) ? semesterReport.grades : [];
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
        <LinkRequestSection />
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
