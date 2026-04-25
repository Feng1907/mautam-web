import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const NGANH = [
  { ten: 'Chiên Non',  mau: 'bg-pink-400',   mo_ta: 'Khai Tâm',               slug: 'chien-non' },
  { ten: 'Ấu Nhi',    mau: 'bg-green-500',  mo_ta: 'XT 1, XT 2A/2B, XT 3A/3B', slug: 'au-nhi'   },
  { ten: 'Thiếu Nhi', mau: 'bg-blue-500',   mo_ta: 'Thêm Sức 1, Thêm Sức 2', slug: 'thieu-nhi' },
  { ten: 'Nghĩa Sĩ',  mau: 'bg-yellow-400', mo_ta: 'Sống Đạo 1, 2, 3',       slug: 'nghia-si'  },
  { ten: 'Hiệp Sĩ',   mau: 'bg-amber-700',  mo_ta: 'Hiệp Sĩ',                slug: 'hiep-si'   },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-linear-to-br from-red-700 to-red-900 text-white py-16 px-4 text-center">
        <p className="text-sm uppercase tracking-widest opacity-75 mb-2">Xứ Đoàn Thiếu Nhi Thánh Thể</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Anrê Phú Yên – Mẫu Tâm</h1>
        <p className="italic text-white/80 text-base md:text-lg max-w-xl mx-auto mt-3">
          "Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."
        </p>
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <Link to="/gio-le" className="bg-white text-red-700 font-semibold px-5 py-2 rounded-full hover:bg-red-50 transition text-sm">
            Xem giờ lễ
          </Link>
          <Link to="/tin-tuc" className="border border-white/50 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition text-sm">
            Tin tức
          </Link>
          {user && (
            <Link to="/lop-hoc" className="border border-white/50 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition text-sm">
              Lớp học
            </Link>
          )}
        </div>
      </section>

      {/* 5 ngành */}
      <section className="page-container">
        <h2 className="text-xl font-bold text-gray-800 mb-5">5 Ngành Thiếu Nhi Thánh Thể</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {NGANH.map((n) => (
            <Link
              key={n.ten}
              to={`/lop-hoc?nganh=${n.slug}`}
              className="card text-center hover:shadow-md hover:scale-105 hover:brightness-[1.03] active:scale-100 transition-all duration-150 cursor-pointer"
            >
              <div className={`w-10 h-10 ${n.mau} rounded-full mx-auto mb-3`} />
              <p className="font-semibold text-sm text-gray-800">{n.ten}</p>
              <p className="text-xs text-gray-500 mt-1">{n.mo_ta}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Giới thiệu Quan thầy */}
      <section className="bg-white border-t border-b border-gray-100 py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-red-600 font-semibold mb-2">Quan Thầy</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thánh Anrê Phú Yên</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Vị chứng nhân đầu tiên của Giáo hội Việt Nam, tử đạo ngày 26 tháng 7 năm 1644 tại Quảng Nam.
            Được Đức Giáo Hoàng Gioan Phaolô II phong Chân Phước năm 1989 và Thánh Giáo Hoàng
            Gioan Phaolô II suy tôn Hiển Thánh ngày 19/06/2000.
          </p>
          <p className="mt-4 text-red-700 font-semibold italic">
            "Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."
          </p>
        </div>
      </section>

      {/* Quick links */}
      <section className="page-container grid md:grid-cols-3 gap-4">
        <Link to="/gio-le" className="card hover:shadow-md transition group">
          <div className="text-3xl mb-2">🕯️</div>
          <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">Giờ Lễ</h3>
          <p className="text-sm text-gray-500 mt-1">Xem lịch lễ hàng ngày và Lời Chúa</p>
        </Link>
        <Link to="/tin-tuc" className="card hover:shadow-md transition group">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">Tin Tức & Thông Báo</h3>
          <p className="text-sm text-gray-500 mt-1">Cập nhật hoạt động xứ đoàn</p>
        </Link>
        {user ? (
          <Link to="/lop-hoc" className="card hover:shadow-md transition group">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">Lớp Học</h3>
            <p className="text-sm text-gray-500 mt-1">Điểm danh & bảng điểm</p>
          </Link>
        ) : (
          <Link to="/login" className="card hover:shadow-md transition group border-dashed">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">Đăng Nhập</h3>
            <p className="text-sm text-gray-500 mt-1">Dành cho Huynh trưởng & Dự trưởng</p>
          </Link>
        )}
      </section>
    </main>
  );
};

export default Home;
