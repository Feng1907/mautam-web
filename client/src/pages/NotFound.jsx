import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-900">
      <Helmet><title>404 — Trang không tìm thấy | Mâu Tâm</title></Helmet>

      <div className="text-center max-w-md w-full">
        {/* Large 404 */}
        <div className="relative mb-6 select-none">
          <p className="text-[120px] sm:text-[160px] font-black leading-none text-gray-100 dark:text-slate-800">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-700 flex items-center justify-center shadow-lg">
              <Search size={28} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-800 dark:text-slate-100 mb-2">
          Trang không tìm thấy
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
          <br />
          Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-700 hover:bg-red-800 transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-4">
            Có thể bạn đang tìm
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Tin tức', to: '/tin-tuc' },
              { label: 'Giờ lễ', to: '/gio-le' },
              { label: 'Lớp học', to: '/lop-hoc' },
              { label: 'Sự kiện', to: '/su-kien' },
              { label: 'Thư viện', to: '/thu-vien' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-red-300 hover:text-red-700 dark:hover:text-red-400 transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
