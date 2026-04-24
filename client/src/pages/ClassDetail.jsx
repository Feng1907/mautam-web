import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AttendanceTable from '../components/AttendanceTable';
import GradeForm from '../components/GradeForm';

const TABS = [
  { key: 'danhsach',  label: '👥 Danh sách' },
  { key: 'diemdanh', label: '✅ Điểm danh' },
  { key: 'bangdiem', label: '📝 Bảng điểm' },
];

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab, setTab]         = useState('danhsach');
  const [lop, setLop]         = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit =
    user?.vaiTro === 'admin' ||
    (user?.vaiTro === 'giaoly' && user?.lopPhuTrach?.some(l =>
      (l._id || l).toString() === id
    ));

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

  return (
    <main className="flex-1 page-container">
      <Link to="/lop-hoc" className="text-sm text-red-700 hover:underline mb-4 inline-block">
        ← Danh sách lớp
      </Link>

      {/* Header lớp */}
      <div className="card mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{lop.tenLop}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Sĩ số: <strong>{students.length}</strong> đoàn sinh
              {lop.namHoc && <> &nbsp;·&nbsp; Năm học: <strong>{lop.namHoc.ten}</strong></>}
            </p>
          </div>
          <div className="text-sm text-gray-600 text-right">
            <p>HT: <span className="font-medium">{lop.huynhTruong?.hoTen || '—'}</span></p>
            {lop.duTruong?.length > 0 && (
              <p>DT: <span className="font-medium">{lop.duTruong.map(d => d.hoTen).join(', ')}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Danh sách */}
      {tab === 'danhsach' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Tên Thánh</th>
                <th className="pb-2 pr-4 font-medium">Họ tên</th>
                <th className="pb-2 pr-4 font-medium">Ngày sinh</th>
                <th className="pb-2 font-medium">Giới tính</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 text-blue-700 font-medium">{s.tenThanh}</td>
                  <td className="py-2 pr-4 font-medium text-gray-800">{s.hoTen}</td>
                  <td className="py-2 pr-4 text-gray-500">
                    {new Date(s.ngaySinh).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-2 text-gray-500">{s.gioiTinh}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Chưa có đoàn sinh.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Điểm danh */}
      {tab === 'diemdanh' && (
        <AttendanceTable lopId={id} students={students} canEdit={canEdit} />
      )}

      {/* Tab: Bảng điểm */}
      {tab === 'bangdiem' && (
        <GradeForm lopId={id} students={students} canEdit={canEdit} />
      )}
    </main>
  );
};

export default ClassDetail;
