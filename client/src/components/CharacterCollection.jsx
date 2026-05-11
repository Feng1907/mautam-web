import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tent, Flame, Crown, ScrollText, Heart,
  Droplets, KeyRound, BookOpen,
  Tag, Zap, Shield, Lightbulb,
  ChevronDown, ChevronUp, Link2, Sparkles,
  Trophy, X as XIcon, CheckCircle2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// DATA — 9 nhân vật, Jesus ở vị trí [4] (chính giữa hàng 2)
// Bố cục 3x3:  [0 Abraham] [1 Moses]  [2 David]
//              [3 Isaiah]  [4 JESUS]  [5 Mary]
//              [6 John]    [7 Peter]  [8 Paul]
// ═══════════════════════════════════════════════════════════════════════════════

const COLLECTION = [
  // ── Hàng 1: Cựu Ước ─────────────────────────────────────────────────────────
  {
    id: 'abraham', era: 'ot', badge: 'Tổ phụ',
    name: 'Abraham', nameHebrew: 'אַבְרָהָם', period: '~2000 TCN',
    LucideIcon: Tent,
    heroHex: '#CD853F', heroRgb: '205,133,63',
    nameMeaning: 'Từ "Abram" (cha được tôn trọng) → "Abraham" (cha của nhiều dân tộc) sau Giao ước cắt bì (St 17,5).',
    mainEvent: 'Rời quê hương Ur theo tiếng gọi Thiên Chúa; nhận Giao ước dòng dõi đông như sao; dâng con trai Isaac trong thử thách tột đỉnh.',
    role: 'Nền tảng Giao ước Cứu độ — qua Abraham, mọi dân tộc được chúc phúc và đón nhận ơn cứu độ trong Đức Kitô.',
    lesson: 'Đức tin đích thực không cần thấy trước kết quả — chỉ cần bước đi trong tin tưởng vào Đấng đang dẫn đường.',
    verse: '"Bởi đức tin, Abraham đã vâng nghe tiếng gọi mà ra đi, dù không biết mình đi đâu." — Hr 11,8',
    fulfillment: 'Đức Giêsu là "Con cháu Abraham" (Mt 1,1). Mọi người tin đều là "dòng dõi Abraham" (Rm 4,16).',
    bibleRef: 'St 12 · 15 · 17 · 22',
  },
  {
    id: 'moses', era: 'ot', badge: 'Xuất hành',
    name: 'Môsê', nameHebrew: 'מֹשֶׁה', period: '~1318 TCN',
    LucideIcon: Flame,
    heroHex: '#60A5FA', heroRgb: '96,165,250',
    nameMeaning: '"Được kéo ra khỏi nước" — công chúa Ai Cập đặt khi vớt ông từ sông Nile lúc còn là trẻ sơ sinh (Xh 2,10).',
    mainEvent: 'Gặp Thiên Chúa qua bụi gai lửa (Xh 3); lãnh đạo Xuất hành khỏi Ai Cập; nhận Mười Điều Răn trên núi Sinai.',
    role: 'Trung gian Giao ước Sinai, người lãnh đạo Xuất hành — hình bóng trực tiếp của Đức Kitô là Trung gian Giao ước Mới.',
    lesson: 'Thiên Chúa không chọn người tài giỏi — Ngài chọn người khiêm tốn và làm cho họ trở nên tài. "Ta sẽ ở cùng ngươi."',
    verse: '"Ta là Đấng Ta Là (YHWH). Đây là danh Ta đến muôn đời." — Xh 3,14–15',
    fulfillment: '"Pháp luật đến từ Môsê, còn ân sủng và sự thật đến từ Đức Giêsu Kitô." — Ga 1,17',
    bibleRef: 'Xh 3 · 14 · 20 · Đnl 34',
  },
  {
    id: 'david', era: 'ot', badge: 'Vương quốc',
    name: 'Đavít', nameHebrew: 'דָּוִד', period: '~1040 TCN',
    LucideIcon: Crown,
    heroHex: '#C084FC', heroRgb: '192,132,252',
    nameMeaning: '"Người được yêu thương" — biểu thị tình yêu đặc biệt Thiên Chúa dành cho ông. Thiên Chúa gọi ông là "người theo lòng Ta" (Cv 13,22).',
    mainEvent: 'Được xức dầu từ người chăn chiên; chiến thắng Gôliát bằng đức tin; nhận Giao ước "dòng dõi trị vì đời đời" (2Sm 7).',
    role: 'Giao ước Đavít là nền tảng cho niềm hy vọng Mêsia. "Con vua Đavít" là tước hiệu Mêsia căn bản trong Tân Ước.',
    lesson: 'Thiên Chúa không nhìn vẻ bề ngoài — "Người xét theo con mắt loài người, còn Ta thì thấy tâm lòng." (1Sm 16,7)',
    verse: '"Ta sẽ lập dòng dõi ngươi... vương triều ngươi sẽ kiên vững đến muôn đời." — 2Sm 7,12–13',
    fulfillment: 'Sứ thần loan tin với Maria: "Thiên Chúa sẽ ban cho Người ngôi báu Đavít tổ tiên." — Lc 1,32',
    bibleRef: '1Sm 16 · 17 · 2Sm 7 · Tv 22 · 51',
  },

  // ── Hàng 2: OT | JESUS (CENTER) | NT ────────────────────────────────────────
  {
    id: 'isaiah', era: 'ot', badge: 'Ngôn sứ',
    name: 'Isaia', nameHebrew: 'יְשַׁעְיָהוּ', period: '~740 TCN',
    LucideIcon: ScrollText,
    heroHex: '#FB923C', heroRgb: '251,146,60',
    nameMeaning: '"Ơn cứu độ của YHWH" — tên ông chứa đựng sứ điệp cả cuộc đời: loan báo ơn cứu độ Thiên Chúa mang đến.',
    mainEvent: 'Thị kiến ngai thánh (Is 6); tiên báo trinh nữ thụ thai Emmanuel (Is 7,14); mô tả chi tiết Người Tôi Tớ đau khổ (Is 53).',
    role: '"Tin Mừng thứ năm" — mô tả Đức Kitô chính xác hơn bất kỳ sách Cựu Ước nào, viết trước ~700 năm.',
    lesson: '"Này con đây, xin hãy sai con đi." (Is 6,8) — Sẵn sàng đáp tiếng Chúa ngay cả khi cảm thấy bất xứng.',
    verse: '"Vì tội lỗi ta mà Người bị đâm thâu; vì sự gian ác ta mà Người bị nghiền nát." — Is 53,5',
    fulfillment: 'Đức Giêsu đọc Is 61 tại Nadarét: "Hôm nay ứng nghiệm lời Kinh Thánh này trước mặt anh em." — Lc 4,21',
    bibleRef: 'Is 6 · 7,14 · 40,3 · 53 · 61',
  },
  {
    id: 'jesus', era: 'nt', badge: 'Trung tâm', isCenter: true,
    name: 'Đức Giêsu Kitô', nameHebrew: 'יֵשׁוּעַ הַמָּשִׁיחַ', period: '~4 TCN – 30 CN',
    LucideIcon: null,   // dùng CrossSVG riêng
    heroHex: '#FBBF24', heroRgb: '251,191,36',
    nameMeaning: '"Giêsu" = YHWH cứu độ · "Kitô" = Đấng được Xức dầu. Tên duy nhất chứa đựng trọn vẹn chương trình cứu độ của Thiên Chúa (Pl 2,9).',
    mainEvent: 'Nhập thể tại Bêlem; Sứ vụ 3 năm rao giảng & phép lạ; Tử nạn thập giá đền tội nhân loại; Phục sinh ngày thứ ba.',
    role: 'Alpha và Omega — Trung tâm và Mục tiêu toàn bộ Lịch sử Cứu độ. Mọi Cựu Ước hướng về Ngài; mọi Tân Ước xuất phát từ Ngài.',
    lesson: 'Thiên Chúa không chỉ gửi sứ điệp — Ngài đến gặp trực tiếp. Tình yêu Thiên Chúa nhập thể, chịu chết và sống lại vì mỗi người.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta... đầy ân sủng và sự thật." — Ga 1,14',
    fulfillment: 'Ứng nghiệm toàn bộ Cựu Ước: Chiên Vượt Qua đích thực, Đền thờ đích thực, Đavít đích thực, Môsê đích thực — và là Thiên Chúa.',
    bibleRef: 'Ga 1 · Mt 5 · Mc 1 · Lc 23–24',
  },
  {
    id: 'mary', era: 'nt', badge: 'Ứng nghiệm',
    name: 'Đức Maria', nameHebrew: 'מִרְיָם', period: '~18 TCN',
    LucideIcon: Heart,
    heroHex: '#F472B6', heroRgb: '244,114,182',
    nameMeaning: '"Miriam" — nhiều giải thích: "Được yêu thương", "Ngôi sao biển", "Biển đắng". Mẹ là "Eva Mới": tiếng "xin vâng" đảo ngược tiếng "không" của Eva.',
    mainEvent: 'Tiếng "Xin vâng" với sứ thần (Lc 1); sinh Chúa Giêsu tại Bêlem; nói "Người bảo gì, hãy làm đó" ở Cana; đứng vững dưới chân Thập giá.',
    role: 'Mẹ Thiên Chúa (Theotokos) — "Hòm Bia Giao ước Mới", mang Đức Kitô đến thế gian. Mẫu gương đức tin hoàn hảo nhất.',
    lesson: 'Một tiếng "xin vâng" khiêm tốn đã mở cánh cửa nhập thể. Chúng ta được gọi cộng tác với ơn Thiên Chúa — dù nhỏ bé đến đâu.',
    verse: '"Này tôi là tôi tớ Đức Chúa, xin hãy thực hiện cho tôi theo lời sứ thần." — Lc 1,38',
    fulfillment: 'Ứng nghiệm Is 7,14: "Này đây trinh nữ sẽ thụ thai và sinh hạ một con trai, đặt tên là Emmanuel."',
    bibleRef: 'Lc 1,26–55 · Ga 2,5 · Ga 19,25–27',
  },

  // ── Hàng 3: Tân Ước ──────────────────────────────────────────────────────────
  {
    id: 'john', era: 'nt', badge: 'Ứng nghiệm',
    name: 'Gioan Tẩy Giả', nameHebrew: 'יוֹחָנָן', period: '~5 TCN',
    LucideIcon: Droplets,
    heroHex: '#38BDF8', heroRgb: '56,189,248',
    nameMeaning: '"Yohanan" = YHWH đã thương xót / Thiên Chúa ban ơn. Tên được sứ thần Gabriel đặt trước khi sinh — báo hiệu ông là hồng ân đặc biệt (Lc 1,13).',
    mainEvent: 'Rao giảng hoán cải ở sông Jordan; làm phép rửa cho Đức Giêsu; công bố "Đây là Chiên Thiên Chúa!"; tử đạo vì nói sự thật.',
    role: '"Người vĩ đại nhất sinh ra từ người phụ nữ" (Mt 11,11) — cầu nối cuối cùng giữa Cựu Ước và Tân Ước.',
    lesson: '"Người phải lớn lên, còn tôi phải nhỏ lại." (Ga 3,30) — Mẫu gương khiêm tốn: vinh quang nằm ở việc chỉ người khác đến Chúa.',
    verse: '"Đây là Chiên Thiên Chúa, Đấng xóa bỏ tội trần gian!" — Ga 1,29',
    fulfillment: 'Ứng nghiệm Is 40,3 và Ml 3,1: "Ta sai sứ giả đi trước mặt Ta." Gioan là "Êlia mới" dọn đường Đấng Cứu Thế.',
    bibleRef: 'Mc 1,1–8 · Lc 1 · Ga 1,29 · Ga 3,30',
  },
  {
    id: 'peter', era: 'nt', badge: 'Ứng nghiệm',
    name: 'Thánh Phêrô', nameHebrew: 'שִׁמְעוֹן / Πέτρος', period: '~1 TCN',
    LucideIcon: KeyRound,
    heroHex: '#FBBF24', heroRgb: '251,191,36',
    nameMeaning: '"Kêpha/Petros" = Đá tảng. Tên nguyên thủy là Simon. Đức Giêsu đổi tên — hành động này chứa đựng sứ mạng lãnh đạo Hội Thánh.',
    mainEvent: 'Được gọi từ lưới cá; tuyên xưng "Thầy là Đức Kitô"; ba lần chối Chúa và hối hận; được phục hồi ở hồ Galilê; giảng Ngũ Tuần.',
    role: 'Nền tảng hữu hình Hội Thánh — "Trên đá này Ta sẽ xây Hội Thánh Ta, và quyền lực tử thần sẽ không thắng nổi." — Mt 16,18',
    lesson: 'Sự vấp ngã không phải là kết thúc — Tình yêu và ăn năn thật lòng luôn được Chúa phục hồi. Ân sủng mạnh hơn tội lỗi.',
    verse: '"Lạy Thầy, Thầy biết rõ mọi sự; Thầy biết con yêu mến Thầy." — Ga 21,17',
    fulfillment: 'Ứng nghiệm Ed 34: Thiên Chúa hứa đặt người chăn chiên trên đàn — Phêrô nhận: "Hãy chăn dắt chiên của Thầy."',
    bibleRef: 'Mt 4,18–20 · Mt 16,16–18 · Ga 21,15–17 · Cv 2',
  },
  {
    id: 'paul', era: 'nt', badge: 'Ứng nghiệm',
    name: 'Thánh Phaolô', nameHebrew: 'שָׁאוּל / Παῦλος', period: '~5 CN',
    LucideIcon: BookOpen,
    heroHex: '#34D399', heroRgb: '52,211,153',
    nameMeaning: '"Paulos" (Latin) = Nhỏ bé, khiêm tốn. Tên gốc là Saolê. Sau biến cố Damascus, ông dùng Paulos — dấu hiệu biến đổi căn bản.',
    mainEvent: 'Bắt bớ Kitô hữu; gặp Đức Kitô phục sinh trên đường Damascus; 3 chuyến truyền giáo; viết 13 thư Tân Ước; tử đạo tại Roma.',
    role: '"Tông đồ dân ngoại" — người đem Tin Mừng vượt Palestine đến toàn Đế quốc Roma. 13 thư là nền thần học Kitô giáo.',
    lesson: '"Ơn của Thầy đủ cho anh rồi, vì sức mạnh của Thầy được biểu lộ trong sự yếu đuối." (2Cr 12,9) — Sức mạnh thật đến từ Chúa.',
    verse: '"Tôi sống, nhưng không còn là tôi sống nữa, mà là Đức Kitô sống trong tôi." — Gl 2,20',
    fulfillment: 'Ứng nghiệm Is 49,6: "Ta đặt ngươi làm ánh sáng muôn dân, để ơn cứu độ lan tràn đến tận cùng trái đất."',
    bibleRef: 'Cv 9 · Rm · 1Cr · Gl 2,20 · Pl 4',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS ICON (Lucide không có)
// ═══════════════════════════════════════════════════════════════════════════════

const CrossSVG = ({ size = 36, color = '#FBBF24' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
    <rect x="15" y="2" width="6" height="32" rx="3" fill={color} />
    <rect x="2" y="11" width="32" height="6" rx="3" fill={color} />
  </svg>
);

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
            border: isActive ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.08)',
            color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.45)',
          }}
          whileTap={{ scale: 0.96 }}
        >
          {f.label}
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)',
              color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.3)',
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
  const pct = Math.round((explored / total) * 100);
  const isDone = explored === total;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isDone
              ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #FDE68A)'
              : 'linear-gradient(90deg, #92400E, #D97706)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span
        className="text-[11px] font-semibold shrink-0 tabular-nums"
        style={{ color: isDone ? '#FBBF24' : 'rgba(255,255,255,0.35)' }}
      >
        {explored}/{total}
      </span>
      {isDone && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 300 }}
        >
          <CheckCircle2 size={16} style={{ color: '#FBBF24' }} />
        </motion.div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CELEBRATION BANNER
// ═══════════════════════════════════════════════════════════════════════════════

const CelebrationBanner = ({ onDismiss }) => (
  <motion.div
    className="rounded-2xl overflow-hidden mb-6"
    style={{
      background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
      border: '1px solid rgba(251,191,36,0.4)',
      boxShadow: '0 0 30px rgba(251,191,36,0.15)',
    }}
    initial={{ opacity: 0, y: -20, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.96 }}
    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
  >
    <div className="flex items-start gap-4 px-5 py-4">
      <motion.div
        className="text-3xl shrink-0 mt-0.5"
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
          Tuyệt vời! Hoàn thành bộ sưu tập!
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Bạn đã khám phá đủ <strong className="text-amber-400">9 nhân vật chủ chốt</strong> trong Lịch sử Cứu độ —
          từ Abraham đến Thánh Phaolô. Đây là nền tảng vững chắc để hiểu Kinh Thánh!
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <Trophy size={13} style={{ color: '#FBBF24' }} />
          <span className="text-[11px] font-semibold" style={{ color: '#FBBF24' }}>
            Thành tích: Nhà Kinh Thánh học
          </span>
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
// INFO ACCORDION ROW
// ═══════════════════════════════════════════════════════════════════════════════

const INFO_META = [
  { key: 'nameMeaning', Icon: Tag,       label: 'Ý nghĩa tên'  },
  { key: 'mainEvent',   Icon: Zap,       label: 'Biến cố chính' },
  { key: 'role',        Icon: Shield,    label: 'Vai trò'       },
  { key: 'lesson',      Icon: Lightbulb, label: 'Bài học'       },
];

const InfoAccordion = ({ char, onFirstOpen, isExplored }) => {
  const [openKey, setOpenKey] = useState(null);

  const handleOpen = (key) => {
    const next = openKey === key ? null : key;
    setOpenKey(next);
    if (next && !isExplored) onFirstOpen();
  };

  return (
    <div className="space-y-1">
      {INFO_META.map(({ key, Icon, label }) => {
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            className="rounded-lg overflow-hidden cursor-pointer"
            style={{
              background: isOpen ? `rgba(${char.heroRgb},0.1)` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isOpen ? `rgba(${char.heroRgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onClick={() => handleOpen(key)}
          >
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Icon
                size={11}
                style={{ color: isOpen ? char.heroHex : '#64748b', flexShrink: 0 }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wider flex-1"
                style={{ color: isOpen ? '#F59E0B' : '#475569' }}
              >
                {label}
              </span>
              {isOpen
                ? <ChevronUp size={10} style={{ color: char.heroHex, flexShrink: 0 }} />
                : <ChevronDown size={10} style={{ color: '#374151', flexShrink: 0 }} />
              }
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
// SINGLE CARD
// ═══════════════════════════════════════════════════════════════════════════════

const CollectionCard = ({ char, isExplored, onExplore }) => {
  const [showLink, setShowLink] = useState(false);
  const IconComp = char.LucideIcon;

  return (
    <motion.article
      layout
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: char.isCenter
          ? `linear-gradient(160deg, rgba(${char.heroRgb},0.18) 0%, rgba(255,255,255,0.05) 100%)`
          : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: char.isCenter
          ? `2px solid rgba(${char.heroRgb},0.6)`
          : '1px solid rgba(255,255,255,0.10)',
        boxShadow: char.isCenter
          ? `0 0 32px rgba(${char.heroRgb},0.35), 0 0 0 1px rgba(${char.heroRgb},0.2)`
          : 'none',
        zIndex: char.isCenter ? 10 : 1,
      }}
      whileHover={{
        borderColor: char.isCenter ? `rgba(${char.heroRgb},0.9)` : `rgba(${char.heroRgb},0.5)`,
        boxShadow: char.isCenter
          ? `0 0 48px rgba(${char.heroRgb},0.5), 0 12px 40px rgba(0,0,0,0.5)`
          : `0 0 20px rgba(${char.heroRgb},0.22), 0 8px 30px rgba(0,0,0,0.4)`,
        y: char.isCenter ? -8 : -4,
        background: 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Explored indicator */}
      {isExplored && (
        <div className="absolute top-2 right-2 z-20">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: `rgba(${char.heroRgb},0.25)`, border: `1px solid rgba(${char.heroRgb},0.5)` }}
          >
            <CheckCircle2 size={11} style={{ color: char.heroHex }} />
          </div>
        </div>
      )}

      {/* ── Hero area ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden shrink-0"
        style={{
          height: char.isCenter ? 100 : 80,
          background: `radial-gradient(ellipse 80% 80% at 50% 40%, rgba(${char.heroRgb},0.28) 0%, rgba(2,6,23,0.95) 100%)`,
        }}
      >
        {/* Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />
          {char.isCenter && (
            <div className="absolute w-24 h-24 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.03)' }} />
          )}
        </div>

        {/* Era / Badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              background: char.isCenter ? `rgba(${char.heroRgb},0.2)` : 'rgba(255,255,255,0.06)',
              color: char.isCenter ? char.heroHex : 'rgba(255,255,255,0.35)',
              border: char.isCenter ? `1px solid rgba(${char.heroRgb},0.35)` : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {char.badge}
          </span>
        </div>

        {/* "Ứng nghiệm" badge for NT */}
        {char.era === 'nt' && !char.isCenter && (
          <div className="absolute top-2 right-8">
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              ✦ ƯN
            </span>
          </div>
        )}

        {/* Icon */}
        <motion.div
          className="relative z-10"
          style={{ filter: `drop-shadow(0 0 ${char.isCenter ? 20 : 12}px rgba(${char.heroRgb},0.7))` }}
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.2 }}
        >
          {char.isCenter ? (
            <CrossSVG size={char.isCenter ? 38 : 28} color={char.heroHex} />
          ) : (
            IconComp && <IconComp size={28} style={{ color: char.heroHex }} strokeWidth={1.5} />
          )}
        </motion.div>

        {/* Center pulse ring */}
        {char.isCenter && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `1px solid rgba(${char.heroRgb},0.4)` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-2">
        {/* Name */}
        <div>
          <h3
            className="font-bold leading-tight"
            style={{
              fontFamily: '"Lexend", "Inter", system-ui',
              fontSize: char.isCenter ? '0.9rem' : '0.8rem',
              color: char.isCenter ? '#FBBF24' : char.heroHex,
            }}
          >
            {char.name}
          </h3>
          <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{char.period}</p>
        </div>

        {/* 4 accordion rows */}
        <InfoAccordion char={char} isExplored={isExplored} onFirstOpen={() => onExplore(char.id)} />

        {/* Verse */}
        <div
          className="rounded-lg px-2.5 py-2 mt-auto"
          style={{ background: `rgba(${char.heroRgb},0.07)`, borderLeft: `2px solid rgba(${char.heroRgb},0.4)` }}
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
          onClick={() => setShowLink(v => !v)}
        >
          <Link2 size={9} style={{ color: 'rgba(255,215,0,0.45)' }} />
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,215,0,0.4)' }}>
            Ứng nghiệm CƯ
          </span>
          <motion.div animate={{ rotate: showLink ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
            <ChevronDown size={9} style={{ color: 'rgba(255,215,0,0.35)' }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {showLink && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                className="text-[10px] leading-relaxed px-2 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', color: 'rgba(255,255,255,0.55)' }}
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
  const [filter, setFilter]       = useState('all');
  const [explored, setExplored]   = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const handleExplore = useCallback((id) => {
    setExplored(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      if (next.size === COLLECTION.length) {
        setTimeout(() => setShowCelebration(true), 300);
      }
      return next;
    });
  }, []);

  const visible = filter === 'all'
    ? COLLECTION
    : COLLECTION.filter(c => c.era === filter);

  return (
    <div className="space-y-5">
      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <FilterBar active={filter} onChange={f => setFilter(f)} />
        <div className="sm:ml-auto w-full sm:w-48">
          <ProgressBar explored={explored.size} total={COLLECTION.length} />
        </div>
      </div>

      {/* ── Celebration banner ── */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationBanner onDismiss={() => setShowCelebration(false)} />
        )}
      </AnimatePresence>

      {/* ── Card grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {visible.map((char, i) => (
            <motion.div
              key={char.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.38, delay: i * 0.055, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      {/* ── Bible refs row (mini) ── */}
      {filter === 'all' && (
        <motion.div
          className="flex flex-wrap gap-1.5 pt-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          {COLLECTION.map(c => (
            <span
              key={c.id}
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: `rgba(${c.heroRgb},0.08)`, color: `rgba(${c.heroRgb},0.6)`, border: `1px solid rgba(${c.heroRgb},0.15)` }}
            >
              {c.bibleRef.split('·')[0].trim()}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
