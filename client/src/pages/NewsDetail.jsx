import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from '../utils/seo';

const NewsDetail = () => {
  const { id } = useParams();
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(r => setPost(r.data.data))
      .catch(() => setError('Không tìm thấy bài viết.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <p className="text-center text-red-600 py-16">{error}</p>;

  const ogImage = toAbsoluteUrl(post.anhNen || post['anhNền'] || post.anhDaiDien) || DEFAULT_OG_IMAGE;

  return (
    <main className="flex-1 page-container max-w-3xl">
      <Helmet>
        <title>{post.tieuDe}</title>
        <meta property="og:title" content={post.tieuDe} />
        <meta property="og:description" content={post.tomTat || ''} />
        <meta property="og:image" content={ogImage} />
      </Helmet>
      <Link to="/tin-tuc" className="text-sm text-red-700 hover:underline mb-4 inline-block">
        ← Quay lại tin tức
      </Link>
      <div className="card">
        {post.anhDaiDien && (
          <img src={post.anhDaiDien} alt="" className="w-full h-52 object-cover rounded-lg mb-5" />
        )}
        <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-2">{post.tieuDe}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-5 border-b pb-4">
          <span>{post.tacGia?.hoTen}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: post.noiDung }}
        />
      </div>
    </main>
  );
};

export default NewsDetail;
