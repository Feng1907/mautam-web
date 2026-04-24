import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ icon, label, value, to, color }) => (
  <Link to={to} className="card hover:shadow-md transition group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      </div>
      <span className="text-4xl opacity-20 group-hover:opacity-40 transition">{icon}</span>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get('/classes'),
      api.get('/users', { params: { vaiTro: 'giaoly' } }),
      api.get('/posts', { params: { limit: 5 } }),
    ]).then(([cls, usr, pst]) => {
      setStats({
        lopHoc:    cls.value?.data?.data?.length,
        giaoly:    usr.value?.data?.data?.length,
        baiviet:   pst.value?.data?.total,
      });
      setRecentPosts(pst.value?.data?.data || []);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon="🏫" label="Lớp học"      value={stats.lopHoc}  to="/admin/lop-hoc"    color="text-blue-700" />
        <StatCard icon="👥" label="Giáo lý viên" value={stats.giaoly}  to="/admin/nguoi-dung" color="text-green-700" />
        <StatCard icon="📝" label="Bài viết"     value={stats.baiviet} to="/admin/bai-viet"   color="text-red-700" />
      </div>

      {/* Bài viết mới nhất */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Bài viết mới nhất</h2>
          <Link to="/admin/bai-viet" className="text-xs text-red-700 hover:underline">Xem tất cả</Link>
        </div>
        <div className="flex flex-col gap-2">
          {recentPosts.map(p => (
            <div key={p._id} className="card py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.tieuDe}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                p.daDang ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {p.daDang ? 'Đã đăng' : 'Nháp'}
              </span>
            </div>
          ))}
          {recentPosts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có bài viết.</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link to="/admin/bai-viet" className="card text-center hover:shadow-md transition py-4 group">
            <div className="text-2xl mb-1">✍️</div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-red-700 transition">Đăng bài mới</p>
          </Link>
          <Link to="/admin/nguoi-dung" className="card text-center hover:shadow-md transition py-4 group">
            <div className="text-2xl mb-1">➕</div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-red-700 transition">Thêm Huynh trưởng</p>
          </Link>
          <Link to="/admin/lop-hoc" className="card text-center hover:shadow-md transition py-4 group">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-red-700 transition">Phân công lớp</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
