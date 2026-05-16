import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { Users, CalendarCheck, BookOpen, ChevronLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { formatClassName } from '../utils/formatClassName';
import { useAuth } from '../store/AuthContext';
import StudentList         from '../components/StudentList';
import AttendanceTable     from '../components/AttendanceTable';
import GradeForm           from '../components/GradeForm';
import QrAttendanceGenerator from '../components/QrAttendanceGenerator';
import ErrorBoundary       from '../components/ErrorBoundary';

// ── Ngành config (label + pill + accent for header/tabs) ─────────────────────
const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', icon: '🕊️', accent: '#ec4899', pill: 'bg-pink-50 border-pink-200 text-pink-700'    },
  AuNhi:    { label: 'Ấu Nhi',    icon: '🌿', accent: '#22c55e', pill: 'bg-green-50 border-green-200 text-green-700'  },
  ThieuNhi: { label: 'Thiếu Nhi', icon: '⭐', accent: '#3b82f6', pill: 'bg-blue-50 border-blue-200 text-blue-700'    },
  NghiaSi:  { label: 'Nghĩa Sĩ',  icon: '🛡️', accent: '#eab308', pill: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  HiepSi:   { label: 'Hiệp Sĩ',   icon: '⚔️', accent: '#f97316', pill: 'bg-orange-50 border-orange-200 text-orange-700' },
};

const TABS = [
  { key: 'danhsach',  label: 'Danh sách', Icon: Users         },
  { key: 'diemdanh', label: 'Điểm danh', Icon: CalendarCheck  },
  { key: 'bangdiem', label: 'Bảng điểm', Icon: BookOpen       },
];

const tabVariants = {
  enter:  { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn'  } },
};

// ── Skeleton header ───────────────────────────────────────────────────────────
const SkeletonHeader = () => (
  <div className="rounded-2xl border border-[#e5d5b5] shadow-sm mb-3 overflow-hidden animate-pulse"
    style={{ background: '#fffcf9' }}>
    <div className="h-1.5 bg-gray-200" />
    <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="flex gap-2">
          <div className="h-5 w-5 rounded-full bg-gray-100" />
          <div className="h-5 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="h-7 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-64 rounded-full bg-gray-100" />
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="h-4 w-32 rounded-full bg-gray-100" />
        <div className="h-4 w-24 rounded-full bg-gray-100" />
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ClassDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState('danhsach');

  // 1. useQueries — parallel fetch, retry:3 on cold start
  const [lopQuery, studentsQuery] = useQueries({
    queries: [
      {
        queryKey: ['class', id],
        queryFn:  () => api.get(`/classes/${id}`).then(r => r.data.data),
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: ['students', id],
        queryFn:  () => api.get(`/students/${id}`).then(r => r.data.data),
        staleTime: 2 * 60 * 1000,
        retry: 3,
      },
    ],
  });

  const lop     = lopQuery.data ?? null;
  const loading = lopQuery.isLoading || studentsQuery.isLoading;

  // Local students state — syncs from query but allows optimistic updates by StudentList
  const [students, setStudents] = useState([]);
  useEffect(() => {
    if (studentsQuery.data) setStudents(studentsQuery.data);
  }, [studentsQuery.data]);

  const canEdit =
    user?.vaiTro === 'admin' ||
    user?.lopPhuTrach?.some(l => (l._id || l).toString() === id);

  // 2. Ngành accent — fallback to dark red if unknown
  const nganh      = lop ? (NGANH_CFG[lop.nhanh] ?? null) : null;
  const accentColor = nganh?.accent ?? '#8B0000';

  const soNam = students.filter(s => s.gioiTinh === 'Nam').length;
  const soNu  = students.filter(s => s.gioiTinh === 'Nu').length;

  return (
    <main className="flex-1 page-container" style={{ background: '#fdfbf7' }}>

      {/* Breadcrumb */}
      <Link
        to="/lop-hoc"
        className="inline-flex items-center gap-1.5 text-sm text-[#8B0000] hover:underline mb-5"
      >
        <ChevronLeft className="w-4 h-4" />
        Danh sách lớp
      </Link>

      {/* ── Header card ── */}
      {loading ? <SkeletonHeader /> : !lop ? (
        <p className="text-center text-red-600 py-16">Không tìm thấy lớp.</p>
      ) : (
        <div className="rounded-2xl border border-[#e5d5b5] shadow-sm mb-3 overflow-hidden"
          style={{ background: '#fffcf9' }}>

          {/* Dải màu ngành — thay vì luôn đỏ đô */}
          <div className="h-1.5" style={{ background: accentColor }} />

          <div className="px-6 py-5 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {nganh && (
                  <span className="text-base leading-none select-none">{nganh.icon}</span>
                )}
                {nganh && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${nganh.pill}`}>
                    {nganh.label}
                  </span>
                )}
              </div>
              <h1
                className="text-2xl font-bold text-[#3d1515] leading-tight"
                style={{ fontFamily: '"Be Vietnam Pro", "Inter", system-ui, sans-serif' }}
              >
                {formatClassName(lop.tenLop)}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">
                  Sĩ số:&nbsp;<strong className="text-[#5a1a1a]">{students.length}</strong>&nbsp;đoàn sinh
                </span>
                {students.length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                      {soNam} Nam
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600">
                      {soNu} Nữ
                    </span>
                  </>
                )}
                {lop.namHoc && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      Năm học: <strong className="text-[#5a1a1a]">{lop.namHoc.ten}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-sm text-right flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Huynh trưởng:</span>
                {lop.huynhTruong
                  ? <span className="font-semibold text-[#3d1515]">{lop.huynhTruong.hoTen}</span>
                  : <span className="italic text-gray-300 text-xs">Chưa phân công</span>}
              </div>
              {lop.duTruong?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Dự trưởng:</span>
                  <span className="font-semibold text-[#3d1515]">
                    {lop.duTruong.map(d => d.hoTen).join(', ')}
                  </span>
                </div>
              )}
              {canEdit && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.chucVu === 'dutruong' ? 'Dự Trưởng — Toàn quyền' : 'Bạn có quyền quản lý'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar với motion indicator ── */}
      <div
        className="relative flex gap-1 mb-4 p-1 rounded-2xl border border-[#e5d5b5]"
        style={{ background: '#fffcf9' }}
      >
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors z-10"
              style={{ color: active ? 'white' : '#6b7280' }}
            >
              {/* Motion background pill */}
              {active && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: accentColor }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <t.Icon className="w-4 h-4 shrink-0" />
                {t.label}
                {t.key === 'danhsach' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                    active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {students.length}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {tab === 'danhsach' && (
            <StudentList
              lopId={id}
              students={students}
              setStudents={setStudents}
              canEdit={canEdit}
            />
          )}
          {tab === 'diemdanh' && (
            <div className="space-y-3">
              {canEdit && (
                <div className="flex justify-end">
                  <ErrorBoundary module title="QR điểm danh lỗi" description="Không thể tải module QR. Các tính năng khác vẫn hoạt động bình thường.">
                    {/* 4. Truyền classes=[lop] để dropdown QR hiện đúng tên lớp */}
                    <QrAttendanceGenerator
                      classes={lop ? [lop] : []}
                      defaultLopId={id}
                      defaultLopName={lop?.tenLop}
                      defaultDate={new Date().toISOString().slice(0, 10)}
                    />
                  </ErrorBoundary>
                </div>
              )}
              <ErrorBoundary module title="Bảng điểm danh lỗi" description="Không thể hiển thị bảng điểm danh. Vui lòng tải lại.">
                <AttendanceTable lopId={id} students={students} canEdit={canEdit} />
              </ErrorBoundary>
            </div>
          )}
          {tab === 'bangdiem' && (
            <ErrorBoundary module title="Bảng điểm lỗi" description="Không thể hiển thị bảng điểm. Vui lòng tải lại.">
              <GradeForm lopId={id} students={students} canEdit={canEdit} />
            </ErrorBoundary>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default ClassDetail;
