import { useEffect, useState } from 'react';
import api from '../../services/api';
import ExportButton from '../../components/ExportButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const NGANH_LABEL = {
  ChienNon: 'Chiên Non', AuNhi: 'Ấu Nhi', ThieuNhi: 'Thiếu Nhi',
  NghiaSi: 'Nghĩa Sĩ', HiepSi: 'Hiệp Sĩ',
};

const AdminExport = () => {
  const [classes,  setClasses]  = useState([]);
  const [namHoc,   setNamHoc]   = useState(null);
  const [hocKy,    setHocKy]    = useState(1);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/namhoc')])
      .then(([cls, nh]) => {
        setClasses(cls.data.data);
        const active = nh.data.data.find(n => n.dangHoatDong) || nh.data.data[0];
        setNamHoc(active || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const byNganh = classes.reduce((acc, l) => {
    (acc[l.nhanh] = acc[l.nhanh] || []).push(l); return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Export Excel</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Học kỳ:</label>
          <div className="flex gap-1">
            {[1, 2].map(hk => (
              <button key={hk} onClick={() => setHocKy(hk)}
                className={`px-3 py-1 text-sm font-semibold rounded-full border transition ${
                  hocKy === hk ? 'bg-red-700 text-white border-red-700' : 'text-gray-600 border-gray-300'
                }`}>
                HK {hk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!namHoc && (
        <p className="text-amber-600 bg-amber-50 rounded px-4 py-3 text-sm border border-amber-200">
          Chưa có năm học nào đang hoạt động. Vui lòng kích hoạt năm học trước.
        </p>
      )}

      {namHoc && (
        <>
          <p className="text-sm text-gray-500 mb-5">
            Năm học: <strong className="text-gray-700">{namHoc.ten}</strong>
          </p>

          <div className="flex flex-col gap-6">
            {Object.entries(byNganh).map(([nhanh, lops]) => (
              <section key={nhanh}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  {NGANH_LABEL[nhanh]}
                </h3>
                <div className="flex flex-col gap-2">
                  {lops.map(lop => (
                    <div key={lop._id} className="card flex items-center justify-between gap-4 flex-wrap py-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{lop.tenLop}</p>
                        <p className="text-xs text-gray-400">
                          HT: {lop.huynhTruong?.hoTen || '—'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <ExportButton
                          url={`/api/export/attendance/${lop._id}?namHocId=${namHoc._id}`}
                          fileName={`ChuyenCan_${lop.tenLop.replace(/\s/g, '_')}_${namHoc.ten}.xlsx`}
                          label="Chuyên cần"
                        />
                        <ExportButton
                          url={`/api/export/grades/${lop._id}?namHocId=${namHoc._id}&hocKy=${hocKy}`}
                          fileName={`BangDiem_${lop.tenLop.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.ten}.xlsx`}
                          label="Bảng điểm"
                          variant="primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {classes.length === 0 && (
              <p className="text-center text-gray-400 py-12">Chưa có lớp nào.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminExport;
