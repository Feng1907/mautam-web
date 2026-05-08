import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import api from '../../services/api';
import { formatClassName } from '../../utils/formatClassName';
import ExportButton from '../../components/ExportButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];
const NGANH_LABEL = {
  ChienNon: 'Chiên Non', AuNhi: 'Ấu Nhi', ThieuNhi: 'Thiếu Nhi',
  NghiaSi: 'Nghĩa Sĩ',  HiepSi: 'Hiệp Sĩ',
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

  const byNganh = NGANH_ORDER.reduce((acc, n) => {
    const lops = classes.filter(l => l.nhanh === n);
    if (lops.length) acc[n] = lops;
    return acc;
  }, {});

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#3d1515]"
            style={{ fontFamily: 'Georgia, serif' }}>
            Xuất báo cáo Excel
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Điểm danh · Bảng điểm · Tổng kết cuối kỳ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Học kỳ:</label>
          <div className="flex gap-1">
            {[1, 2].map(hk => (
              <button key={hk} onClick={() => setHocKy(hk)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition ${
                  hocKy === hk
                    ? 'bg-[#8B0000] text-white border-[#8B0000]'
                    : 'text-gray-600 border-gray-300 hover:border-[#8B0000]/40'
                }`}>
                HK {hk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!namHoc && (
        <p className="text-amber-600 bg-amber-50 rounded-xl px-4 py-3 text-sm border border-amber-200">
          Chưa có năm học nào đang hoạt động. Vui lòng kích hoạt năm học trước.
        </p>
      )}

      {namHoc && (
        <div className="flex flex-col gap-7">
          {/* ── Nút export toàn đoàn ── */}
          <div
            className="rounded-2xl border p-4 flex items-center justify-between flex-wrap gap-3"
            style={{ background: 'linear-gradient(135deg, #fff8f0 0%, #fdf5e6 100%)', borderColor: '#D4AF37' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#8B000015' }}>
                <FileSpreadsheet className="w-5 h-5 text-[#8B0000]" />
              </div>
              <div>
                <p className="font-bold text-[#3d1515] text-sm">Tổng kết TOÀN ĐOÀN — HK {hocKy}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tất cả lớp · TBM×80% + CC×20% + Học lực · {namHoc.ten}
                </p>
              </div>
            </div>
            <ExportButton
              url={`/api/export/tong-ket-toan-doan?hocKy=${hocKy}&namHocId=${namHoc._id}`}
              fileName={`TongKetToanDoan_HK${hocKy}_${namHoc.ten}.xlsx`}
              label="Xuất toàn đoàn"
              variant="primary"
            />
          </div>

          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider -mb-3">
            Năm học: <strong className="text-gray-600 normal-case tracking-normal">{namHoc.ten}</strong>
          </p>

          {/* ── Từng ngành ── */}
          {Object.entries(byNganh).map(([nhanh, lops]) => (
            <section key={nhanh}>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                {NGANH_LABEL[nhanh]}
              </h3>
              <div className="flex flex-col gap-2">
                {lops.map(lop => (
                  <div
                    key={lop._id}
                    className="rounded-xl border flex items-center justify-between gap-4 flex-wrap px-4 py-3 transition hover:shadow-sm"
                    style={{ background: '#fffcf9', borderColor: '#e5d5b5' }}
                  >
                    <div>
                      <p className="font-semibold text-[#3d1515] text-sm">{formatClassName(lop.tenLop)}</p>
                      <p className="text-xs text-gray-400">
                        HT: {lop.huynhTruong?.hoTen || '—'}
                        {lop.siSo != null && (
                          <span className="ml-2">· {lop.siSo} đoàn sinh</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <ExportButton
                        url={`/api/export/attendance/${lop._id}?namHocId=${namHoc._id}`}
                        fileName={`ChuyenCan_${lop.tenLop.replace(/\s/g, '_')}_${namHoc.ten}.xlsx`}
                        label="Điểm danh"
                      />
                      <ExportButton
                        url={`/api/export/grades/${lop._id}?namHocId=${namHoc._id}&hocKy=${hocKy}`}
                        fileName={`BangDiem_${lop.tenLop.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.ten}.xlsx`}
                        label="Bảng điểm"
                      />
                      <ExportButton
                        url={`/api/export/tong-ket/${lop._id}?hocKy=${hocKy}&namHocId=${namHoc._id}`}
                        fileName={`TongKet_${lop.tenLop.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.ten}.xlsx`}
                        label="Tổng kết"
                        variant="primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {classes.length === 0 && (
            <p className="text-center text-gray-400 py-12 italic">Chưa có lớp nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminExport;
