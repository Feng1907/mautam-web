import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// ── Màu & nhãn ngành ─────────────────────────────────────────────────────────
const NGANH_CFG = {
  ChienNon: { label: 'Chiên Non', dot: 'bg-pink-400',   badge: 'bg-pink-100 text-pink-700'   },
  AuNhi:    { label: 'Ấu Nhi',    dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'  },
  ThieuNhi: { label: 'Thiếu Nhi', dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700'   },
  NghiaSi:  { label: 'Nghĩa Sĩ',  dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700'},
  HiepSi:   { label: 'Hiệp Sĩ',   dot: 'bg-amber-700',  badge: 'bg-amber-100 text-amber-800' },
};

const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];

const CHUC_VU_CFG = {
  huynhtruong: { label: 'Huynh trưởng', cls: 'bg-green-100 text-green-800' },
  dutruong:    { label: 'Dự trưởng',    cls: 'bg-sky-100   text-sky-800'   },
};
const VAI_TRO_CFG = {
  admin:  { label: 'Admin',        cls: 'bg-red-100   text-red-700'  },
  giaoly: { label: 'Giáo lý viên', cls: 'bg-blue-100  text-blue-700' },
  user:   { label: 'Phụ huynh',    cls: 'bg-gray-100  text-gray-600' },
};

// Avatar với màu nền dựa trên ký tự đầu
const AVATAR_COLORS = [
  'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500',
  'bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, to, color, bg }) => (
  <Link to={to} className="card hover:shadow-md transition group p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">{label}</p>
        <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </Link>
);

// ── Class card nhỏ ───────────────────────────────────────────────────────────
const ClassCard = ({ lop }) => {
  const cfg = NGANH_CFG[lop.nhanh] || NGANH_CFG.ChienNon;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>
      <p className="font-bold text-gray-800 text-sm leading-tight">{lop.tenLop}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">
        Sĩ số: <span className="text-green-700 font-bold">{lop.siSo ?? 0}</span>
        <span className="text-gray-400 font-normal"> đoàn sinh</span>
      </p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {lop.huynhTruong?.hoTen ? (
          <>HT: <span className="text-blue-600 font-medium">{lop.huynhTruong.hoTen}</span></>
        ) : lop.duTruong?.length > 0 ? (
          <>DT: <span className="text-sky-600 font-medium">{lop.duTruong.map(d => d.hoTen).join(', ')}</span></>
        ) : (
          <span className="italic">Chưa phân công</span>
        )}
      </p>
      <div className="flex gap-1.5 mt-2.5">
        <Link to={`/lop-hoc/${lop._id}`}
          className="flex-1 text-center text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 py-1 rounded transition">
          Xem
        </Link>
        <Link to="/admin/lop-hoc"
          className="flex-1 text-center text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 rounded transition">
          Phân công
        </Link>
      </div>
    </div>
  );
};

// ── Dashboard chính ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [users,       setUsers]       = useState([]);
  const [classes,     setClasses]     = useState([]);
  const [posts,       setPosts]       = useState([]);
  const [stats,       setStats]       = useState({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/users'),
      api.get('/classes'),
      api.get('/posts', { params: { limit: 5 } }),
    ]).then(([u, c, p]) => {
      const usersData   = u.value?.data?.data || [];
      const classesData = c.value?.data?.data || [];
      const postsData   = p.value?.data?.data || [];
      setUsers(usersData);
      setClasses(classesData);
      setPosts(postsData);
      setStats({
        lopHoc:     classesData.length,
        giaoly:     usersData.filter(x => x.vaiTro === 'giaoly').length,
        baiviet:    p.value?.data?.total ?? 0,
        doanSinh:   classesData.reduce((sum, c) => sum + (c.siSo ?? 0), 0),
        lopCoNhanSu: classesData.filter(c => c.huynhTruong || c.duTruong?.length > 0).length,
      });
      setLoading(false);
    });
  }, []);

  // Gom lớp theo ngành
  const byNganh = classes.reduce((acc, l) => {
    (acc[l.nhanh] = acc[l.nhanh] || []).push(l); return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ══ CỘT 1 — QUẢN LÝ NGƯỜI DÙNG ══════════════════════════════════ */}
      <section className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase">
            Quản lý Người dùng
          </h2>
          <Link to="/admin/nguoi-dung" className="btn-primary py-1! px-3! text-xs!">
            + Tạo tài khoản
          </Link>
        </div>

        {/* Tabs mini */}
        <div className="flex gap-1 flex-wrap">
          {[
            { label: 'Tất cả',       filter: () => true },
            { label: 'Admin',        filter: u => u.vaiTro === 'admin' },
            { label: 'Huynh trưởng', filter: u => u.chucVu === 'huynhtruong' },
            { label: 'Dự trưởng',   filter: u => u.chucVu === 'dutruong' },
          ].map((t, i) => {
            const count = users.filter(t.filter).length;
            return (
              <Link key={i} to="/admin/nguoi-dung"
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                  i === 0
                    ? 'bg-red-700 text-white border-red-700'
                    : 'text-gray-500 border-gray-200 hover:border-red-400'
                }`}>
                {t.label} <span className="opacity-70">({count})</span>
              </Link>
            );
          })}
        </div>

        {/* Danh sách user */}
        <div className="flex flex-col gap-2.5">
          {users.slice(0, 6).map(u => {
            const vt  = VAI_TRO_CFG[u.vaiTro] || VAI_TRO_CFG.user;
            const cv  = u.chucVu ? CHUC_VU_CFG[u.chucVu] : null;
            const col = avatarColor(u.hoTen);
            return (
              <div key={u._id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ${col} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                  {u.hoTen?.charAt(0)?.toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{u.hoTen}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vt.cls}`}>{vt.label}</span>
                    {cv && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cv.cls}`}>{cv.label}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <Link to="/admin/nguoi-dung"
                    className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded text-center transition">
                    Sửa
                  </Link>
                  <button className="text-[10px] font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded transition">
                    Xoá
                  </button>
                </div>
              </div>
            );
          })}
          {users.length > 6 && (
            <Link to="/admin/nguoi-dung"
              className="text-center text-xs text-red-600 hover:underline font-medium py-1">
              Xem thêm {users.length - 6} người dùng →
            </Link>
          )}
          {users.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có người dùng.</p>
          )}
        </div>
      </section>

      {/* ══ CỘT 2 — QUẢN LÝ LỚP HỌC ════════════════════════════════════ */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase">
            Quản lý Lớp học
          </h2>
          <Link to="/admin/lop-hoc" className="text-xs text-red-600 hover:underline font-medium">
            Xem tất cả →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {NGANH_ORDER.filter(n => byNganh[n]).map(nhanh => {
            const cfg  = NGANH_CFG[nhanh];
            const lops = byNganh[nhanh];
            return (
              <div key={nhanh}>
                {/* Nhãn ngành */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0`} />
                  <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    {cfg.label}
                  </p>
                </div>
                {/* Grid lớp */}
                <div className={`grid gap-2 ${lops.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {lops.map(lop => <ClassCard key={lop._id} lop={lop} />)}
                </div>
              </div>
            );
          })}
          {classes.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có lớp nào.</p>
          )}
        </div>
      </section>

      {/* ══ CỘT 3 — TỔNG QUAN & BÀI VIẾT ═══════════════════════════════ */}
      <section className="flex flex-col gap-5">

        {/* Stat cards */}
        <div>
          <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
            Tổng quan
          </h2>
          <div className="flex flex-col gap-2.5">
            <StatCard icon="🏫" label="Lớp học"           value={stats.lopHoc}
              to="/admin/lop-hoc"    color="text-blue-700"   bg="bg-blue-50"   />
            <StatCard icon="🕊️" label="Tổng đoàn sinh"   value={stats.doanSinh}
              to="/admin/lop-hoc"    color="text-green-700"  bg="bg-green-50"  />
            <StatCard icon="✅" label="Lớp có nhân sự"   value={stats.lopCoNhanSu}
              to="/admin/lop-hoc"    color="text-teal-700"   bg="bg-teal-50"   />
            <StatCard icon="👥" label="Giáo lý viên"     value={stats.giaoly}
              to="/admin/nguoi-dung" color="text-amber-700"  bg="bg-amber-50"  />
            <StatCard icon="📝" label="Bài viết"         value={stats.baiviet}
              to="/admin/bai-viet"   color="text-red-700"    bg="bg-red-50"    />
          </div>
        </div>

        {/* Bài viết mới nhất */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase">
              Bài viết mới nhất
            </h2>
            <Link to="/admin/bai-viet"
              className="text-xs text-red-600 hover:underline font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {posts.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center text-gray-400 text-sm">
                Chưa có bài viết.
              </div>
            ) : posts.map(p => (
              <div key={p._id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.tieuDe}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.daDang ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {p.daDang ? 'Đăng' : 'Nháp'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div>
          <h2 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '✍️', label: 'Đăng bài mới',       to: '/admin/bai-viet'   },
              { icon: '➕', label: 'Thêm Huynh trưởng',   to: '/admin/nguoi-dung' },
              { icon: '📋', label: 'Phân công lớp',        to: '/admin/lop-hoc'    },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md hover:border-red-200 transition group flex flex-col items-center gap-1.5">
                <span className="text-2xl">{a.icon}</span>
                <p className="text-[10px] font-semibold text-gray-600 group-hover:text-red-700 transition leading-tight">
                  {a.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
};

export default AdminDashboard;
