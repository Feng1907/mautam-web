import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tent, Flame, Crown, ScrollText, Heart,
  Droplets, KeyRound, BookOpen,
  Tag, Zap, Shield, Lightbulb,
  ChevronDown, ChevronUp, Sparkles,
  Trophy, X as XIcon, CheckCircle2, ImageOff,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU — 9 nhân vật, Jesus ở vị trí [4] (chính giữa hàng 2)
// Grid 3×3:  [0 Abraham] [1 Moses]  [2 David]
//            [3 Isaiah]  [4 JESUS]  [5 Mary]
//            [6 John]    [7 Peter]  [8 Paul]
//
// Đặt file ảnh tại: /public/images/characters/{id}.jpg  (tỉ lệ 4:3 hoặc 1:1)
// ═══════════════════════════════════════════════════════════════════════════════

const COLLECTION = [
  {
    id: 'abraham', era: 'ot',
    badge: 'Tổ phụ', badgeHex: '#D97706', badgeRgb: '217,119,6',
    name: 'Abraham', nameHebrew: 'אַבְרָהָם', period: '~2000 TCN',
    LucideIcon: Tent,
    heroHex: '#CD853F', heroRgb: '205,133,63',
    imageUrl: '/images/characters/abraham.jpg',
    nameMeaning: 'Từ "Abram" (cha được tôn trọng) → "Abraham" (cha của nhiều dân tộc) sau Giao ước cắt bì (St 17,5).',
    mainEvent: 'Rời quê hương Ur theo tiếng gọi Thiên Chúa; nhận Giao ước dòng dõi đông như sao; dâng con trai Isaac trong thử thách tột đỉnh.',
    role: 'Nền tảng Giao ước Cứu độ — qua Abraham, mọi dân tộc được chúc phúc và đón nhận ơn cứu độ trong Đức Kitô.',
    lesson: 'Đức tin đích thực không cần thấy trước kết quả — chỉ cần bước đi trong tin tưởng vào Đấng đang dẫn đường.',
    verse: '"Bởi đức tin, Abraham đã vâng nghe tiếng gọi mà ra đi, dù không biết mình đi đâu." — Hr 11,8',
    fulfillment: 'Đức Giêsu là "Con cháu Abraham" (Mt 1,1). Mọi người tin đều là "dòng dõi Abraham" (Rm 4,16).',
    bibleRef: 'St 12 · 15 · 17 · 22',
  },
  {
    id: 'moses', era: 'ot',
    badge: 'Xuất hành', badgeHex: '#3B82F6', badgeRgb: '59,130,246',
    name: 'Môsê', nameHebrew: 'מֹשֶׁה', period: '~1318 TCN',
    LucideIcon: Flame,
    heroHex: '#60A5FA', heroRgb: '96,165,250',
    imageUrl: '/images/characters/moses.jpg',
    nameMeaning: '"Được kéo ra khỏi nước" — công chúa Ai Cập đặt khi vớt ông từ sông Nile lúc còn là trẻ sơ sinh (Xh 2,10).',
    mainEvent: 'Gặp Thiên Chúa qua bụi gai lửa (Xh 3); lãnh đạo Xuất hành khỏi Ai Cập; nhận Mười Điều Răn trên núi Sinai.',
    role: 'Trung gian Giao ước Sinai, người lãnh đạo Xuất hành — hình bóng trực tiếp của Đức Kitô là Trung gian Giao ước Mới.',
    lesson: 'Thiên Chúa không chọn người tài giỏi — Ngài chọn người khiêm tốn và làm cho họ trở nên tài. "Ta sẽ ở cùng ngươi."',
    verse: '"Ta là Đấng Ta Là (YHWH). Đây là danh Ta đến muôn đời." — Xh 3,14–15',
    fulfillment: '"Pháp luật đến từ Môsê, còn ân sủng và sự thật đến từ Đức Giêsu Kitô." — Ga 1,17',
    bibleRef: 'Xh 3 · 14 · 20 · Đnl 34',
  },
  {
    id: 'david', era: 'ot',
    badge: 'Vương quốc', badgeHex: '#A855F7', badgeRgb: '168,85,247',
    name: 'Đavít', nameHebrew: 'דָּוִד', period: '~1040 TCN',
    LucideIcon: Crown,
    heroHex: '#C084FC', heroRgb: '192,132,252',
    imageUrl: '/images/characters/david.jpg',
    nameMeaning: '"Người được yêu thương" — Thiên Chúa gọi ông là "người theo lòng Ta" (Cv 13,22).',
    mainEvent: 'Được xức dầu từ người chăn chiên; chiến thắng Gôliát bằng đức tin; nhận Giao ước "dòng dõi trị vì đời đời" (2Sm 7).',
    role: 'Giao ước Đavít là nền tảng cho niềm hy vọng Mêsia. "Con vua Đavít" là tước hiệu Mêsia căn bản trong Tân Ước.',
    lesson: 'Thiên Chúa không nhìn vẻ bề ngoài — "Người xét theo con mắt loài người, còn Ta thì thấy tâm lòng." (1Sm 16,7)',
    verse: '"Ta sẽ lập dòng dõi ngươi... vương triều ngươi sẽ kiên vững đến muôn đời." — 2Sm 7,12–13',
    fulfillment: 'Sứ thần nói với Maria: "Thiên Chúa sẽ ban cho Người ngôi báu Đavít tổ tiên." — Lc 1,32',
    bibleRef: '1Sm 16 · 17 · 2Sm 7 · Tv 22 · 51',
  },
  {
    id: 'isaiah', era: 'ot',
    badge: 'Ngôn sứ', badgeHex: '#F97316', badgeRgb: '249,115,22',
    name: 'Isaia', nameHebrew: 'יְשַׁעְיָהוּ', period: '~740 TCN',
    LucideIcon: ScrollText,
    heroHex: '#FB923C', heroRgb: '251,146,60',
    imageUrl: '/images/characters/isaiah.jpg',
    nameMeaning: '"Ơn cứu độ của YHWH" — tên ông chứa đựng sứ điệp cả cuộc đời.',
    mainEvent: 'Thị kiến ngai thánh (Is 6); tiên báo trinh nữ thụ thai Emmanuel (Is 7,14); mô tả Người Tôi Tớ đau khổ (Is 53).',
    role: '"Tin Mừng thứ năm" — mô tả Đức Kitô chính xác hơn bất kỳ sách Cựu Ước nào, viết trước ~700 năm.',
    lesson: '"Này con đây, xin hãy sai con đi." (Is 6,8) — Sẵn sàng đáp tiếng Chúa ngay cả khi cảm thấy bất xứng.',
    verse: '"Vì tội lỗi ta mà Người bị đâm thâu; vì sự gian ác ta mà Người bị nghiền nát." — Is 53,5',
    fulfillment: 'Đức Giêsu đọc Is 61 tại Nadarét: "Hôm nay ứng nghiệm lời Kinh Thánh này trước mặt anh em." — Lc 4,21',
    bibleRef: 'Is 6 · 7,14 · 40,3 · 53 · 61',
  },
  {
    id: 'jesus', era: 'nt', isCenter: true,
    badge: 'Trung tâm', badgeHex: '#FBBF24', badgeRgb: '251,191,36',
    name: 'Đức Giêsu Kitô', nameHebrew: 'יֵשׁוּעַ הַמָּשִׁיחַ', period: '~4 TCN – 30 CN',
    LucideIcon: null,
    heroHex: '#FBBF24', heroRgb: '251,191,36',
    imageUrl: '/images/characters/jesus.jpg',
    nameMeaning: '"Giêsu" = YHWH cứu độ · "Kitô" = Đấng được Xức dầu. Tên duy nhất chứa đựng trọn vẹn chương trình cứu độ.',
    mainEvent: 'Nhập thể tại Bêlem; Sứ vụ 3 năm rao giảng & phép lạ; Tử nạn thập giá đền tội nhân loại; Phục sinh ngày thứ ba.',
    role: 'Alpha và Omega — Trung tâm và Mục tiêu toàn bộ Lịch sử Cứu độ. Mọi Cựu Ước hướng về Ngài; mọi Tân Ước xuất phát từ Ngài.',
    lesson: 'Thiên Chúa không chỉ gửi sứ điệp — Ngài đến gặp trực tiếp. Tình yêu Thiên Chúa nhập thể, chịu chết và sống lại vì mỗi người.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta... đầy ân sủng và sự thật." — Ga 1,14',
    fulfillment: 'Ứng nghiệm toàn bộ Cựu Ước: Chiên Vượt Qua đích thực, Đền thờ đích thực, Đavít đích thực — và là Thiên Chúa.',
    bibleRef: 'Ga 1 · Mt 5 · Mc 1 · Lc 23–24',
  },
  {
    id: 'mary', era: 'nt',
    badge: 'Ứng nghiệm', badgeHex: '#10B981', badgeRgb: '16,185,129',
    name: 'Đức Maria', nameHebrew: 'מִרְיָם', period: '~18 TCN',
    LucideIcon: Heart,
    heroHex: '#F472B6', heroRgb: '244,114,182',
    imageUrl: '/images/characters/mary.jpg',
    nameMeaning: '"Miriam" — "Được yêu thương", "Ngôi sao biển". Mẹ là "Eva Mới": tiếng "xin vâng" đảo ngược tiếng "không" của Eva.',
    mainEvent: 'Tiếng "Xin vâng" với sứ thần (Lc 1); sinh Chúa Giêsu tại Bêlem; nói "Người bảo gì, hãy làm đó"; đứng vững dưới Thập giá.',
    role: 'Mẹ Thiên Chúa (Theotokos) — "Hòm Bia Giao ước Mới", mang Đức Kitô đến thế gian. Mẫu gương đức tin hoàn hảo nhất.',
    lesson: 'Một tiếng "xin vâng" khiêm tốn đã mở cánh cửa nhập thể. Chúng ta được gọi cộng tác với ơn Thiên Chúa.',
    verse: '"Này tôi là tôi tớ Đức Chúa, xin hãy thực hiện cho tôi theo lời sứ thần." — Lc 1,38',
    fulfillment: 'Ứng nghiệm Is 7,14: "Này đây trinh nữ sẽ thụ thai và sinh hạ một con trai, đặt tên là Emmanuel."',
    bibleRef: 'Lc 1,26–55 · Ga 2,5 · Ga 19,25–27',
  },
  {
    id: 'john', era: 'nt',
    badge: 'Ứng nghiệm', badgeHex: '#10B981', badgeRgb: '16,185,129',
    name: 'Gioan Tẩy Giả', nameHebrew: 'יוֹחָנָן', period: '~5 TCN',
    LucideIcon: Droplets,
    heroHex: '#38BDF8', heroRgb: '56,189,248',
    imageUrl: '/images/characters/john.jpg',
    nameMeaning: '"Yohanan" = YHWH đã thương xót / Thiên Chúa ban ơn. Sứ thần Gabriel đặt tên trước khi sinh — báo hiệu ông là hồng ân đặc biệt.',
    mainEvent: 'Rao giảng hoán cải ở sông Jordan; làm phép rửa cho Đức Giêsu; công bố "Đây là Chiên Thiên Chúa!"; tử đạo vì nói sự thật.',
    role: '"Người vĩ đại nhất sinh ra từ người phụ nữ" (Mt 11,11) — cầu nối cuối cùng giữa Cựu Ước và Tân Ước.',
    lesson: '"Người phải lớn lên, còn tôi phải nhỏ lại." (Ga 3,30) — Vinh quang nằm ở việc chỉ người khác đến Chúa.',
    verse: '"Đây là Chiên Thiên Chúa, Đấng xóa bỏ tội trần gian!" — Ga 1,29',
    fulfillment: 'Ứng nghiệm Is 40,3 và Ml 3,1: "Ta sai sứ giả đi trước mặt Ta." Gioan là "Êlia mới" dọn đường.',
    bibleRef: 'Mc 1,1–8 · Lc 1 · Ga 1,29 · Ga 3,30',
  },
  {
    id: 'peter', era: 'nt',
    badge: 'Ứng nghiệm', badgeHex: '#10B981', badgeRgb: '16,185,129',
    name: 'Thánh Phêrô', nameHebrew: 'שִׁמְעוֹן / Πέτρος', period: '~1 TCN',
    LucideIcon: KeyRound,
    heroHex: '#FBBF24', heroRgb: '251,191,36',
    imageUrl: '/images/characters/peter.jpg',
    nameMeaning: '"Kêpha/Petros" = Đá tảng. Tên nguyên thủy là Simon. Đức Giêsu đổi tên — hành động này chứa đựng sứ mạng lãnh đạo Hội Thánh.',
    mainEvent: 'Được gọi từ lưới cá; tuyên xưng "Thầy là Đức Kitô"; ba lần chối Chúa và hối hận; được phục hồi; giảng Ngũ Tuần.',
    role: 'Nền tảng hữu hình Hội Thánh — "Trên đá này Ta sẽ xây Hội Thánh Ta, và quyền lực tử thần sẽ không thắng nổi." — Mt 16,18',
    lesson: 'Sự vấp ngã không phải là kết thúc — Tình yêu và ăn năn thật lòng luôn được Chúa phục hồi. Ân sủng mạnh hơn tội lỗi.',
    verse: '"Lạy Thầy, Thầy biết rõ mọi sự; Thầy biết con yêu mến Thầy." — Ga 21,17',
    fulfillment: 'Ứng nghiệm Ed 34: "Hãy chăn dắt chiên của Thầy." — Phêrô là người chăn chiên Hội Thánh.',
    bibleRef: 'Mt 4,18 · Mt 16,16 · Ga 21,15 · Cv 2',
  },
  {
    id: 'paul', era: 'nt',
    badge: 'Ứng nghiệm', badgeHex: '#10B981', badgeRgb: '16,185,129',
    name: 'Thánh Phaolô', nameHebrew: 'שָׁאוּל / Παῦλος', period: '~5 CN',
    LucideIcon: BookOpen,
    heroHex: '#34D399', heroRgb: '52,211,153',
    imageUrl: '/images/characters/paul.jpg',
    nameMeaning: '"Paulos" (Latin) = Nhỏ bé, khiêm tốn. Tên gốc là Saolê. Sau biến cố Damascus, ông dùng Paulos — dấu hiệu biến đổi căn bản.',
    mainEvent: 'Bắt bớ Kitô hữu; gặp Đức Kitô phục sinh trên đường Damascus; 3 chuyến truyền giáo; viết 13 thư Tân Ước; tử đạo tại Roma.',
    role: '"Tông đồ dân ngoại" — người đem Tin Mừng vượt Palestine đến toàn Đế quốc Roma. 13 thư là nền thần học Kitô giáo.',
    lesson: '"Sức mạnh của Thầy được biểu lộ trong sự yếu đuối." (2Cr 12,9) — Sức mạnh thật đến từ Chúa, không từ bản thân.',
    verse: '"Tôi sống, nhưng không còn là tôi sống nữa, mà là Đức Kitô sống trong tôi." — Gl 2,20',
    fulfillment: 'Ứng nghiệm Is 49,6: "Ta đặt ngươi làm ánh sáng muôn dân, để ơn cứu độ lan tràn đến tận cùng trái đất."',
    bibleRef: 'Cv 9 · Rm · 1Cr · Gl 2,20 · Pl 4',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS SVG (Lucide không có Cross icon)
// ═══════════════════════════════════════════════════════════════════════════════

const CrossSVG = ({ size = 36, color = '#FBBF24' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
    <rect x="15" y="2" width="6" height="32" rx="3" fill={color} />
    <rect x="2" y="11" width="32" height="6" rx="3" fill={color} />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE WITH FALLBACK — grayscale animation driven by parent variants
// ═══════════════════════════════════════════════════════════════════════════════

const ImageWithFallback = ({ char }) => {
  const [hasError, setHasError] = useState(false);
  const IconComp = char.LucideIcon;
  const showFallback = hasError || !char.imageUrl;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      {showFallback ? (
        /* ── Gradient + Icon fallback ── */
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse 75% 75% at 50% 40%, rgba(${char.heroRgb},0.32) 0%, rgba(2,6,23,0.96) 100%)`,
          }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
            {char.isCenter && (
              <div className="absolute w-28 h-28 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.03)' }} />
            )}
          </div>

          {/* Icon */}
          <motion.div
            className="relative z-10"
            style={{ filter: `drop-shadow(0 0 ${char.isCenter ? 24 : 14}px rgba(${char.heroRgb},0.7))` }}
            variants={{
              rest:  { scale: 1,    opacity: 0.75 },
              hover: { scale: 1.12, opacity: 1 },
            }}
            transition={{ duration: 0.3 }}
          >
            {char.isCenter
              ? <CrossSVG size={char.isCenter ? 44 : 32} color={char.heroHex} />
              : IconComp && <IconComp size={32} style={{ color: char.heroHex }} strokeWidth={1.4} />
            }
          </motion.div>

          {/* ImageOff indicator — only when URL was provided but failed */}
          {hasError && char.imageUrl && (
            <div className="absolute bottom-2 right-2">
              <ImageOff size={11} style={{ color: 'rgba(255,255,255,0.18)' }} />
            </div>
          )}
        </div>
      ) : (
        /* ── Real image with grayscale + glow animation ── */
        <>
          {/* Glow layer — bừng sáng khi hover theo màu nhân vật */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            variants={{
              rest:  { opacity: 0 },
              hover: { opacity: 1 },
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(${char.heroRgb},0.28) 0%, transparent 70%)`,
            }}
          />

          {/* Ảnh — màu sắc nguyên bản, object-cover lấp đầy khung */}
          <img
            src={char.imageUrl}
            alt={char.name}
            className="relative z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
            loading="lazy"
            draggable={false}
          />
        </>
      )}

      {/* Bottom fade — blends image into card body */}
      <div
        className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgb(2 6 23) 0%, rgba(2,6,23,0.7) 50%, transparent 100%)',
        }}
      />

      {/* Center pulse ring (Jesus only) */}
      {char.isCenter && showFallback && (
        <motion.div
          className="absolute inset-0 rounded-t-2xl pointer-events-none"
          style={{ border: `1px solid rgba(${char.heroRgb},0.35)` }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = [
  { id: 'all', label: 'Tất cả',   count: COLLECTION.length },
  { id: 'ot',  label: 'Cựu Ước', count: COLLECTION.filter(c => c.era === 'ot').length },
  { id: 'nt',  label: 'Tân Ước', count: COLLECTION.filter(c => c.era === 'nt').length },
];

const FilterBar = ({ active, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {FILTERS.map(f => {
      const isActive = active === f.id;
      return (
        <motion.button
          key={f.id}
          onClick={() => onChange(f.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
            border:     isActive ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.08)',
            color:      isActive ? '#F59E0B' : 'rgba(255,255,255,0.45)',
          }}
          whileTap={{ scale: 0.96 }}
        >
          {f.label}
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)',
              color:      isActive ? '#F59E0B' : 'rgba(255,255,255,0.3)',
            }}
          >
            {f.count}
          </span>
        </motion.button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════

const ProgressBar = ({ explored, total }) => {
  const pct  = Math.round((explored / total) * 100);
  const done = explored === total;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: done
              ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #FDE68A)'
              : 'linear-gradient(90deg, #92400E, #D97706)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: done ? '#FBBF24' : 'rgba(255,255,255,0.35)' }}
        >
          {explored}/{total}
        </span>
        {done && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 300 }}
          >
            <CheckCircle2 size={15} style={{ color: '#FBBF24' }} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CELEBRATION BANNER
// ═══════════════════════════════════════════════════════════════════════════════

const CelebrationBanner = ({ onDismiss }) => (
  <motion.div
    className="rounded-2xl overflow-hidden mb-4"
    style={{
      background:  'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
      border:      '1px solid rgba(251,191,36,0.4)',
      boxShadow:   '0 0 30px rgba(251,191,36,0.15)',
    }}
    initial={{ opacity: 0, y: -20, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.96 }}
    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
  >
    <div className="flex items-start gap-4 px-5 py-4">
      <motion.div
        className="text-3xl shrink-0"
        animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        🎉
      </motion.div>
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-base mb-1"
          style={{ fontFamily: '"Lexend", "Inter", system-ui', color: '#FBBF24' }}
        >
          Tuyệt vời! Bạn đã hoàn thành bộ sưu tập!
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Bạn đã khám phá đủ{' '}
          <strong className="text-amber-400">9 nhân vật chủ chốt</strong> trong Lịch sử Cứu độ —
          từ Abraham đến Thánh Phaolô. Đây là nền tảng vững chắc để hiểu Kinh Thánh!
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Trophy size={13} style={{ color: '#FBBF24' }} />
          <span className="text-[11px] font-semibold text-amber-400">Thành tích: Nhà Kinh Thánh học</span>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1.5 rounded-full text-amber-400/50 hover:text-amber-400 hover:bg-amber-400/10 transition"
      >
        <XIcon size={16} />
      </button>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// INFO ACCORDION (4 sections, driven by parent card hover via variants)
// ═══════════════════════════════════════════════════════════════════════════════

const INFO_META = [
  { key: 'nameMeaning', Icon: Tag,       label: 'Ý nghĩa tên'  },
  { key: 'mainEvent',   Icon: Zap,       label: 'Biến cố chính' },
  { key: 'role',        Icon: Shield,    label: 'Vai trò'       },
  { key: 'lesson',      Icon: Lightbulb, label: 'Bài học'       },
];

const InfoAccordion = ({ char, onFirstOpen, isExplored }) => {
  const [openKey, setOpenKey] = useState(null);

  const handleOpen = useCallback((key) => {
    const next = openKey === key ? null : key;
    setOpenKey(next);
    if (next && !isExplored) onFirstOpen();
  }, [openKey, isExplored, onFirstOpen]);

  return (
    <div className="space-y-1">
      {INFO_META.map(({ key, Icon, label }) => {
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            className="rounded-lg overflow-hidden cursor-pointer transition-colors duration-200"
            style={{
              background:   isOpen ? `rgba(${char.heroRgb},0.1)` : 'rgba(255,255,255,0.03)',
              border:       `1px solid ${isOpen ? `rgba(${char.heroRgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
            }}
            onClick={e => { e.stopPropagation(); handleOpen(key); }}
          >
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Icon size={11} style={{ color: isOpen ? char.heroHex : '#64748b', flexShrink: 0 }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wider flex-1"
                style={{ color: isOpen ? '#F59E0B' : '#475569' }}
              >
                {label}
              </span>
              {isOpen
                ? <ChevronUp   size={10} style={{ color: char.heroHex, flexShrink: 0 }} />
                : <ChevronDown size={10} style={{ color: '#374151',   flexShrink: 0 }} />}
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-2.5 pb-2.5 text-slate-300 text-[11px] leading-relaxed">
                    {char[key]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTION CARD
// ═══════════════════════════════════════════════════════════════════════════════

// Variant cascade: article defines "rest"/"hover" states;
// descendant motion elements inherit & react automatically.
const CARD_VARIANTS = {
  rest:  { y: 0,  scale: 1    },
  hover: { y: -6, scale: 1.05 },
};

const CollectionCard = ({ char, isExplored, onExplore }) => {
  const [showLink, setShowLink] = useState(false);

  // aspect-[4/3]: khớp tỉ lệ ảnh 4:3 khuyến nghị, đồng nhất mọi card
  const imgH = 'aspect-[4/3]';

  return (
    <motion.article
      layout
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={CARD_VARIANTS}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background:    char.isCenter
          ? `linear-gradient(160deg, rgba(${char.heroRgb},0.18) 0%, rgba(255,255,255,0.05) 100%)`
          : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border:        char.isCenter
          ? `2px solid rgba(${char.heroRgb},0.6)`
          : '1px solid rgba(255,255,255,0.10)',
        boxShadow:     char.isCenter
          ? `0 0 32px rgba(${char.heroRgb},0.35)`
          : 'none',
        zIndex:        char.isCenter ? 10 : 1,
        transition:    'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}
      // Additional hover via whileHover (motion value, not variants)
      whileHover={{
        borderColor: char.isCenter ? `rgba(${char.heroRgb},0.95)` : `rgba(${char.heroRgb},0.6)`,
        boxShadow:   char.isCenter
          ? `0 0 30px rgba(255,255,255,0.10), 0 0 52px rgba(${char.heroRgb},0.55), 0 20px 48px rgba(0,0,0,0.5)`
          : `0 0 30px rgba(255,255,255,0.10), 0 0 22px rgba(${char.heroRgb},0.30), 0 12px 36px rgba(0,0,0,0.45)`,
        background: char.isCenter
          ? `linear-gradient(160deg, rgba(${char.heroRgb},0.22) 0%, rgba(255,255,255,0.08) 100%)`
          : 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.28 }}
    >
      {/* ── Explored indicator ── */}
      {isExplored && (
        <div className="absolute top-2 right-2 z-20">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: `rgba(${char.heroRgb},0.25)`,
              border:     `1px solid rgba(${char.heroRgb},0.5)`,
            }}
          >
            <CheckCircle2 size={11} style={{ color: char.heroHex }} />
          </div>
        </div>
      )}

      {/* ── Image area (≈40% of card) ── */}
      <div className={`relative ${imgH} shrink-0`}>
        <ImageWithFallback char={char} />

        {/* Badge — period/stage, overlaid on image */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className="text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-sm"
            style={{
              background: `rgba(${char.badgeRgb ?? char.heroRgb},0.22)`,
              color:      char.badgeHex ?? char.heroHex,
              border:     `1px solid rgba(${char.badgeRgb ?? char.heroRgb},0.4)`,
            }}
          >
            {char.badge}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-2">
        {/* Name — min-h đảm bảo tên dài/ngắn không làm lệch hàng */}
        <div className="min-h-11">
          <h3
            className="font-bold leading-tight"
            style={{
              fontFamily: '"Lexend", "Inter", system-ui',
              fontSize:   char.isCenter ? '0.92rem' : '0.82rem',
              color:      char.isCenter ? '#FBBF24' : char.heroHex,
            }}
          >
            {char.name}
          </h3>
          <p className="text-[9px] text-slate-500 mt-0.5">{char.period}</p>
        </div>

        {/* 4-section accordion */}
        <InfoAccordion
          char={char}
          isExplored={isExplored}
          onFirstOpen={() => onExplore(char.id)}
        />

        {/* Verse */}
        <div
          className="rounded-lg px-2.5 py-2"
          style={{
            background:  `rgba(${char.heroRgb},0.07)`,
            borderLeft:  `2px solid rgba(${char.heroRgb},0.4)`,
          }}
        >
          <p
            className="text-[9px] italic leading-relaxed line-clamp-2"
            style={{ color: `rgba(${char.heroRgb},0.85)` }}
          >
            {char.verse}
          </p>
        </div>

        {/* Fulfillment toggle */}
        <button
          className="flex items-center gap-1.5 text-left mt-0.5"
          onClick={e => { e.stopPropagation(); setShowLink(v => !v); }}
        >
          <Sparkles size={9} style={{ color: 'rgba(255,215,0,0.45)' }} />
          <span
            className="text-[9px] uppercase tracking-wider font-semibold"
            style={{ color: 'rgba(255,215,0,0.45)' }}
          >
            Ứng nghiệm CƯ
          </span>
          <motion.div
            animate={{ rotate: showLink ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronDown size={9} style={{ color: 'rgba(255,215,0,0.35)' }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {showLink && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                className="text-slate-400 text-[10px] leading-relaxed px-2 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(255,215,0,0.06)',
                  border:     '1px solid rgba(255,215,0,0.15)',
                }}
              >
                {char.fulfillment}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CharacterCollection() {
  const [filter, setFilter]             = useState('all');
  const [explored, setExplored]         = useState(new Set());
  const [showCelebration, setCelebrate] = useState(false);

  const handleExplore = useCallback((id) => {
    setExplored(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      if (next.size === COLLECTION.length) {
        setTimeout(() => setCelebrate(true), 350);
      }
      return next;
    });
  }, []);

  const visible = filter === 'all'
    ? COLLECTION
    : COLLECTION.filter(c => c.era === filter);

  return (
    <div className="space-y-4">

      {/* ── Controls: filter + progress ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <FilterBar active={filter} onChange={f => setFilter(f)} />
        <div className="w-full sm:w-48 sm:ml-auto">
          <ProgressBar explored={explored.size} total={COLLECTION.length} />
        </div>
      </div>

      {/* ── Celebration banner ── */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationBanner onDismiss={() => setCelebrate(false)} />
        )}
      </AnimatePresence>

      {/* ── Card grid ──
           Mobile:  1 col   (full-width cards, scroll vertically)
           Tablet:  2 cols
           Desktop: 3 cols  (Jesus lands at center of row 2)
      ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {visible.map((char, i) => (
            <motion.div
              key={char.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.38, delay: i * 0.055, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full flex flex-col"
              style={{ zIndex: char.isCenter ? 10 : 1 }}
            >
              <CollectionCard
                char={char}
                isExplored={explored.has(char.id)}
                onExplore={handleExplore}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Bible reference chips ── */}
      {filter === 'all' && (
        <motion.div
          className="flex flex-wrap gap-1.5 pt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {COLLECTION.map(c => (
            <span
              key={c.id}
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background: `rgba(${c.heroRgb},0.08)`,
                color:      `rgba(${c.heroRgb},0.6)`,
                border:     `1px solid rgba(${c.heroRgb},0.15)`,
              }}
            >
              {c.bibleRef.split('·')[0].trim()}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
