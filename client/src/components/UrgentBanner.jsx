import { useEffect, useState } from 'react';
import api from '../services/api';

// Hiển thị thông báo khẩn nổi bật ở đầu trang, tự ẩn nếu không có
const UrgentBanner = () => {
  const [posts, setPosts] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_urgent') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    api.get('/posts', { params: { loai: 'thongbaokhan', limit: 5 } })
      .then(r => setPosts(Array.isArray(r.data.data) ? r.data.data : []))
      .catch(() => {});
  }, []);

  const visible = posts.filter(p => !dismissed.includes(p._id));
  if (!visible.length) return null;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('dismissed_urgent', JSON.stringify(next));
  };

  return (
    <div className="bg-red-600 text-white text-sm">
      {visible.map(p => (
        <div key={p._id} className="max-w-5xl mx-auto px-4 py-2.5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="shrink-0 font-bold bg-white text-red-600 text-xs px-1.5 py-0.5 rounded mt-0.5">
              KHẨN
            </span>
            <span className="leading-snug">{p.tieuDe}</span>
          </div>
          <button
            onClick={() => dismiss(p._id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition text-lg leading-none mt-0.5"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default UrgentBanner;
