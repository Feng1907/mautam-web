import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SERIF = '"Playfair Display", "EB Garamond", Georgia, serif';
const SANS = '"Be Vietnam Pro", "Inter", system-ui, sans-serif';

const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];
const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', color: '#ec4899', bg: '#fdf2f8' },
  AuNhi:    { label: 'Ấu Nhi',    color: '#22c55e', bg: '#f0fdf4' },
  ThieuNhi: { label: 'Thiếu Nhi', color: '#3b82f6', bg: '#eff6ff' },
  NghiaSi:  { label: 'Nghĩa Sĩ',  color: '#eab308', bg: '#fefce8' },
  HiepSi:   { label: 'Hiệp Sĩ',   color: '#f97316', bg: '#fff7ed' },
};

const HOC_LUC_CFG = {
  'Xuất sắc': { color: '#b45309', bg: '#fffbeb' },
  'Giỏi':     { color: '#1d4ed8', bg: '#eff6ff' },
  'Khá':      { color: '#15803d', bg: '#f0fdf4' },
  'TB':       { color: '#6b7280', bg: '#f9fafb' },
  'Yếu':      { color: '#dc2626', bg: '#fef2f2' },
};

const TI_LE_HT = 0.8;
const TI_LE_CC = 0.2;
const LOAI = [
  { key: 'mieng', heSo: 1 }, { key: '15phut', heSo: 1 }, { key: '1tiet', heSo: 2 },
];

const tinhTBHT = (gs) => {
  if (!gs.length) return null;
  let ths = 0, td = 0;
  gs.forEach(g => { const hs = LOAI.find(l => l.key === g.loaiDiem)?.heSo||1; ths+=hs; td+=g.diem*hs; });
  return ths ? td/ths : null;
};
const tinhTK = (tbHT, cc) => {
  if (tbHT===null && cc==null) return null;
  if (tbHT===null) return cc*TI_LE_CC;
  if (cc==null) return tbHT;
  return tbHT*TI_LE_HT + cc*TI_LE_CC;
};
const phanLoai = (d) => {
  if (d==null) return null;
  const v = parseFloat(d);
  if (v>=9) return 'Xuất sắc';
  if (v>=8) return 'Giỏi';
  if (v>=6.5) return 'Khá';
  if (v>=5) return 'TB';
  return 'Yếu';
};

// ── Mini bar chart (CSS) ──────────────────────────────────────────────────────
const Bar = ({ label, value, max, color, suffix = '' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 text-gray-600 truncate">{label}</span>
      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, minWidth: value > 0 ? '8px' : '0' }}
        />
      </div>
      <span className="w-14 text-right font-semibold shrink-0" style={{ color }}>
        {value}{suffix}
      </span>
    </div>
  );
};

// ── Stat số tổng ──────────────────────────────────────────────────────────────
const BigStat = ({ label, value, color, sub }) => (
  <div className="rounded-2xl border p-4" style={{ borderColor: '#e5d5b5', background: '#fffcf9' }}>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-black" style={{ color, fontFamily: SANS }}>{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Trang chính ───────────────────────────────────────────────────────────────
const AdminStats = () => {
  const [loading,   setLoading]   = useState(true);
  const [classes,   setClasses]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [grades,    setGrades]    = useState([]);
  const [ccs,       setCcs]       = useState([]);
  const [attends,   setAttends]   = useState([]);
  const [namHoc,    setNamHoc]    = useState(null);
  const [hocKy,     setHocKy]     = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [clsR, nhR] = await Promise.all([api.get('/classes'), api.get('/namhoc')]);
        const cls  = clsR.data.data || [];
        const active = (nhR.data.data || []).find(n => n.dangHoatDong);
        setClasses(cls);
        setNamHoc(active || null);
        if (!active || !cls.length) { setLoading(false); return; }

        // Fetch students, grades, CC, attendance per lớp in parallel
        const lopIds = cls.map(l => l._id);
        const [svAll, grAll, ccAll, atAll] = await Promise.all([
          Promise.all(lopIds.map(id => api.get(`/students/${id}`))),
          Promise.all(lopIds.map(id => api.get(`/grades/${id}`, { params: { hocKy } }))),
          Promise.all(lopIds.map(id => api.get(`/chuyen-can/${id}`, { params: { hocKy } }))),
          Promise.all(lopIds.map(id => api.get(`/attendance/${id}`))),
        ]);
        setStudents(svAll.flatMap(r => r.data.data || []));
        setGrades(grAll.flatMap(r => r.data.data || []));
        setCcs(ccAll.flatMap(r => r.data.data || []));
        setAttends(atAll.flatMap(r => r.data.data || []));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [hocKy]);

  // ── Thống kê tổng ────────────────────────────────────────────────────────
  const globalStats = useMemo(() => {
    const total = students.length;
    const hasGrade = new Set(grades.map(g => g.student?._id || g.student)).size;
    const hasCc    = new Set(ccs.map(c => c.student?._id || c.student)).size;

    // Học lực phân phối
    const hocLucCount = {};
    students.forEach(s => {
      const sId  = s._id;
      const sGr  = grades.filter(g => (g.student?._id||g.student) === sId);
      const sCc  = ccs.find(c => (c.student?._id||c.student) === sId);
      const tbHT = tinhTBHT(sGr);
      const tk   = tinhTK(tbHT, sCc?.diem ?? null);
      const loai = phanLoai(tk);
      if (loai) hocLucCount[loai] = (hocLucCount[loai]||0)+1;
    });

    // TBM toàn đoàn
    const allTK = students.map(s => {
      const sGr = grades.filter(g => (g.student?._id||g.student) === s._id);
      const sCc = ccs.find(c => (c.student?._id||c.student) === s._id);
      return tinhTK(tinhTBHT(sGr), sCc?.diem??null);
    }).filter(v => v !== null);
    const tbmToanDoan = allTK.length
      ? (allTK.reduce((a,b)=>a+b,0)/allTK.length).toFixed(1)
      : null;

    return { total, hasGrade, hasCc, hocLucCount, tbmToanDoan };
  }, [students, grades, ccs]);

  // ── Thống kê theo ngành ────────────────────────────────────────────────
  const nganhStats = useMemo(() => {
    return NGANH_ORDER.map(nhanh => {
      const nganhLops = classes.filter(c => c.nhanh === nhanh);
      if (!nganhLops.length) return null;
      const lopIds = new Set(nganhLops.map(l => l._id));

      const nganhStudents = students.filter(s => lopIds.has(s.lop?.toString?.() || s.lop));
      const nganhGrades   = grades.filter(g => lopIds.has(g.lop?.toString?.() || g.lop));
      const nganhCcs      = ccs.filter(c => lopIds.has(c.lop?.toString?.() || c.lop));
      const nganhAttends  = attends.filter(a => lopIds.has(a.lop?.toString?.() || a.lop));

      // % chuyên cần trung bình (theo điểm CC)
      const ccDiems = nganhCcs.map(c => c.diem).filter(d => d != null);
      const avgCC   = ccDiems.length
        ? (ccDiems.reduce((a,b)=>a+b,0)/ccDiems.length).toFixed(1)
        : null;

      // % điểm danh có mặt
      const totalAtt = nganhAttends.length;
      const presentAtt = nganhAttends.filter(a => a.present).length;
      const pctAtt = totalAtt ? Math.round((presentAtt/totalAtt)*100) : null;

      // Phân phối học lực
      const hocLucCount = {};
      nganhStudents.forEach(s => {
        const sGr  = nganhGrades.filter(g => (g.student?._id||g.student) === s._id);
        const sCc  = nganhCcs.find(c => (c.student?._id||c.student) === s._id);
        const tk   = tinhTK(tinhTBHT(sGr), sCc?.diem??null);
        const loai = phanLoai(tk);
        if (loai) hocLucCount[loai] = (hocLucCount[loai]||0)+1;
      });

      return {
        nhanh,
        soLop: nganhLops.length,
        soDoanSinh: nganhStudents.length,
        avgCC,
        pctAtt,
        hocLucCount,
      };
    }).filter(Boolean);
  }, [classes, students, grades, ccs, attends]);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#3d1515]" style={{ fontFamily: SERIF }}>
            Dashboard Thống kê
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {namHoc ? `Năm học ${namHoc.ten}` : 'Chưa có năm học đang hoạt động'}
          </p>
        </div>
        <div className="flex gap-1">
          {[1,2].map(hk => (
            <button key={hk} onClick={() => setHocKy(hk)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                hocKy === hk
                  ? 'bg-[#8B0000] text-white border-[#8B0000]'
                  : 'text-[#5a1a1a] border-[#D4AF37]/50 hover:border-[#8B0000]/40 bg-amber-50/50'
              }`}>
              HK {hk}
            </button>
          ))}
        </div>
      </div>

      {!namHoc ? (
        <p className="text-amber-600 bg-amber-50 rounded-xl px-4 py-3 text-sm border border-amber-200">
          Chưa có năm học đang hoạt động.
        </p>
      ) : (
        <div className="flex flex-col gap-7">

          {/* ── Stat cards tổng ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BigStat label="Tổng đoàn sinh" value={globalStats.total}
              color="#8B0000" sub={`${classes.length} lớp`} />
            <BigStat label="Đã có điểm" value={globalStats.hasGrade}
              color="#1d4ed8" sub="(có ít nhất 1 điểm)" />
            <BigStat label="Có điểm CC" value={globalStats.hasCc}
              color="#15803d" sub="(chuyên cần HK này)" />
            <BigStat label="TBM toàn đoàn" value={globalStats.tbmToanDoan ?? '—'}
              color="#b45309" sub="(80% HT + 20% CC)" />
          </div>

          {/* ── Phân phối học lực toàn đoàn ── */}
          <div className="rounded-2xl border p-5" style={{ borderColor: '#e5d5b5', background: '#fffcf9' }}>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              Phân phối học lực — toàn đoàn
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(HOC_LUC_CFG).map(([label, cfg]) => {
                const count = globalStats.hocLucCount[label] || 0;
                return (
                  <Bar key={label} label={label} value={count}
                    max={globalStats.total} color={cfg.color} suffix=" em" />
                );
              })}
            </div>
          </div>

          {/* ── Thống kê từng ngành ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nganhStats.map(ns => {
              const cfg = NGANH_CFG[ns.nhanh];
              return (
                <div
                  key={ns.nhanh}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: cfg.color + '40', background: cfg.bg }}
                >
                  {/* Header ngành */}
                  <div className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: cfg.color + '30', background: cfg.color + '12' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                      <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{ns.soLop} lớp</span>
                      <span className="font-semibold" style={{ color: cfg.color }}>
                        {ns.soDoanSinh} đoàn sinh
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    {/* % chuyên cần + điểm danh */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl p-3" style={{ background: cfg.color + '10' }}>
                        <p className="text-2xl font-black" style={{ color: cfg.color }}>
                          {ns.avgCC ?? '—'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                          TB điểm CC
                        </p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: cfg.color + '10' }}>
                        <p className="text-2xl font-black" style={{ color: cfg.color }}>
                          {ns.pctAtt != null ? `${ns.pctAtt}%` : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                          Điểm danh
                        </p>
                      </div>
                    </div>

                    {/* Phân phối học lực trong ngành */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                        Học lực
                      </p>
                      {Object.entries(HOC_LUC_CFG).map(([label, hlCfg]) => {
                        const count = ns.hocLucCount[label] || 0;
                        return (
                          <Bar key={label} label={label} value={count}
                            max={ns.soDoanSinh || 1} color={hlCfg.color} suffix=" em" />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {nganhStats.length === 0 && (
            <p className="text-center text-gray-400 italic py-12">
              Chưa có dữ liệu. Hãy nhập điểm và điểm chuyên cần cho các lớp.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStats;
