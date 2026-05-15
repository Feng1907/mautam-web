import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CalendarCheck, BookOpen, ChevronLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { formatClassName } from '../utils/formatClassName';
import { useAuth } from '../store/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentList    from '../components/StudentList';
import AttendanceTable from '../components/AttendanceTable';
import GradeForm      from '../components/GradeForm';
import QrAttendanceGenerator from '../components/QrAttendanceGenerator';

const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', cls: 'bg-pink-100   text-pink-700   border-pink-200'   },
  AuNhi:    { label: 'Ấu Nhi',    cls: 'bg-green-100  text-green-700  border-green-200'  },
  ThieuNhi: { label: 'Thiếu Nhi', cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  NghiaSi:  { label: 'Nghĩa Sĩ',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  HiepSi:   { label: 'Hiệp Sĩ',   cls: 'bg-amber-100  text-amber-800  border-amber-200'  },
};

const TABS = [
  { key: 'danhsach',  label: 'Danh sách',  Icon: Users         },
  { key: 'diemdanh', label: 'Điểm danh',  Icon: CalendarCheck  },
  { key: 'bangdiem', label: 'Bảng điểm',  Icon: BookOpen       },
];

// ── Hiệu ứng fade + slide khi chuyển tab ─────────────────────────────────────
const tabVariants = {
  enter:  { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
};

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab,      setTab]      = useState('danhsach');
  const [lop,      setLop]      = useState(null);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Admin hoặc bất kỳ ai được phân công lớp này (HT hoặc DT đều ngang quyền)
  const canEdit =
    user?.vaiTro === 'admin' ||
    user?.lopPhuTrach?.some(l => (l._id || l).toString() === id);

  useEffect(() => {
    Promise.all([
      api.get(`/classes/${id}`),
      api.get(`/students/${id}`),
    ]).then(([lopRes, svRes]) => {
      setLop(lopRes.data.data);
      setStudents(svRes.data.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!lop)    return <p className="text-center text-red-600 py-16">Không tìm thấy lớp.</p>;

  const nganh = NGANH_CFG[lop.nhanh];

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
      <div
        className="rounded-2xl border border-[#e5d5b5] shadow-sm mb-3 overflow-hidden"
        style={{ background: '#fffcf9' }}
      >
        {/* Dải đỏ đô trên cùng */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #8B0000, #D4AF37, #8B0000)' }} />

        <div className="px-6 py-5 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D4AF37] text-base">✝</span>
              {nganh && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${nganh.cls}`}>
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
            <p className="text-sm text-gray-500 mt-1.5">
              {(() => {
                const soNam = students.filter(s => s.gioiTinh === 'Nam').length;
                const soNu  = students.filter(s => s.gioiTinh === 'Nu').length;
                return (
                  <>
                    Sĩ số:&nbsp;<strong className="text-[#5a1a1a]">{students.length}</strong>&nbsp;đoàn sinh
                    {students.length > 0 && (
                      <span className="text-gray-400">
                        &nbsp;(
                        <span className="font-semibold text-sky-600">{soNam}&nbsp;Nam</span>
                        &nbsp;–&nbsp;
                        <span className="font-semibold text-pink-500">{soNu}&nbsp;Nữ</span>
                        )
                      </span>
                    )}
                    {lop.namHoc && (
                      <>&nbsp;·&nbsp;Năm học:&nbsp;<strong className="text-[#5a1a1a]">{lop.namHoc.ten}</strong></>
                    )}
                  </>
                );
              })()}
            </p>
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
                {user?.chucVu === 'dutruong' ? 'Dự Trưởng — Toàn quyền lớp này' : 'Bạn có quyền quản lý lớp này'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-2xl border border-[#e5d5b5]"
        style={{ background: '#fffcf9' }}
      >
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#5a1a1a] hover:bg-amber-50/60'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #8B0000 0%, #6e1a1a 100%)' } : {}}
            >
              <t.Icon className="w-4 h-4 shrink-0" />
              {t.label}
              {t.key === 'danhsach' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {students.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content với Framer Motion ── */}
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
                    <QrAttendanceGenerator
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
