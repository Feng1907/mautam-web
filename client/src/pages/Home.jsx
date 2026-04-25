import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthContext';

const NGANH_KEYS = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];
const NGANH_COLOR = {
  ChienNon: 'bg-pink-400',
  AuNhi:    'bg-green-500',
  ThieuNhi: 'bg-blue-500',
  NghiaSi:  'bg-yellow-400',
  HiepSi:   'bg-amber-700',
};
const NGANH_SLUG = {
  ChienNon: 'chien-non',
  AuNhi:    'au-nhi',
  ThieuNhi: 'thieu-nhi',
  NghiaSi:  'nghia-si',
  HiepSi:   'hiep-si',
};

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-linear-to-br from-red-700 to-red-900 text-white py-16 px-4 text-center">
        <p className="text-sm uppercase tracking-widest opacity-75 mb-2">{t('home.subtitle')}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('home.title')}</h1>
        <p className="italic text-white/80 text-base md:text-lg max-w-xl mx-auto mt-3">
          {t('home.quote')}
        </p>
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <Link to="/gio-le"
            className="bg-white text-red-700 font-semibold px-5 py-2 rounded-full hover:bg-red-50 transition text-sm">
            {t('home.viewLiturgy')}
          </Link>
          <Link to="/tin-tuc"
            className="border border-white/50 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition text-sm">
            {t('home.news')}
          </Link>
          {user && (
            <Link to="/lop-hoc"
              className="border border-white/50 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition text-sm">
              {t('home.classes')}
            </Link>
          )}
        </div>
      </section>

      {/* 5 ngành */}
      <section className="page-container">
        <h2 className="text-xl font-bold text-gray-800 mb-5">{t('home.nganhTitle')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {NGANH_KEYS.map(key => (
            <Link
              key={key}
              to={`/lop-hoc?nganh=${NGANH_SLUG[key]}`}
              className="card text-center hover:shadow-md hover:scale-105 hover:brightness-[1.03] active:scale-100 transition-all duration-150 cursor-pointer"
            >
              <div className={`w-10 h-10 ${NGANH_COLOR[key]} rounded-full mx-auto mb-3`} />
              <p className="font-semibold text-sm text-gray-800">{t(`nganh.${key}`)}</p>
              <p className="text-xs text-gray-500 mt-1">{t(`nganh.desc.${key}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Giới thiệu Quan thầy */}
      <section className="bg-white border-t border-b border-gray-100 py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-red-600 font-semibold mb-2">
            {t('home.patronSection')}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.patronName')}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{t('home.patronDesc')}</p>
          <p className="mt-4 text-red-700 font-semibold italic">{t('home.quote')}</p>
        </div>
      </section>

      {/* Quick links */}
      <section className="page-container grid md:grid-cols-3 gap-4">
        <Link to="/gio-le" className="card hover:shadow-md transition group">
          <div className="text-3xl mb-2">🕯️</div>
          <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">{t('home.liturgyLink')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('home.liturgyDesc')}</p>
        </Link>
        <Link to="/tin-tuc" className="card hover:shadow-md transition group">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">{t('home.newsLink')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('home.newsDesc')}</p>
        </Link>
        {user ? (
          <Link to="/lop-hoc" className="card hover:shadow-md transition group">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">{t('home.classesLink')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('home.classesDesc')}</p>
          </Link>
        ) : (
          <Link to="/login" className="card hover:shadow-md transition group border-dashed">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-bold text-gray-800 group-hover:text-red-700 transition">{t('home.loginCta')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('home.loginDesc')}</p>
          </Link>
        )}
      </section>
    </main>
  );
};

export default Home;
