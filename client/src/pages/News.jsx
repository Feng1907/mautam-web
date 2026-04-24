import { useEffect, useState } from 'react';
import api from '../services/api';

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts').then((r) => setPosts(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải tin tức...</p>;

  return (
    <main>
      <h2>Tin Tức & Thông Báo</h2>
      {posts.length === 0 && <p>Chưa có tin tức.</p>}
      {posts.map((p) => (
        <article key={p._id}>
          <h3>{p.tieuDe}</h3>
          <small>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</small>
          <p>{p.tomTat}</p>
        </article>
      ))}
    </main>
  );
};

export default News;
