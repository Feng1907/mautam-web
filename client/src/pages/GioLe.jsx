import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shirt, BookOpen, Calendar, ChevronRight, Quote } from 'lucide-react';

// ─── Dữ liệu tĩnh ────────────────────────────────────────────────────────────

const LICH_LE = [
  { ngay: 'Ngày thường', gio: ['05:30', '18:00'] },
  { ngay: 'Chúa Nhật',   gio: ['05:30', '09:00', '17:00', '18:30'] },
];

const LE_THANG = [
  { ngay: '02/04', ten: 'Thứ Năm Tuần Thánh',   mauKey: 'trang', noiBat: false },
  { ngay: '03/04', ten: 'Thứ Sáu Tuần Thánh',   mauKey: 'do',    noiBat: false },
  { ngay: '05/04', ten: 'ĐẠI LỄ PHỤC SINH',      mauKey: 'trang', noiBat: true  },
  { ngay: '12/04', ten: 'CN II Phục Sinh',        mauKey: 'trang', noiBat: false },
  { ngay: '25/04', ten: 'Thánh Máccô',            mauKey: 'do',    noiBat: false },
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
  if (t.includes('thánh') || t.includes('chúa nhật'))              return { mauKey: 'trang', loai: 'Lễ Kính'     };
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

const THU_VN = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];

const formatVN = (date) => ({
  thu:  THU_VN[date.getDay()],
  ngay: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
  gio:  date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
});

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

const LoaiBadge = ({ loai }) => {
  const cls =
    loai === 'Lễ Trọng'    ? 'bg-red-100 text-red-700' :
    loai === 'Lễ Đặc Biệt' ? 'bg-purple-100 text-purple-700' :
    loai === 'Mùa Chay'    ? 'bg-purple-50 text-purple-600' :
    loai === 'Mùa Vọng'    ? 'bg-purple-50 text-purple-600' :
    loai === 'Lễ Kính'     ? 'bg-blue-50 text-blue-600' :
    'bg-gray-100 text-gray-500';
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>
      {loai}
    </span>
  );
};

// Cột trái — card màu áo + tên lễ
const LiturgyCards = ({ mauKey, loai, tenLe, loading }) => {
  const mau = MAU_AO[mauKey] || MAU_AO.xanh;
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* Màu áo */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 ${mau.card}`}>
        <div className={`w-11 h-11 rounded-full shrink-0 ${mau.dot} flex items-center justify-center shadow-sm`}>
          <Shirt size={20} className={mau.icon} />
        </div>
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-wider opacity-60 ${mau.text}`}>Áo lễ</p>
          <p className={`font-bold text-sm mt-0.5 ${mau.text}`}>{mau.label}</p>
        </div>
      </div>

      {/* Loại lễ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Phụng vụ hôm nay</p>
        {loading ? (
          <p className="text-xs text-gray-300 italic">Đang tải…</p>
        ) : tenLe ? (
          <>
            <p className="font-bold text-gray-800 text-sm leading-tight">{tenLe}</p>
            <LoaiBadge loai={loai} />
          </>
        ) : (
          <p className="text-xs text-gray-400 italic">Không tải được dữ liệu</p>
        )}
      </div>
    </div>
  );
};

// Bảng giờ lễ
const MassSchedule = ({ now }) => {
  const isChaNhat = now.getDay() === 0;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock size={13} /> Giờ lễ cố định
      </h3>
      <div className="flex flex-col gap-2.5">
        {LICH_LE.map(l => {
          const isCurrent = isChaNhat ? l.ngay === 'Chúa Nhật' : l.ngay === 'Ngày thường';
          return (
            <div key={l.ngay} className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold w-24 shrink-0 ${isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                {l.ngay}
                {isCurrent && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">hôm nay</span>}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {l.gio.map(g => {
                  const [h, m] = g.split(':').map(Number);
                  const isPast = isCurrent && (h * 60 + m) < nowMins;
                  return (
                    <span key={g} className={[
                      'font-mono text-xs font-semibold px-2.5 py-1 rounded-full border',
                      isPast ? 'bg-gray-50 text-gray-300 border-gray-100 line-through' :
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

// Gospel preview card
const GospelCard = ({ tinMung, loading, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md hover:from-amber-100 hover:to-orange-100 transition-all group"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-amber-700">
        <BookOpen size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Lời Chúa hôm nay</span>
      </div>
      <span className="text-amber-400 group-hover:translate-x-1 transition-transform">
        <ChevronRight size={16} />
      </span>
    </div>
    {loading ? (
      <p className="text-sm text-amber-300 italic">Đang tải…</p>
    ) : tinMung ? (
      <p className="text-sm font-semibold text-amber-800 leading-snug">{tinMung}</p>
    ) : (
      <p className="text-sm text-amber-600 italic">Bấm để đọc bài đọc hôm nay</p>
    )}
    <span className="mt-3 inline-block text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
      Đọc chi tiết →
    </span>
  </button>
);

// Sidebar — lịch lễ tháng
const Sidebar = () => (
  <aside className="flex flex-col gap-4">
    {/* Lịch lễ tháng */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Calendar size={13} /> Lễ quan trọng tháng 4/2026
      </h3>
      <ul className="flex flex-col gap-2">
        {LE_THANG.map(le => (
          <li key={le.ngay} className={[
            'flex items-center gap-2.5 rounded-xl px-3 py-2',
            le.noiBat ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50',
          ].join(' ')}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${MAU_DOT_SMALL[le.mauKey]}`} />
            <span className="text-[11px] font-mono font-semibold text-gray-500 w-10 shrink-0">{le.ngay}</span>
            <span className={`text-xs leading-tight ${le.noiBat ? 'font-bold text-amber-800' : 'font-medium text-gray-700'}`}>
              {le.ten}
            </span>
            {le.noiBat && (
              <span className="ml-auto text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">
                ĐẠI LỄ
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>

    {/* Quote */}
    <div className="bg-linear-to-br from-red-700 to-red-900 text-white rounded-2xl p-5">
      <Quote size={20} className="text-red-300 mb-3" />
      <p className="text-sm leading-relaxed italic font-light">{QUOTE.noi}</p>
      <p className="text-xs text-red-300 mt-3 font-semibold">{QUOTE.nguon}</p>
    </div>
  </aside>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const GioLe = () => {
  const navigate = useNavigate();
  const now = useNow();
  const { thu, ngay, gio } = formatVN(now);

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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Dashboard Phụng Vụ</p>
            <h1 className="text-2xl font-bold text-gray-900">{thu}, {ngay}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
            <Clock size={16} className="text-red-600" />
            <span className="font-mono font-bold text-xl tracking-widest text-red-700">{gio}</span>
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
