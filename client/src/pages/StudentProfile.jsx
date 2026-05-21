import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { ChevronLeft, User, BookOpen, CalendarCheck } from 'lucide-react';
import api from '../services/api';
import { SkeletonLine } from '../components/Skeleton';

const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS  = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

const NGANH_COLOR = {
  ChienNon: '#ec4899', AuNhi: '#22c55e', ThieuNhi: '#3b82f6',
  NghiaSi:  '#eab308', HiepSi: '#f97316',
};

const AVATAR_COLORS = [
  '#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316',
];
const avatarBg = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="h-8 w-32 rounded-lg bg-gray-100" />
    <div className="rounded-2xl border border-[#e5d5b5] bg-white p-6 flex gap-5">
      <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
      <div className="flex flex-col gap-3 flex-1">
        <SkeletonLine w="w-48" h="h-6" />
        <SkeletonLine w="w-32" h="h-4" />
        <div className="flex gap-2 mt-1">
          <SkeletonLine w="w-20" h="h-6" />
          <SkeletonLine w="w-20" h="h-6" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5 h-72 bg-gray-50" />
  </div>
);

// ── Grade tooltip ─────────────────────────────────────────────────────────────
const GradeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Attendance tooltip ────────────────────────────────────────────────────────
const AttTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

// ── Build grade chart data from lichSu ───────────────────────────────────────
const buildGradeData = (lichSu) => {
  const rows = [];
  for (const nh of lichSu) {
    const label = nh.namHoc?.ten ?? '?';
    const gs = nh.grades ?? [];
    if (!gs.length) continue;
    let sum = 0, cnt = 0;
    gs.forEach(g => { if (g.diem != null) { sum += g.diem; cnt++; } });
    rows.push({ label, tb: cnt ? parseFloat((sum / cnt).toFixed(2)) : null });
  }
  return rows.reverse();
};

// ── Build attendance chart data ───────────────────────────────────────────────
const buildAttData = (lichSu) => {
  const rows = [];
  for (const nh of lichSu) {
    const label = nh.namHoc?.ten ?? '?';
    const cs = nh.chuyenCan ?? [];
    if (!cs.length) continue;
    const present = cs.filter(c => c.trangThai === 'present' || c.diemDanh === true).length;
    const rate = cs.length ? Math.round(present / cs.length * 100) : 0;
    rows.push({ label, rate });
  }
  return rows.reverse();
};

// ── Tab variants ──────────────────────────────────────────────────────────────
const tabV = {
  enter:  { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0,  transition: { duration: 0.2, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

const TABS = [
  { key: 'info',    label: 'Thông tin', Icon: User          },
  { key: 'grades',  label: 'Điểm',      Icon: BookOpen      },
  { key: 'attend',  label: 'Chuyên cần',Icon: CalendarCheck  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const StudentProfile = () => {
  const { lopId, id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');

  const [studentQ, lichSuQ] = useQueries({
    queries: [
      {
        queryKey: ['student', id],
        queryFn:  () => api.get(`/students/${lopId}/${id}`).then(r => r.data.data),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['student-lichsu', id],
        queryFn:  () => api.get(`/students/${lopId}/${id}/lich-su`).then(r => r.data.data),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
    ],
  });

  const student = studentQ.data;
  const lichSu  = lichSuQ.data ?? [];
  const loading = studentQ.isLoading;

  const gradeData = buildGradeData(lichSu);
  const attData   = buildAttData(lichSu);

  const nganh = student?.lop?.nhanh;
  const accentColor = NGANH_COLOR[nganh] ?? '#8B0000';

  if (loading) return <main className="flex-1 page-container max-w-3xl"><Skeleton /></main>;

  if (!student) return (
    <main className="flex-1 page-container max-w-3xl">
      <p className="text-center text-red-600 py-20">Không tìm thấy đoàn sinh.</p>
    </main>
  );

  const birthDate = student.ngaySinh
    ? new Date(student.ngaySinh).toLocaleDateString('vi-VN')
    : '—';

  const tenDay = [student.tenThanh, student.hoTen].filter(Boolean).join(' ');

  return (
    <main className="flex-1 page-container max-w-3xl" style={{ fontFamily: SANS }}>

      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline mb-5"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-[#e5d5b5] bg-white shadow-sm overflow-hidden mb-4">
        <div className="h-1.5" style={{ background: accentColor }} />
        <div className="px-6 py-5 flex gap-5 items-start flex-wrap">
          {/* Avatar */}
          {student.avatar ? (
            <img src={student.avatar} alt={student.hoTen}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md shrink-0 flex items-center justify-center text-white text-2xl font-black select-none"
              style={{ background: avatarBg(student.hoTen) }}>
              {student.hoTen?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#3d1515] leading-tight" style={{ fontFamily: SERIF }}>
              {tenDay}
            </h1>
            {student.lop && (
              <p className="text-sm text-gray-500 mt-1">
                {student.lop.tenLop}
                {nganh && <span className="ml-2 text-xs font-semibold" style={{ color: accentColor }}>{nganh}</span>}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                student.gioiTinh === 'Nam'
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-pink-50 border-pink-200 text-pink-700'
              }`}>
                {student.gioiTinh}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 bg-gray-50 text-gray-600">
                Sinh {birthDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-[#e5d5b5] mb-4 relative">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === key
                ? 'border-[#8B0000] text-[#8B0000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} variants={tabV} initial="enter" animate="center" exit="exit">

          {/* ── Thông tin ── */}
          {tab === 'info' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard label="Họ tên" value={student.hoTen} />
              <InfoCard label="Tên thánh" value={student.tenThanh || '—'} />
              <InfoCard label="Giới tính" value={student.gioiTinh} />
              <InfoCard label="Ngày sinh" value={birthDate} />
              {student.phuHuynh?.hoTen && (
                <InfoCard label="Phụ huynh" value={student.phuHuynh.hoTen} />
              )}
              {student.phuHuynh?.soDienThoai && (
                <InfoCard label="SĐT phụ huynh" value={student.phuHuynh.soDienThoai} />
              )}
              {student.phuHuynh?.email && (
                <InfoCard label="Email phụ huynh" value={student.phuHuynh.email} />
              )}
              {student.lop && (
                <InfoCard label="Lớp" value={student.lop.tenLop} />
              )}
            </div>
          )}

          {/* ── Điểm ── */}
          {tab === 'grades' && (
            lichSuQ.isLoading ? (
              <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ) : gradeData.length === 0 ? (
              <EmptyState text="Chưa có dữ liệu điểm" />
            ) : (
              <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5">
                <p className="text-sm font-semibold text-[#3d1515] mb-4" style={{ fontFamily: SERIF }}>
                  Điểm trung bình theo năm học
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gradeData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip content={<GradeTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="tb" name="Điểm TB"
                        stroke="#8B0000" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Per-year detail */}
                <div className="mt-5 flex flex-col gap-2">
                  {lichSu.map(nh => {
                    const gs = nh.grades ?? [];
                    if (!gs.length) return null;
                    const avg = gs.reduce((s, g) => s + (g.diem ?? 0), 0) / gs.length;
                    return (
                      <div key={nh.namHoc._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700">{nh.namHoc.ten}</p>
                        <span className="text-sm font-bold" style={{ color: '#8B0000' }}>
                          {avg.toFixed(1)} / 10
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── Chuyên cần ── */}
          {tab === 'attend' && (
            lichSuQ.isLoading ? (
              <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ) : attData.length === 0 ? (
              <EmptyState text="Chưa có dữ liệu chuyên cần" />
            ) : (
              <div className="rounded-2xl border border-[#e5d5b5] bg-white p-5">
                <p className="text-sm font-semibold text-[#3d1515] mb-4" style={{ fontFamily: SERIF }}>
                  Tỉ lệ chuyên cần theo năm học (%)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1e7d5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af"
                        tickFormatter={v => `${v}%`} />
                      <Tooltip content={<AttTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="rate" name="Có mặt" fill="#8B0000" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  {lichSu.map(nh => {
                    const cs = nh.chuyenCan ?? [];
                    if (!cs.length) return null;
                    const present = cs.filter(c => c.trangThai === 'present' || c.diemDanh === true).length;
                    const rate = cs.length ? Math.round(present / cs.length * 100) : 0;
                    return (
                      <div key={nh.namHoc._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700">{nh.namHoc.ten}</p>
                        <span className={`text-sm font-bold ${rate >= 75 ? 'text-emerald-700' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {present}/{cs.length} ({rate}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

        </motion.div>
      </AnimatePresence>

    </main>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const InfoCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#e5d5b5] bg-[#fffcf9]">
    <div className="text-3xl text-[#D4AF37] mb-3">✦</div>
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export default StudentProfile;
