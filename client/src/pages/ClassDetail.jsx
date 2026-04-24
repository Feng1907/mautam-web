import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentList    from '../components/StudentList';
import AttendanceTable from '../components/AttendanceTable';
import GradeForm      from '../components/GradeForm';

const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', cls: 'bg-pink-100   text-pink-700'   },
  AuNhi:    { label: 'Ấu Nhi',    cls: 'bg-green-100  text-green-700'  },
  ThieuNhi: { label: 'Thiếu Nhi', cls: 'bg-blue-100   text-blue-700'   },
  NghiaSi:  { label: 'Nghĩa Sĩ',  cls: 'bg-yellow-100 text-yellow-700' },
  HiepSi:   { label: 'Hiệp Sĩ',   cls: 'bg-amber-100  text-amber-800'  },
};

const TABS = [
  { key: 'danhsach',  label: '👥 Danh sách'  },
  { key: 'diemdanh', label: '✅ Điểm danh'   },
  { key: 'bangdiem', label: '📝 Bảng điểm'   },
];

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab,      setTab]      = useState('danhsach');
  const [lop,      setLop]      = useState(null);
  const [students, setStudents] = useState([]);   // state để StudentList cập nhật realtime
  const [loading,  setLoading]  = useState(true);

  // Admin hoặc giaoly được phân công lớp này
  const canEdit =
    user?.vaiTro === 'admin' ||
    (user?.vaiTro === 'giaoly' &&
      user?.lopPhuTrach?.some(l => (l._id || l).toString() === id));

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
    <main className="flex-1 page-container">
      <Link to="/lop-hoc" className="text-sm text-red-700 hover:underline mb-4 inline-block">
        ← Danh sách lớp
      </Link>

      {/* ── Header lớp ── */}
      <div className="card mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {nganh && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${nganh.cls}`}>
                  {nganh.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{lop.tenLop}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sĩ số:&nbsp;<strong className="text-gray-700">{students.length}</strong>&nbsp;đoàn sinh
              {lop.namHoc && (
                <>&nbsp;·&nbsp;Năm học:&nbsp;<strong className="text-gray-700">{lop.namHoc.ten}</strong></>
              )}
            </p>
          </div>

          {/* Phụ trách */}
          <div className="text-sm text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-xs text-gray-400">Huynh trưởng:</span>
              {lop.huynhTruong
                ? <span className="font-semibold text-gray-800">{lop.huynhTruong.hoTen}</span>
                : <span className="italic text-gray-300 text-xs">Chưa phân công</span>}
            </div>
            {lop.duTruong?.length > 0 && (
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-gray-400">Dự trưởng:</span>
                <span className="font-semibold text-gray-800">
                  {lop.duTruong.map(d => d.hoTen).join(', ')}
                </span>
              </div>
            )}
            {canEdit && (
              <span className="inline-block mt-1.5 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                ✓ Bạn có quyền quản lý lớp này
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0 mb-5 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {t.label}
            {t.key === 'danhsach' && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">
                {students.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Nội dung tab ── */}
      {tab === 'danhsach' && (
        <StudentList
          lopId={id}
          students={students}
          setStudents={setStudents}
          canEdit={canEdit}
        />
      )}
      {tab === 'diemdanh' && (
        <AttendanceTable lopId={id} students={students} canEdit={canEdit} />
      )}
      {tab === 'bangdiem' && (
        <GradeForm lopId={id} students={students} canEdit={canEdit} />
      )}
    </main>
  );
};

export default ClassDetail;
