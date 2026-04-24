import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const NGANH_COLOR = {
  ChienNon:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  AuNhi:     'bg-blue-100   text-blue-700   border-blue-200',
  ThieuNhi:  'bg-green-100  text-green-700  border-green-200',
  NghiaSi:   'bg-red-100    text-red-700    border-red-200',
  HiepSi:    'bg-purple-100 text-purple-700 border-purple-200',
};

const NGANH_LABEL = {
  ChienNon: 'Chiên Non', AuNhi: 'Ấu Nhi', ThieuNhi: 'Thiếu Nhi',
  NghiaSi: 'Nghĩa Sĩ', HiepSi: 'Hiệp Sĩ',
};

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Gom nhóm theo ngành
  const byNganh = classes.reduce((acc, lop) => {
    (acc[lop.nhanh] = acc[lop.nhanh] || []).push(lop);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <main className="flex-1 page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh Sách Lớp</h1>

      <div className="flex flex-col gap-8">
        {Object.entries(byNganh).map(([nhanh, lops]) => (
          <section key={nhanh}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {NGANH_LABEL[nhanh]}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lops.map(lop => (
                <Link
                  key={lop._id}
                  to={`/lop-hoc/${lop._id}`}
                  className="card hover:shadow-md transition group border-l-4"
                  style={{ borderLeftColor: 'currentColor' }}
                >
                  <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mb-2 ${NGANH_COLOR[lop.nhanh]}`}>
                    {NGANH_LABEL[lop.nhanh]}
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">
                    {lop.tenLop}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    HT: {lop.huynhTruong?.hoTen || <span className="italic text-gray-300">Chưa phân công</span>}
                  </p>
                  {lop.duTruong?.length > 0 && (
                    <p className="text-xs text-gray-400">
                      DT: {lop.duTruong.map(d => d.hoTen).join(', ')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {classes.length === 0 && (
          <p className="text-center text-gray-400 py-12">Chưa có lớp nào được tạo.</p>
        )}
      </div>
    </main>
  );
};

export default ClassList;
