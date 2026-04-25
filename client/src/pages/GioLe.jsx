import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Shirt, BookOpen, Calendar, ChevronRight, Quote } from 'lucide-react';

// ─── Dữ liệu tĩnh ────────────────────────────────────────────────────────────

const LICH_LE = [
  { ngay: 'Ngày thường', gio: ['05:30', '18:00'] },
  { ngay: 'Chúa Nhật',   gio: ['05:30', '09:00', '17:00', '18:30'] },
];

// mauKey: trang | do | tim | xanh | den | hong
// cap: 'dai' = ĐẠI LỄ (vàng đồng) | 'trong' = LỄ TRỌNG (đỏ) | undefined = thường
// icon: emoji icon nhỏ theo mùa/ý nghĩa
const importantFeasts = [
  { ngay: '01/04', ten: 'Thứ Tư Tuần Thánh',            mauKey: 'tim',   icon: '🕊️' },
  { ngay: '02/04', ten: 'Thứ Năm Tuần Thánh',           mauKey: 'trang', icon: '🍞',  cap: 'trong' },
  { ngay: '03/04', ten: 'Thứ Sáu Tuần Thánh',           mauKey: 'do',    icon: '✝️',  cap: 'trong' },
  { ngay: '04/04', ten: 'Thứ Bảy Tuần Thánh',           mauKey: 'trang', icon: '🕯️' },
  { ngay: '05/04', ten: 'ĐẠI LỄ PHỤC SINH',             mauKey: 'trang', icon: '🌿',  cap: 'dai'   },
  { ngay: '06/04', ten: 'Chúa Nhật Phục Sinh',          mauKey: 'trang', icon: '🌿',  cap: 'dai'   },
  { ngay: '07/04', ten: 'Thứ Hai Bát Nhật Phục Sinh',   mauKey: 'trang', icon: '🌿' },
  { ngay: '08/04', ten: 'Thứ Ba Bát Nhật Phục Sinh',    mauKey: 'trang', icon: '🌿' },
  { ngay: '09/04', ten: 'Thứ Tư Bát Nhật Phục Sinh',   mauKey: 'trang', icon: '🌿' },
  { ngay: '10/04', ten: 'Thứ Năm Bát Nhật Phục Sinh',  mauKey: 'trang', icon: '🌿' },
  { ngay: '11/04', ten: 'Thứ Sáu Bát Nhật Phục Sinh',  mauKey: 'trang', icon: '🌿' },
  { ngay: '12/04', ten: 'Thứ Bảy Bát Nhật Phục Sinh',  mauKey: 'trang', icon: '🌿' },
  { ngay: '13/04', ten: 'CN II Phục Sinh — Lòng Chúa Thương Xót', mauKey: 'trang', icon: '💧', cap: 'trong' },
  { ngay: '20/04', ten: 'CN III Phục Sinh',             mauKey: 'trang', icon: '🌿' },
  { ngay: '23/04', ten: 'Thánh Georgiô, Tử đạo',       mauKey: 'do',    icon: '⚔️',  cap: 'nho'   },
  { ngay: '24/04', ten: 'Thánh Fidelis Sigmaringen',    mauKey: 'do',    icon: '✝️',  cap: 'nho'   },
  { ngay: '25/04', ten: 'Thánh Máccô, Thánh Sử',       mauKey: 'do',    icon: '📖',  cap: 'kinh'  },
  { ngay: '27/04', ten: 'CN IV Phục Sinh — Chúa Chiên Lành', mauKey: 'trang', icon: '🐑', cap: 'trong' },
  { ngay: '28/04', ten: 'Thánh Phêrô Chanel',           mauKey: 'do',    icon: '✝️',  cap: 'nho'   },
  { ngay: '29/04', ten: 'Thánh Catarina Siena',         mauKey: 'trang', icon: '✨',  cap: 'trong' },
  { ngay: '30/04', ten: 'Thánh Piô V, Giáo Hoàng',     mauKey: 'trang', icon: '👑',  cap: 'nho'   },
];

const QUOTE = {
  noi: '"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."',
  nguon: '— Thánh Anrê Phú Yên',
};

// ─── Màu áo phụng vụ ─────────────────────────────────────────────────────────

const MAU_AO = {
  trang: {
    label: 'Màu Trắng',
    card: 'bg-gradient-to-br from-gray-50 to-white border border-gray-200',
    dot:  'bg-gradient-to-br from-gray-200 to-white border border-gray-300',
    icon: 'text-gray-500',
    text: 'text-gray-700',
  },
  do: {
    label: 'Màu Đỏ',
    card: 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200',
    dot:  'bg-gradient-to-br from-red-500 to-rose-500',
    icon: 'text-white',
    text: 'text-red-700',
  },
  tim: {
    label: 'Màu Tím',
    card: 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200',
    dot:  'bg-gradient-to-br from-purple-500 to-violet-500',
    icon: 'text-white',
    text: 'text-purple-700',
  },
  xanh: {
    label: 'Màu Xanh',
    card: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200',
    dot:  'bg-gradient-to-br from-green-500 to-emerald-500',
    icon: 'text-white',
    text: 'text-green-700',
  },
  den: {
    label: 'Màu Đen',
    card: 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-300',
    dot:  'bg-gradient-to-br from-gray-700 to-gray-900',
    icon: 'text-white',
    text: 'text-gray-700',
  },
  hong: {
    label: 'Màu Hồng',
    card: 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200',
    dot:  'bg-gradient-to-br from-pink-400 to-rose-400',
    icon: 'text-white',
    text: 'text-pink-700',
  },
};

const MAU_DOT_SMALL = {
  trang: 'bg-gray-300',
  do:    'bg-red-500',
  tim:   'bg-purple-500',
  xanh:  'bg-green-500',
  den:   'bg-gray-700',
  hong:  'bg-pink-400',
};

const detectLiturgy = (tenLe = '') => {
  const t = tenLe.toLowerCase();
  if (t.includes('lễ tro'))                                         return { mauKey: 'den',   loai: 'Lễ Đặc Biệt' };
  if (t.includes('thứ sáu tuần thánh') || t.includes('thương khó'))return { mauKey: 'do',    loai: 'Lễ Đặc Biệt' };
  if (t.includes('tuần thánh') || t.includes('lễ lá'))             return { mauKey: 'do',    loai: 'Lễ Đặc Biệt' };
  if (t.includes('mùa chay') || t.includes('chay'))                return { mauKey: 'tim',   loai: 'Mùa Chay'    };
  if (t.includes('mùa vọng') || t.includes('vọng'))                return { mauKey: 'tim',   loai: 'Mùa Vọng'    };
  if (t.includes('iii mùa vọng') || t.includes('iv mùa chay'))     return { mauKey: 'hong',  loai: 'Lễ Đặc Biệt' };
  if (t.includes('phục sinh') || t.includes('giáng sinh') ||
      t.includes('hiển linh') || t.includes('lên trời') ||
      t.includes('ba ngôi')   || t.includes('mình máu'))            return { mauKey: 'trang', loai: 'Lễ Trọng'    };
  if (t.includes('tử đạo') || t.includes('hiện xuống') ||
      t.includes('thánh giá'))                                      return { mauKey: 'do',    loai: 'Lễ Trọng'    };
  if (t.includes('thánh sử') || t.includes('tông đồ') ||
      t.includes('tiến sĩ'))                                        return { mauKey: 'trang', loai: 'Lễ Kính'     };
  if (t.includes('thánh') || t.includes('chúa nhật'))              return { mauKey: 'trang', loai: 'Lễ Nhớ'      };
  return { mauKey: 'xanh', loai: 'Lễ Thường' };
};

// ─── Hook đồng hồ ────────────────────────────────────────────────────────────

const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

// Định dạng ngày tự động theo locale — dùng Intl thay chuỗi hardcode
const formatDate = (date, locale) => {
  const lang = locale?.startsWith('en') ? 'en-US' : 'vi-VN';
  return {
    thu:  date.toLocaleDateString(lang, { weekday: 'long' }),
    ngay: date.toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    gio:  date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
  };
};

// ─── Fetch phụng vụ ──────────────────────────────────────────────────────────

const fetchLoiChua = async () => {
  const d = new Date();
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  try {
    const res = await fetch(`https://www.loichua.net/api/daily?date=${yyyy}-${mm}-${dd}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return null; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// loaiKey: key tra cứu trong t('liturgy.types.*')
const LOAI_KEY_MAP = {
  'Lễ Trọng':    'leTrong',
  'Lễ Đặc Biệt': 'leDacBiet',
  'Mùa Chay':    'muaChay',
  'Mùa Vọng':    'muaVong',
  'Lễ Kính':     'leKinh',
  'Lễ Nhớ':      'leNho',
  'Lễ Thường':   'leThuong',
};
const LOAI_CLS = {
  leTrong:   'bg-red-100 text-red-700',
  leDacBiet: 'bg-purple-100 text-purple-700',
  muaChay:   'bg-purple-50 text-purple-600',
  muaVong:   'bg-purple-50 text-purple-600',
  leKinh:    'bg-blue-100 text-blue-600',
  leNho:     'bg-gray-100 text-gray-500',
  leThuong:  'bg-gray-100 text-gray-500',
};

const LoaiBadge = ({ loai }) => {
  const { t } = useTranslation();
  const key = LOAI_KEY_MAP[loai] || 'leThuong';
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${LOAI_CLS[key]}`}>
      {t(`liturgy.types.${key}`)}
    </span>
  );
};

const LiturgyCards = ({ mauKey, loai, tenLe, loading }) => {
  const { t } = useTranslation();
  const mau = MAU_AO[mauKey] || MAU_AO.xanh;
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className={`rounded-2xl p-4 flex items-center gap-3 ${mau.card}`}>
        <div className={`w-11 h-11 rounded-full shrink-0 ${mau.dot} flex items-center justify-center shadow-sm`}>
          <Shirt size={20} className={mau.icon} />
        </div>
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-wider opacity-60 ${mau.text}`}>
            {t('liturgy.vestmentLabel')}
          </p>
          <p className={`font-bold text-sm mt-0.5 ${mau.text}`}>
            {t(`liturgy.colors.${mauKey}`, mau.label)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {t('liturgy.todayLabel')}
        </p>
        {loading ? (
          <p className="text-xs text-gray-300 italic">{t('liturgy.loading')}</p>
        ) : tenLe ? (
          <>
            <p className="font-bold text-gray-800 text-sm leading-tight">{tenLe}</p>
            <LoaiBadge loai={loai} />
          </>
        ) : (
          <p className="text-xs text-gray-400 italic">{t('liturgy.noData')}</p>
        )}
      </div>
    </div>
  );
};

const MassSchedule = ({ now }) => {
  const { t } = useTranslation();
  const isChaNhat = now.getDay() === 0;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const LICH_TRANSLATED = [
    { key: 'weekdays', label: t('liturgy.weekdays'), gio: ['05:30', '18:00'] },
    { key: 'sunday',   label: t('liturgy.sunday'),   gio: ['05:30', '09:00', '17:00', '18:30'] },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock size={13} /> {t('liturgy.scheduleTitle')}
      </h3>
      <div className="flex flex-col gap-2.5">
        {LICH_TRANSLATED.map(l => {
          const isCurrent = isChaNhat ? l.key === 'sunday' : l.key === 'weekdays';
          return (
            <div key={l.key} className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold w-24 shrink-0 ${isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                {l.label}
                {isCurrent && (
                  <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                    {t('liturgy.todayBadge')}
                  </span>
                )}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {l.gio.map(g => {
                  const [h, m] = g.split(':').map(Number);
                  const isPast = isCurrent && (h * 60 + m) < nowMins;
                  return (
                    <span key={g} className={[
                      'font-mono text-xs font-semibold px-2.5 py-1 rounded-full border',
                      isPast    ? 'bg-gray-50 text-gray-300 border-gray-100 line-through' :
                      isCurrent ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-gray-50 text-gray-400 border-gray-100',
                    ].join(' ')}>{g}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GospelCard = ({ tinMung, loading, onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md hover:from-amber-100 hover:to-orange-100 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-amber-700">
          <BookOpen size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{t('liturgy.gospelTitle')}</span>
        </div>
        <span className="text-amber-400 group-hover:translate-x-1 transition-transform">
          <ChevronRight size={16} />
        </span>
      </div>
      {loading ? (
        <p className="text-sm text-amber-300 italic">{t('liturgy.loading')}</p>
      ) : tinMung ? (
        <p className="text-sm font-semibold text-amber-800 leading-snug">{tinMung}</p>
      ) : (
        <p className="text-sm text-amber-600 italic">{t('liturgy.gospelFallback')}</p>
      )}
      <span className="mt-3 inline-block text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
        {t('liturgy.gospelCta')}
      </span>
    </button>
  );
};

// ─── FeastItem ────────────────────────────────────────────────────────────────

const CAP_CONFIG = {
  dai:   { label: 'ĐẠI LỄ',   rowCls: 'bg-amber-50 border border-amber-200 hover:bg-amber-100',  dateCls: 'text-amber-600',  nameCls: 'font-bold text-amber-800',    badge: 'bg-amber-400 text-white'   },
  trong: { label: 'LỄ TRỌNG', rowCls: 'bg-red-50 border border-red-100 hover:bg-red-100',         dateCls: 'text-red-500',    nameCls: 'font-semibold text-red-800',  badge: 'bg-red-500 text-white'     },
  kinh:  { label: 'LỄ KÍNH',  rowCls: 'bg-blue-50 border border-blue-100 hover:bg-blue-100',      dateCls: 'text-blue-500',   nameCls: 'font-semibold text-blue-800', badge: 'bg-blue-400 text-white'    },
  nho:   { label: 'LỄ NHỚ',   rowCls: 'hover:bg-gray-50',                                         dateCls: 'text-gray-400',   nameCls: 'text-gray-600',               badge: 'bg-gray-200 text-gray-500' },
};
const ROW_DEFAULT = 'hover:bg-gray-50';

const FeastItem = ({ le }) => {
  const { t } = useTranslation();
  const cap     = le.cap ? CAP_CONFIG[le.cap] : null;
  const rowCls  = cap ? cap.rowCls  : ROW_DEFAULT;
  const dateCls = cap ? cap.dateCls : 'text-gray-400';
  const nameCls = cap ? cap.nameCls : 'text-gray-700';

  return (
    <li className={`flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors ${rowCls}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${MAU_DOT_SMALL[le.mauKey]}`} />
      <span className={`text-[10px] font-mono font-bold w-9 shrink-0 ${dateCls}`}>{le.ngay}</span>
      <span className="text-sm leading-none shrink-0">{le.icon}</span>
      <span className={`text-[11px] leading-tight flex-1 min-w-0 ${nameCls}`}>{le.ten}</span>
      {cap && (
        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${cap.badge}`}>
          {t(`liturgy.caps.${le.cap}`, cap.label)}
        </span>
      )}
    </li>
  );
};

const Sidebar = () => {
  const { t } = useTranslation();
  return (
  <aside className="flex flex-col gap-4">

    {/* Lịch lễ tháng — scrollable */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Calendar size={13} /> {t('liturgy.feastWidget')}
      </h3>

      {/* Wrapper với shadow top/bottom */}
      <div className="relative">
        {/* shadow top */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-white to-transparent z-10 rounded-t-xl" />

        {/* danh sách cuộn */}
        <ul className="scrollbar-thin flex flex-col gap-1 overflow-y-auto max-h-96 pr-1 py-1">
          {importantFeasts.map(le => <FeastItem key={le.ngay + le.ten} le={le} />)}
        </ul>

        {/* shadow bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white to-transparent z-10 rounded-b-xl" />
      </div>
    </div>

    {/* Quote */}
    <div className="bg-linear-to-br from-red-700 to-red-900 text-white rounded-2xl p-5">
      <Quote size={20} className="text-red-300 mb-3" />
      <p className="text-sm leading-relaxed italic font-light">{QUOTE.noi}</p>
      <p className="text-xs text-red-300 mt-3 font-semibold">{QUOTE.nguon}</p>
    </div>
  </aside>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const GioLe = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const now = useNow();
  const { thu, ngay, gio } = formatDate(now, i18n.language);

  const [loiChua, setLoiChua] = useState(null);
  const [loadingLC, setLoadingLC] = useState(true);

  useEffect(() => {
    fetchLoiChua()
      .then(d => setLoiChua(d))
      .finally(() => setLoadingLC(false));
  }, []);

  const tenLe   = loiChua?.name || loiChua?.title || loiChua?.liturgicalDay || '';
  const tinMung = loiChua?.gospel?.title || loiChua?.phucam?.trich || loiChua?.tinmung || '';
  const { mauKey, loai } = detectLiturgy(tenLe);

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">
              {t('liturgy.pageSubtitle')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {thu}
            </h1>
            <p className="text-base text-gray-500 font-medium mt-0.5">{ngay}</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
            <Clock size={15} className="text-red-600 shrink-0" />
            <span className="font-mono font-bold text-2xl tracking-widest text-red-700 tabular-nums">
              {gio}
            </span>
          </div>
        </div>

        {/* ── 2-col grid ── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* Cột trái */}
          <div>
            <LiturgyCards mauKey={mauKey} loai={loai} tenLe={tenLe} loading={loadingLC} />
            <MassSchedule now={now} />
            <GospelCard tinMung={tinMung} loading={loadingLC} onClick={() => navigate('/loi-chua')} />
          </div>

          {/* Cột phải */}
          <Sidebar />
        </div>
      </div>
    </main>
  );
};

export default GioLe;
