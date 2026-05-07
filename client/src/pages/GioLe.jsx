import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Shirt, BookOpen, Calendar, ChevronRight, Quote, RefreshCw, X, Sparkles } from 'lucide-react';
import api from '../services/api';

// ─── Hằng số ──────────────────────────────────────────────────────────────────

const QUOTE = {
  noi:   '"Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."',
  nguon: '— Thánh Anrê Phú Yên',
};

const THANG_HOA = 5; // Tháng 5 = Tháng Hoa kính Đức Mẹ

// ─── getLiturgicalColor ───────────────────────────────────────────────────────
// Ánh xạ màu từ romcal (tiếng Anh) HOẶC loichua.net (tiếng Việt) → mauKey nội bộ
// Hỗ trợ: 'White','white','trang' → 'trang' | 'Green','green','xanh' → 'xanh' ...
const getLiturgicalColor = (key = '') => {
  switch (key.toLowerCase().trim()) {
    case 'white':
    case 'gold':   // Gold (kim nhũ) dùng với màu Trắng
    case 'trang':  return 'trang';
    case 'red':
    case 'do':     return 'do';
    case 'purple':
    case 'violet':
    case 'tim':    return 'tim';
    case 'green':
    case 'xanh':   return 'xanh';
    case 'rose':
    case 'hong':   return 'hong';
    case 'black':
    case 'den':    return 'den';
    default:       return null;
  }
};

// ─── Màu áo phụng vụ ─────────────────────────────────────────────────────────

const MAU_AO = {
  trang: {
    label:      'Màu Trắng',
    season:     'Mùa Giáng Sinh / Phục Sinh',
    card:       'bg-linear-to-br from-slate-50 to-white border border-gray-200',
    cardHover:  'hover:from-gray-100 hover:to-slate-50',
    dot:        'bg-linear-to-br from-gray-200 to-white border-2 border-gray-300 shadow-inner',
    dotAccent:  'ring-2 ring-gray-200',
    icon:       'text-gray-500',
    text:       'text-gray-700',
    accent:     'text-gray-500',
    swatch:     'bg-gradient-to-br from-gray-100 to-white border border-gray-300',
  },
  do: {
    label:      'Màu Đỏ',
    season:     'Lễ Chúa Thánh Thần / Tử Đạo',
    card:       'bg-linear-to-br from-red-50 to-rose-50 border border-red-200',
    cardHover:  'hover:from-red-100 hover:to-rose-100',
    dot:        'bg-linear-to-br from-red-500 to-rose-600 shadow-red-200',
    dotAccent:  'ring-2 ring-red-300',
    icon:       'text-white',
    text:       'text-red-700',
    accent:     'text-red-400',
    swatch:     'bg-gradient-to-br from-red-400 to-rose-600',
  },
  tim: {
    label:      'Màu Tím',
    season:     'Mùa Vọng / Mùa Chay',
    card:       'bg-linear-to-br from-purple-50 to-violet-50 border border-purple-200',
    cardHover:  'hover:from-purple-100 hover:to-violet-100',
    dot:        'bg-linear-to-br from-purple-500 to-violet-600 shadow-purple-200',
    dotAccent:  'ring-2 ring-purple-300',
    icon:       'text-white',
    text:       'text-purple-700',
    accent:     'text-purple-400',
    swatch:     'bg-gradient-to-br from-purple-400 to-violet-600',
  },
  xanh: {
    label:      'Màu Xanh',
    season:     'Mùa Thường Niên',
    card:       'bg-linear-to-br from-green-50 to-emerald-50 border border-green-200',
    cardHover:  'hover:from-green-100 hover:to-emerald-100',
    dot:        'bg-linear-to-br from-green-500 to-emerald-600 shadow-green-200',
    dotAccent:  'ring-2 ring-green-300',
    icon:       'text-white',
    text:       'text-green-700',
    accent:     'text-green-400',
    swatch:     'bg-gradient-to-br from-green-400 to-emerald-600',
  },
  den: {
    label:      'Màu Đen',
    season:     'Lễ An Táng / Lễ Tro',
    card:       'bg-linear-to-br from-gray-100 to-gray-50 border border-gray-300',
    cardHover:  'hover:from-gray-200 hover:to-gray-100',
    dot:        'bg-linear-to-br from-gray-700 to-gray-900',
    dotAccent:  'ring-2 ring-gray-400',
    icon:       'text-white',
    text:       'text-gray-700',
    accent:     'text-gray-400',
    swatch:     'bg-gradient-to-br from-gray-600 to-gray-900',
  },
  hong: {
    label:      'Màu Hồng',
    season:     'CN III Mùa Vọng / CN IV Mùa Chay',
    card:       'bg-linear-to-br from-pink-50 to-rose-50 border border-pink-200',
    cardHover:  'hover:from-pink-100 hover:to-rose-100',
    dot:        'bg-linear-to-br from-pink-400 to-rose-500 shadow-pink-200',
    dotAccent:  'ring-2 ring-pink-300',
    icon:       'text-white',
    text:       'text-pink-700',
    accent:     'text-pink-400',
    swatch:     'bg-gradient-to-br from-pink-300 to-rose-500',
  },
  // Áo Trắng kết hợp Tháng Hoa: nền trắng + viền xanh da trời Đức Mẹ
  // Dùng khi activeMauKey === 'trang' && isThangHoa (Mùa Phục Sinh + Tháng 5)
  trangThangHoa: {
    label:      'Màu Trắng',
    season:     'Mùa Phục Sinh • Tháng Hoa 🌸',
    card:       'bg-linear-to-br from-white to-sky-50 border-2 border-sky-300',
    cardHover:  'hover:from-sky-50 hover:to-blue-50',
    dot:        'bg-linear-to-br from-gray-100 to-white border-2 border-sky-400 shadow-sky-200',
    dotAccent:  'ring-2 ring-sky-400 ring-offset-1',
    icon:       'text-sky-600',
    text:       'text-gray-700',
    accent:     'text-sky-500',
    swatch:     'bg-gradient-to-br from-sky-300 to-white border border-sky-300',
  },
  thangHoa: {
    label:      'Màu Xanh Da Trời',
    season:     'Tháng Hoa — Kính Đức Mẹ',
    card:       'bg-linear-to-br from-sky-50 to-blue-50 border border-sky-200',
    cardHover:  'hover:from-sky-100 hover:to-blue-100',
    dot:        'bg-linear-to-br from-sky-400 to-blue-500 shadow-sky-200',
    dotAccent:  'ring-2 ring-sky-300',
    icon:       'text-white',
    text:       'text-sky-700',
    accent:     'text-sky-400',
    swatch:     'bg-gradient-to-br from-sky-300 to-blue-500',
  },
};

const MAU_DOT_SMALL = {
  trang:    'bg-gray-300',
  do:       'bg-red-500',
  tim:      'bg-purple-500',
  xanh:     'bg-green-500',
  den:      'bg-gray-700',
  hong:     'bg-pink-400',
  thangHoa: 'bg-sky-400',
};

// Gradient nền trang theo màu áo (hiệu ứng thiêng liêng)
const PAGE_BG = {
  trang:    'from-slate-50 via-white to-gray-50',
  do:       'from-red-50 via-rose-50/40 to-gray-50',
  tim:      'from-purple-50 via-violet-50/40 to-gray-50',
  xanh:     'from-green-50 via-emerald-50/40 to-gray-50',
  den:      'from-gray-100 via-gray-50 to-white',
  hong:     'from-pink-50 via-rose-50/40 to-gray-50',
  thangHoa: 'from-sky-50 via-blue-50/40 to-white',
};

// ─── Badge cấp lễ (Romcal rank) ───────────────────────────────────────────────

const CAP_CONFIG = {
  dai: {
    label:   'ĐẠI LỄ',
    rowCls:  'bg-amber-50 border border-amber-200 hover:bg-amber-100',
    dateCls: 'text-amber-600',
    nameCls: 'font-bold text-amber-800',
    badge:   'bg-amber-500 text-white',
  },
  trong: {
    label:   'LỄ TRỌNG',
    rowCls:  'bg-red-50 border border-red-100 hover:bg-red-100',
    dateCls: 'text-red-500',
    nameCls: 'font-semibold text-red-800',
    badge:   'bg-red-500 text-white',
  },
  kinh: {
    label:   'LỄ KÍNH',
    rowCls:  'bg-orange-50 border border-orange-100 hover:bg-orange-100',
    dateCls: 'text-orange-500',
    nameCls: 'font-semibold text-orange-800',
    badge:   'bg-orange-400 text-white',
  },
  nho: {
    label:   'LỄ NHỚ',
    rowCls:  'hover:bg-gray-50',
    dateCls: 'text-gray-400',
    nameCls: 'text-gray-600',
    badge:   'bg-gray-200 text-gray-500',
  },
};

const CAP_TO_LOAI = {
  dai:   'Lễ Trọng',
  trong: 'Lễ Trọng',
  kinh:  'Lễ Kính',
  nho:   'Lễ Nhớ',
};

// ─── detectLiturgy — chỉ dùng khi romcal và API đều không có màu ─────────────
// Sửa lỗi: bổ sung "mùa phục sinh" để tránh nhầm sang Màu Xanh vào tháng 5
const detectLiturgy = (tenLe = '') => {
  const t = tenLe.toLowerCase();
  if (t.includes('lễ tro'))                                          return { mauKey: 'den',   loai: 'Lễ Đặc Biệt' };
  if (t.includes('thứ sáu tuần thánh') || t.includes('thương khó')) return { mauKey: 'do',    loai: 'Lễ Đặc Biệt' };
  if (t.includes('tuần thánh') || t.includes('lễ lá'))              return { mauKey: 'do',    loai: 'Lễ Đặc Biệt' };
  // ↓ FIX: "Thứ X tuần Y Mùa Phục Sinh" phải là Màu Trắng, không phải Xanh
  if (t.includes('mùa phục sinh') || t.includes('phục sinh') ||
      t.includes('bát nhật'))                                        return { mauKey: 'trang', loai: 'Mùa Phục Sinh' };
  if (t.includes('giáng sinh') || t.includes('hiển linh') ||
      t.includes('lên trời')   || t.includes('ba ngôi') ||
      t.includes('mình máu'))                                        return { mauKey: 'trang', loai: 'Lễ Trọng'     };
  if (t.includes('iii mùa vọng') || t.includes('iv mùa chay'))      return { mauKey: 'hong',  loai: 'Lễ Đặc Biệt' };
  if (t.includes('mùa chay') || t.includes('chay') ||
      t.includes('mùa vọng')  || t.includes('vọng'))                return { mauKey: 'tim',   loai: 'Mùa Chay/Vọng' };
  if (t.includes('tử đạo') || t.includes('hiện xuống') ||
      t.includes('thánh giá'))                                       return { mauKey: 'do',    loai: 'Lễ Trọng'    };
  if (t.includes('thánh sử') || t.includes('tông đồ') ||
      t.includes('tiến sĩ'))                                         return { mauKey: 'trang', loai: 'Lễ Kính'     };
  if (t.includes('thánh') || t.includes('chúa nhật'))               return { mauKey: 'trang', loai: 'Lễ Nhớ'      };
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

const formatDate = (date, locale) => {
  const lang = locale?.startsWith('en') ? 'en-US' : 'vi-VN';
  return {
    thu:  date.toLocaleDateString(lang, { weekday: 'long' }),
    ngay: date.toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    gio:  date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
  };
};

// ─── Fetch helpers ────────────────────────────────────────────────────────────

const fetchLoiChua = async () => {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
  try {
    const res = await api.get(`/loichua?date=${dateStr}`);
    return res.data.data;
  } catch { return null; }
};

const fetchLiturgyFeasts = async (month, year) => {
  try {
    const res  = await api.get('/liturgy/feasts', { params: { month, year } });
    const data = res.data || {};
    return {
      feasts:   data.feasts   || [],
      theme:    data.theme    || null,   // 'FlowerMonth' nếu tháng 5
      subColor: data.subColor || null,   // 'blue' nếu tháng 5
      note:     data.note     || null,
    };
  } catch {
    return { feasts: [], theme: null, subColor: null, note: null };
  }
};

// ─── RankBadge — ánh xạ trực tiếp từ rank romcal ────────────────────────────
// Dùng rank string gốc (SOLEMNITY, FEAST, MEMORIAL...) thay vì loai string
// trung gian để tránh sai mapping (ví dụ "Mùa Phục Sinh" → "LỄ TRỌNG").
//
// Quy tắc ẩn badge:
//   FERIA / COMMEMORATION / undefined → null (không render gì)
//   OPT_MEMORIAL                      → xám nhạt tùy chọn
const RANK_BADGE_CFG = {
  TRIDUUM:      { label: 'Tam Nhật Thánh',    cls: 'bg-amber-100 text-amber-700'  },
  SOLEMNITY:    { label: 'Lễ Trọng',          cls: 'bg-red-100 text-red-700'      },
  HOLY_WEEK:    { label: 'Tuần Thánh',        cls: 'bg-red-50 text-red-600'       },
  SUNDAY:       { label: 'Chúa Nhật',         cls: 'bg-red-50 text-red-500'       },
  FEAST:        { label: 'Lễ Kính',           cls: 'bg-orange-100 text-orange-600'},
  MEMORIAL:     { label: 'Lễ Nhớ',            cls: 'bg-gray-100 text-gray-500'    },
  OPT_MEMORIAL: { label: 'Lễ Nhớ Tùy Chọn',  cls: 'bg-gray-50 text-gray-400'     },
  // FERIA / COMMEMORATION → không có entry → trả null → ẩn badge
};

const RankBadge = ({ rank }) => {
  if (!rank) return null;
  const cfg = RANK_BADGE_CFG[rank];
  if (!cfg) return null;   // FERIA, COMMEMORATION, hoặc rank lạ → ẩn hoàn toàn
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};


// ─── LiturgyCards — Áo Lễ + Phụng Vụ Hôm Nay ────────────────────────────────
// activeMauKey: màu được tính theo thứ tự ưu tiên (romcal > API > detectLiturgy)
// isSolemnity:  true khi rank cao (dai/trong) → hiệu ứng shimmer
const LiturgyCards = ({
  activeMauKey, tenLe, loading,
  selectedFeast, isThangHoa, isSolemnity,
  onClearFeast,
}) => {
  const { t } = useTranslation();

  const displayTen = selectedFeast?.ten ?? tenLe;

  // Tháng Hoa + Màu Trắng (Phục Sinh) → variant đặc biệt có viền xanh Đức Mẹ
  const rawKey    = selectedFeast?.mauKey ?? activeMauKey;
  const displayKey = (!selectedFeast && isThangHoa && rawKey === 'trang')
    ? 'trangThangHoa'
    : rawKey;

  const mau = MAU_AO[displayKey] || MAU_AO.xanh;

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">

      {/* ── Card Áo Lễ ───────────────────────────────────────────────────── */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden transition-all ${mau.card} ${mau.cardHover}`}>

        {/* Shimmer animation khi lễ trọng */}
        {isSolemnity && !selectedFeast && (
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] pointer-events-none" />
        )}

        {/* Bông hoa Tháng Hoa */}
        {isThangHoa && !selectedFeast && (
          <span className="absolute top-2 right-2 text-base select-none opacity-50 animate-pulse">🌸</span>
        )}

        {/* Swatch màu + icon áo */}
        <div className="relative shrink-0">
          <div className={`w-12 h-12 rounded-full ${mau.dot} ${mau.dotAccent} flex items-center justify-center shadow-md`}>
            <Shirt size={22} className={mau.icon} />
          </div>
          {/* Chấm màu nhỏ ở góc */}
          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${mau.swatch}`} />
        </div>

        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-wider opacity-60 ${mau.text}`}>
            {t('liturgy.vestmentLabel')}
          </p>
          <p className={`font-black text-sm mt-0.5 leading-tight ${mau.text}`}>
            {t(`liturgy.colors.${displayKey === 'trangThangHoa' ? 'trang' : displayKey}`, mau.label)}
          </p>
          {/* Season chính — luôn hiển thị theo phụng vụ */}
          <p className={`text-[9px] mt-0.5 leading-tight truncate ${mau.accent}`}>
            {displayKey === 'trangThangHoa' ? 'Mùa Phục Sinh' : mau.season}
          </p>
          {/* Tháng Hoa — chỉ là nhãn trang trí phụ, KHÔNG phải màu áo */}
          {isThangHoa && !selectedFeast && (
            <p className="text-[9px] mt-0.5 text-sky-500 font-semibold flex items-center gap-0.5">
              🌸 Tâm tình Tháng Hoa
            </p>
          )}
        </div>
      </div>

      {/* ── Card Phụng Vụ Hôm Nay / Ngày Lễ Đã Chọn ───────────────────────── */}
      {/* isToday=true  → auto-select hôm nay: nền trắng, tiêu đề "Phụng vụ hôm nay" */}
      {/* isToday=false → user chọn tay: nền xanh nhạt, tiêu đề "Ngày lễ đã chọn"   */}
      <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-center gap-1.5 relative transition-colors duration-300
        ${selectedFeast && !selectedFeast.isToday
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-100'}`}>

        {/* Nút X — chỉ hiện khi user đã chọn tay (không phải auto-today) */}
        {selectedFeast && !selectedFeast.isToday && (
          <button
            onClick={onClearFeast}
            title="Quay về hôm nay"
            className="absolute top-2 right-2 text-blue-300 hover:text-blue-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}

        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
          {isSolemnity && selectedFeast?.isToday && <Sparkles size={10} className="text-amber-400" />}
          {selectedFeast && !selectedFeast.isToday
            ? 'Ngày lễ đã chọn'
            : t('liturgy.todayLabel')}
        </p>

        {loading ? (
          /* Skeleton loading — không hardcode text lễ nào */
          <div className="flex flex-col gap-1.5 animate-pulse">
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
            <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
          </div>
        ) : displayTen ? (
          <>
            {/* Icon lễ */}
            <span className="text-lg leading-none">{selectedFeast?.icon || '📅'}</span>
            {/* Tên lễ */}
            <p className="font-bold text-gray-800 text-sm leading-tight pr-4">{displayTen}</p>
            {/* Badge bậc lễ — dùng RankBadge với rank gốc từ romcal */}
            <RankBadge rank={selectedFeast?.rank} />
          </>
        ) : (
          <p className="text-xs text-gray-400 italic">{t('liturgy.noData')}</p>
        )}
      </div>
    </div>
  );
};

// ─── MassSchedule — có tint màu theo mùa ─────────────────────────────────────

const SCHEDULE_TINT = {
  trang: 'border-gray-100',
  do:    'border-red-100 bg-red-50/30',
  tim:   'border-purple-100 bg-purple-50/30',
  xanh:  'border-green-100',
  den:   'border-gray-200 bg-gray-50/50',
  hong:  'border-pink-100 bg-pink-50/30',
  thangHoa: 'border-sky-100 bg-sky-50/30',
};

const MassSchedule = ({ now, activeMauKey }) => {
  const { t }     = useTranslation();
  const isChaNhat = now.getDay() === 0;
  const nowMins   = now.getHours() * 60 + now.getMinutes();
  const tint      = SCHEDULE_TINT[activeMauKey] || SCHEDULE_TINT.xanh;

  const LICH = [
    { key: 'weekdays', label: t('liturgy.weekdays'), gio: ['05:30', '18:00'] },
    { key: 'sunday',   label: t('liturgy.sunday'),   gio: ['05:30', '09:00', '17:00', '18:30'] },
  ];

  return (
    <div className={`rounded-2xl border shadow-sm p-5 mb-4 bg-white ${tint}`}>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock size={13} /> {t('liturgy.scheduleTitle')}
      </h3>
      <div className="flex flex-col gap-2.5">
        {LICH.map(l => {
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
                      'font-mono text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors',
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

// ─── GospelCard ───────────────────────────────────────────────────────────────

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
        <p className="text-sm font-semibold text-amber-800 leading-snug" style={{ fontFamily: '"EB Garamond", serif', fontSize: '1.1rem' }}>{tinMung}</p>
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

const FeastItem = ({ le, isToday, isSelected, onSelect }) => {
  const { t }        = useTranslation();
  const cap          = le.cap ? CAP_CONFIG[le.cap] : null;
  const isBonMang    = !!le.isBonMang;

  // Thứ tự ưu tiên style: isSelected > isBonMang > isToday > cap > default
  let rowCls, dateCls, nameCls;
  if (isSelected) {
    rowCls  = 'bg-blue-100 border border-blue-300 shadow-sm ring-1 ring-blue-400';
    dateCls = 'text-blue-600 font-black';
    nameCls = 'font-bold text-blue-800';
  } else if (isBonMang) {
    // Bổn mạng xứ đoàn: đỏ rực rỡ + shimmer nhẹ
    rowCls  = 'bg-linear-to-r from-red-100 to-rose-50 border-2 border-red-400 shadow-md';
    dateCls = 'text-red-600 font-black';
    nameCls = 'font-black text-red-900';
  } else if (isToday) {
    rowCls  = 'bg-yellow-50 border border-yellow-300 shadow-sm ring-1 ring-yellow-300';
    dateCls = 'text-yellow-600 font-black';
    nameCls = 'font-bold text-yellow-800';
  } else {
    rowCls  = cap ? cap.rowCls  : 'hover:bg-gray-50';
    dateCls = cap ? cap.dateCls : 'text-gray-400';
    nameCls = cap ? cap.nameCls : 'text-gray-700';
  }

  return (
    <button
      onClick={() => onSelect(le)}
      className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all cursor-pointer text-left ${rowCls}`}
    >
      {/* Priority badges — chỉ hiện 1 badge ưu tiên nhất */}
      {isSelected ? (
        <span className="text-[9px] font-black text-blue-600 bg-blue-200 px-1.5 py-0.5 rounded-full shrink-0">ĐÃ CHỌN</span>
      ) : isBonMang ? (
        <span className="text-[8px] font-black text-white bg-red-600 border border-red-800 px-1.5 py-0.5 rounded-full shrink-0 leading-tight">
          BỔN MẠNG<br />XỨ ĐOÀN
        </span>
      ) : isToday ? (
        <span className="text-[9px] font-black text-yellow-600 bg-yellow-200 px-1.5 py-0.5 rounded-full shrink-0">HÔM NAY</span>
      ) : null}

      <span className={`w-2 h-2 rounded-full shrink-0 ${MAU_DOT_SMALL[le.mauKey] || 'bg-gray-300'}`} />
      <span className={`text-[10px] font-mono font-bold w-9 shrink-0 ${dateCls}`}>{le.ngay}</span>
      <span className="text-sm leading-none shrink-0">{le.icon}</span>
      <span className={`text-[11px] leading-tight flex-1 min-w-0 ${nameCls}`}>{le.ten}</span>

      {/* Badge cấp lễ */}
      {cap && (
        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${cap.badge}`}>
          {t(`liturgy.caps.${le.cap}`, cap.label)}
        </span>
      )}
    </button>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ feasts, loadingFeasts, month, year, todayStr, selectedFeast, monthMeta, onSelect, onRefresh }) => {
  const { t }       = useTranslation();
  const todayRef    = useRef(null);
  const bonMangRef  = useRef(null);

  // Auto-scroll: ưu tiên ngày hôm nay, fallback về bổn mạng nếu có trong tháng
  useEffect(() => {
    if (loadingFeasts) return;
    setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (bonMangRef.current) {
        bonMangRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [loadingFeasts]);

  const isThangHoa = month === THANG_HOA;

  return (
    <aside className="flex flex-col gap-4">

      {/* Tháng Hoa banner */}
      {isThangHoa && (
        <div className="bg-linear-to-r from-sky-100 to-blue-50 border border-sky-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl animate-pulse">🌸</span>
          <div>
            <p className="text-xs font-black text-sky-700 uppercase tracking-wider">Tháng Hoa</p>
            <p className="text-[11px] text-sky-500 leading-tight">
              {monthMeta?.note || 'Kính dâng Đức Mẹ Maria'}
            </p>
          </div>
        </div>
      )}

      {/* Danh sách ngày lễ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} />
            {`LỄ THÁNG ${month} / ${year}`}
            {isThangHoa && <span className="text-base leading-none">🌸</span>}
          </h3>
          <button
            onClick={onRefresh}
            title="Làm mới"
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <RefreshCw size={13} className={loadingFeasts ? 'animate-spin' : ''} />
          </button>
        </div>

        {!loadingFeasts && feasts.length > 0 && (
          <p className="text-[10px] text-gray-300 italic mb-2">Bấm vào ngày lễ để xem phụng vụ</p>
        )}

        <div className="relative">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-white to-transparent z-10" />
          <ul className="scrollbar-thin flex flex-col gap-1 overflow-y-auto max-h-96 pr-1 py-1">
            {loadingFeasts ? (
              <li className="text-center py-8 text-gray-300 text-xs italic">{t('liturgy.loading')}</li>
            ) : feasts.length === 0 ? (
              <li className="text-center py-8 text-gray-300 text-xs italic">{t('liturgy.noData')}</li>
            ) : feasts.map(le => {
              const isToday    = le.ngay === todayStr;
              const isSelected = selectedFeast?.ngay === le.ngay && selectedFeast?.ten === le.ten;
              // Gắn ref: hôm nay ưu tiên, sau đó bổn mạng
              const itemRef = isToday ? todayRef : (le.isBonMang ? bonMangRef : null);
              return (
                <li key={le.ngay + le.ten} ref={itemRef}>
                  <FeastItem le={le} isToday={isToday} isSelected={isSelected} onSelect={onSelect} />
                </li>
              );
            })}
          </ul>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white to-transparent z-10" />
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

// ─── Page GioLe ───────────────────────────────────────────────────────────────

const GioLe = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const now = useNow();
  const { thu, ngay, gio } = formatDate(now, i18n.language);

  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();
  const isThangHoa   = currentMonth === THANG_HOA;

  const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}`;

  // ── State ─────────────────────────────────────────────────────────────────
  const [loiChua,       setLoiChua]       = useState(null);
  const [loadingLC,     setLoadingLC]     = useState(true);
  const [feasts,        setFeasts]        = useState([]);
  const [loadingFeasts, setLoadingFeasts] = useState(true);
  // null  = chưa chọn gì (chờ auto-select)
  // object = lễ đang hiển thị (hôm nay hoặc user click)
  const [selectedFeast, setSelectedFeast] = useState(null);
  const [monthMeta,     setMonthMeta]     = useState({});

  const fetchedMonthRef = useRef(null);
  const fetchedDayRef   = useRef(null);
  const feastsRef       = useRef([]);   // ref để midnight timeout đọc mà không cần deps

  // ── Helper: tìm & tự động chọn ngày hôm nay từ mảng feasts ───────────────
  // Gọi sau mỗi lần feasts thay đổi (fetch mới hoặc reset qua đêm)
  const autoSelectToday = useCallback((feastsData) => {
    const d   = new Date();
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const ngay = `${dd}/${mm}`;
    const entry = feastsData.find(f => f.ngay === ngay);

    if (entry) {
      setSelectedFeast({
        ten:     entry.ten,
        mauKey:  entry.mauKey,
        loai:    CAP_TO_LOAI[entry.cap] || detectLiturgy(entry.ten).loai,
        icon:    entry.icon,
        ngay:    entry.ngay,
        rank:    entry.rank,    // ← rank gốc từ romcal (SOLEMNITY/FEAST/FERIA…)
        isToday: true,
      });
    } else {
      // Ngày không tìm thấy trong feasts (hiếm) — hiện ngày thường
      const seasonEntry = feastsData[0];
      setSelectedFeast({
        ten:     `${dd}/${mm} — Ngày Thường Niên`,
        mauKey:  seasonEntry?.mauKey || 'xanh',
        loai:    'Lễ Thường',
        icon:    '📅',
        ngay:    ngay,
        rank:    'FERIA',       // FERIA → RankBadge trả null → không hiện badge
        isToday: true,
      });
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectFeast = useCallback((le) => {
    const d   = new Date();
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const isToday = le.ngay === `${dd}/${mm}`;
    setSelectedFeast({
      ten:     le.ten,
      mauKey:  le.mauKey,
      loai:    CAP_TO_LOAI[le.cap] || detectLiturgy(le.ten).loai,
      icon:    le.icon,
      ngay:    le.ngay,
      rank:    le.rank,      // ← rank gốc từ romcal
      isToday,               // click đúng ngày hôm nay → giữ header "Phụng vụ hôm nay"
    });
  }, []);

  // Nút X: quay về dữ liệu hôm nay (không phải null rỗng)
  const handleClearFeast = useCallback(() => {
    autoSelectToday(feastsRef.current);
  }, [autoSelectToday]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const loadLoiChua = useCallback(async () => {
    setLoadingLC(true);
    const d = await fetchLoiChua();
    setLoiChua(d);
    setLoadingLC(false);
    const n = new Date();
    fetchedDayRef.current = `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
  }, []);

  const loadFeasts = useCallback(async (month, year) => {
    setLoadingFeasts(true);
    const { feasts: data, theme, subColor, note } = await fetchLiturgyFeasts(month, year);
    feastsRef.current = data;         // cập nhật ref để các timeout đọc được
    setFeasts(data);
    setMonthMeta({ theme, subColor, note });
    setLoadingFeasts(false);
    fetchedMonthRef.current = `${year}-${month}`;

    // ── Auto-select ngày hôm nay ngay sau khi fetch xong ──────────────────
    // Chỉ auto-select khi đang xem tháng hiện tại
    const today = new Date();
    if (today.getMonth() + 1 === month && today.getFullYear() === year) {
      autoSelectToday(data);
    } else {
      setSelectedFeast(null);  // Xem tháng khác → bỏ selection
    }
  }, [autoSelectToday]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadLoiChua(); }, [loadLoiChua]);
  useEffect(() => { loadFeasts(currentMonth, currentYear); }, []); // eslint-disable-line

  // ── Midnight refresh — tự chuyển dữ liệu đúng lúc 00:00:05 ───────────────
  // Không dùng setInterval mà dùng setTimeout đệ quy để đánh đúng nửa đêm.
  useEffect(() => {
    let tid;
    const scheduleAtMidnight = () => {
      const now  = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0);              // 00:00:05 ngày hôm sau
      const ms = next.getTime() - now.getTime();

      tid = setTimeout(() => {
        const d     = new Date();
        const year  = d.getFullYear();
        const month = d.getMonth() + 1;
        const monKey = `${year}-${month}`;

        loadLoiChua();   // Lời Chúa ngày mới

        if (fetchedMonthRef.current !== monKey) {
          // Qua tháng mới → fetch lại toàn bộ lịch
          loadFeasts(month, year);
        } else {
          // Cùng tháng, chỉ đổi ngày → auto-select hôm nay từ feasts đã có
          autoSelectToday(feastsRef.current);
        }

        scheduleAtMidnight();  // hẹn nửa đêm tiếp theo
      }, ms);
    };

    scheduleAtMidnight();
    return () => clearTimeout(tid);
  }, [loadLoiChua, loadFeasts, autoSelectToday]);

  // ── Tính activeMauKey theo thứ tự ưu tiên ────────────────────────────────
  // 1. Romcal (chính xác nhất — tự tính mùa Phục Sinh, Thăng Thiên, Hiện Xuống…)
  // 2. loichua.net color field
  // 3. detectLiturgy từ tên lễ (fallback cuối)
  const todayFeast = feasts.find(f => f.ngay === todayStr);

  // Tên lễ: ưu tiên loichua.net, fallback sang romcal (đã dịch tiếng Việt)
  const tenLe   = loiChua?.name || loiChua?.title || loiChua?.liturgicalDay
                  || todayFeast?.ten || '';
  const tinMung = loiChua?.gospel?.title || loiChua?.phucam?.trich || loiChua?.tinmung || '';

  const apiColorRaw = loiChua?.color || loiChua?.mau || loiChua?.liturgicalColor || '';
  const apiMauKey   = getLiturgicalColor(apiColorRaw);
  const { mauKey: fallbackMauKey } = detectLiturgy(tenLe);

  // activeMauKey — không dùng 'thangHoa' làm màu áo (tránh hiểu lầm phụng vụ)
  // Tháng Hoa chỉ là yếu tố trang trí phụ, màu áo vẫn theo romcal/API
  const activeMauKey = todayFeast?.mauKey || apiMauKey || fallbackMauKey;

  // Lễ trọng = có hiệu ứng shimmer
  const isSolemnity = ['dai', 'trong'].includes(todayFeast?.cap ?? '')
    || ['SOLEMNITY', 'TRIDUUM'].includes(todayFeast?.rank ?? '');

  // Gradient nền trang
  const pageBg = PAGE_BG[activeMauKey] || PAGE_BG.xanh;

  return (
    <main className={`flex-1 min-h-screen bg-linear-to-br ${pageBg} transition-all duration-700`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1 flex items-center gap-1">
              {t('liturgy.pageSubtitle')}
              {isThangHoa && <span className="text-base leading-none">🌸</span>}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{thu}</h1>
            <p className="text-base text-gray-500 font-medium mt-0.5">{ngay}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/60 shadow-sm">
            <Clock size={15} className="text-red-600 shrink-0" />
            <span className="font-mono font-bold text-2xl tracking-widest text-red-700 tabular-nums">
              {gio}
            </span>
          </div>
        </div>

        {/* ── 2-col grid ── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

          <div>
            <LiturgyCards
              activeMauKey={activeMauKey}
              tenLe={tenLe}
              loading={loadingLC || loadingFeasts}
              selectedFeast={selectedFeast}
              isThangHoa={isThangHoa}
              isSolemnity={isSolemnity}
              onClearFeast={handleClearFeast}
            />
            <MassSchedule now={now} activeMauKey={activeMauKey} />
            <GospelCard tinMung={tinMung} loading={loadingLC} onClick={() => navigate('/loi-chua')} />
          </div>

          <Sidebar
            feasts={feasts}
            loadingFeasts={loadingFeasts}
            month={currentMonth}
            year={currentYear}
            todayStr={todayStr}
            selectedFeast={selectedFeast}
            monthMeta={monthMeta}
            onSelect={handleSelectFeast}
            onRefresh={() => loadFeasts(currentMonth, currentYear)}
          />
        </div>
      </div>
    </main>
  );
};

export default GioLe;
