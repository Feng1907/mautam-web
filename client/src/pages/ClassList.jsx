import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];

const SLUG_TO_KEY = {
  'chien-non':  'ChienNon',
  'au-nhi':     'AuNhi',
  'thieu-nhi':  'ThieuNhi',
  'nghia-si':   'NghiaSi',
  'hiep-si':    'HiepSi',
};

const NGANH_META = {
  ChienNon: {
    label: 'Chiên Non',
    short: 'CN',
    accent: '#f472b6',        // pink-400
    bg: 'bg-pink-50',
    activeBg: 'bg-pink-500',
    border: 'border-pink-300',
    text: 'text-pink-700',
    activeText: 'text-white',
    strip: 'bg-pink-400',
  },
  AuNhi: {
    label: 'Ấu Nhi',
    short: 'ẤN',
    accent: '#4ade80',        // green-400
    bg: 'bg-green-50',
    activeBg: 'bg-green-500',
    border: 'border-green-300',
    text: 'text-green-700',
    activeText: 'text-white',
    strip: 'bg-green-400',
  },
  ThieuNhi: {
    label: 'Thiếu Nhi',
    short: 'TN',
    accent: '#60a5fa',        // blue-400
    bg: 'bg-blue-50',
    activeBg: 'bg-blue-500',
    border: 'border-blue-300',
    text: 'text-blue-700',
    activeText: 'text-white',
    strip: 'bg-blue-400',
  },
  NghiaSi: {
    label: 'Nghĩa Sĩ',
    short: 'NS',
    accent: '#facc15',        // yellow-400
    bg: 'bg-yellow-50',
    activeBg: 'bg-yellow-500',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    activeText: 'text-white',
    strip: 'bg-yellow-400',
  },
  HiepSi: {
    label: 'Hiệp Sĩ',
    short: 'HS',
    accent: '#fb923c',        // amber-400
    bg: 'bg-amber-50',
    activeBg: 'bg-amber-500',
    border: 'border-amber-300',
    text: 'text-amber-700',
    activeText: 'text-white',
    strip: 'bg-amber-400',
  },
};

const ClassList = () => {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNganh, setActiveNganh] = useState(
    () => SLUG_TO_KEY[searchParams.get('nganh')] ?? 'ChienNon'
  );

  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byNganh = classes.reduce((acc, lop) => {
    (acc[lop.nhanh] = acc[lop.nhanh] || []).push(lop);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  const activeLops = byNganh[activeNganh] || [];
  const meta = NGANH_META[activeNganh];

  return (
    <main className="flex-1 page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh Sách Lớp</h1>

      {/* Block selector tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {NGANH_ORDER.filter(n => byNganh[n]).map(nganh => {
          const m = NGANH_META[nganh];
          const isActive = nganh === activeNganh;
          return (
            <button
              key={nganh}
              onClick={() => setActiveNganh(nganh)}
              className={[
                'flex flex-col items-center justify-center px-5 py-3 rounded-xl border-2 transition-all font-semibold select-none',
                'min-w-22.5 flex-1 sm:flex-none',
                isActive
                  ? `${m.activeBg} border-transparent ${m.activeText} shadow-md scale-105`
                  : `${m.bg} ${m.border} ${m.text} hover:scale-102 hover:shadow`,
              ].join(' ')}
            >
              <span className="text-xl font-black tracking-tight">{m.short}</span>
              <span className="text-[11px] font-medium mt-0.5 leading-none">{m.label}</span>
              <span className={[
                'text-[10px] mt-1 px-2 py-0.5 rounded-full',
                isActive ? 'bg-white/25' : `${m.bg} border ${m.border}`,
              ].join(' ')}>
                {byNganh[nganh]?.length ?? 0} lớp
              </span>
            </button>
          );
        })}
      </div>

      {/* Class grid */}
      {activeLops.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Chưa có lớp nào trong ngành này.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activeLops.map(lop => {
            const hasHT = !!lop.huynhTruong?.hoTen;
            const hasDT = lop.duTruong?.length > 0;
            return (
              <Link
                key={lop._id}
                to={`/lop-hoc/${lop._id}`}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* colour strip */}
                <div className={`h-1.5 w-full ${meta.strip}`} />

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className={`font-bold text-base leading-tight group-hover:${meta.text} transition`}>
                    {lop.tenLop}
                  </h3>

                  {/* Personnel badges */}
                  <div className="flex flex-col gap-1 mt-auto">
                    {/* HT row */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 w-5 shrink-0">HT</span>
                      {hasHT ? (
                        <span className="text-xs text-gray-700 truncate">{lop.huynhTruong.hoTen}</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">?</span>
                          <span className="text-[10px] text-gray-300 italic">Chưa phân công</span>
                        </span>
                      )}
                    </div>

                    {/* DT row */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 w-5 shrink-0">DT</span>
                      {hasDT ? (
                        <span className="text-xs text-gray-600 truncate">
                          {lop.duTruong.map(d => d.hoTen).join(', ')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">?</span>
                          <span className="text-[10px] text-gray-300 italic">Chưa phân công</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {classes.length === 0 && (
        <p className="text-center text-gray-400 py-12">Chưa có lớp nào được tạo.</p>
      )}
    </main>
  );
};

export default ClassList;
