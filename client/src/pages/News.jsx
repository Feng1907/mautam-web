import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const LOAI_LABEL = {
  tintuc:        { label: 'Tin tức',        cls: 'badge-blue' },
  thongbao:      { label: 'Thông báo',      cls: 'badge-gray' },
  thongbaokhan:  { label: '🔔 Khẩn',        cls: 'badge-red'  },
};

const News = () => {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [loai, setLoai]       = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/posts', { params: { loai: loai || undefined, limit: 20 } })
      .then(r => setPosts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loai]);

  return (
    <main className="flex-1 page-container">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Tin Tức & Thông Báo</h1>
        <div className="flex gap-2">
          {[['', 'Tất cả'], ['tintuc', 'Tin tức'], ['thongbao', 'Thông báo'], ['thongbaokhan', 'Khẩn']].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setLoai(val)}
              className={`text-xs px-3 py-1 rounded-full border transition font-medium ${loai === val ? 'bg-red-700 text-white border-red-700' : 'text-gray-600 border-gray-300 hover:border-red-400'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        posts.length === 0
          ? <p className="text-center text-gray-400 py-16">Chưa có bài viết nào.</p>
          : <div className="flex flex-col gap-4">
              {posts.map(p => {
                const meta = LOAI_LABEL[p.loai] || LOAI_LABEL.tintuc;
                return (
                  <Link key={p._id} to={`/tin-tuc/${p._id}`} className="card hover:shadow-md transition group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={meta.cls}>{meta.label}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h2 className="font-semibold text-gray-800 group-hover:text-red-700 transition leading-snug">
                          {p.tieuDe}
                        </h2>
                        {p.tomTat && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.tomTat}</p>}
                        <p className="text-xs text-gray-400 mt-2">{p.tacGia?.hoTen}</p>
                      </div>
                      {p.anhDaiDien && (
                        <img src={p.anhDaiDien} alt="" className="w-20 h-16 object-cover rounded shrink-0" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
      )}
    </main>
  );
};

export default News;
