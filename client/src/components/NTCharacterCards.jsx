import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Hammer, Droplets, KeyRound, ScrollText,
  Tag, Zap, Shield, Lightbulb, Link2,
  ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU — Nhân vật Tân Ước
// ═══════════════════════════════════════════════════════════════════════════════

const NT_CHARACTERS = [
  {
    id: 'jesus',
    isHero: true,
    name: 'Đức Giêsu Kitô',
    title: 'Thiên Chúa làm người — Đấng Cứu Thế',
    period: '~4 TCN – 30 sau CN (và mãi mãi)',
    CustomIcon: null,       // dùng SVG cross riêng
    era: 'Trung tâm Cứu độ',
    heroColor: '#F59E0B',   // amber-500
    glowRgb: '245,158,11',
    nameMeaning: '"Giêsu" = YHWH cứu độ · "Kitô" = Đấng được Xức dầu (Mêsia). Đây là danh hiệu duy nhất chứa đựng trọn vẹn chương trình cứu độ của Thiên Chúa (Pl 2,9–11).',
    mainEvent: 'Nhập thể tại Bêlem · Sứ vụ 3 năm rao giảng và phép lạ · Tử nạn trên thập giá · Phục sinh ngày thứ ba · Lên trời · Sai Thánh Thần.',
    role: 'Alpha và Omega — Trung tâm và Mục tiêu toàn bộ Lịch sử Cứu độ. "Không ai đến được với Chúa Cha mà không qua Thầy." — Ga 14,6',
    lesson: 'Tình yêu Thiên Chúa không điều kiện — Ngài yêu đến mức trao ban Con Một. Mọi hy vọng của chúng ta đặt nền tảng trên sự Phục sinh của Ngài.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta, và chúng ta đã được nhìn thấy vinh quang của Người." — Ga 1,14',
    fulfillment: 'Ứng nghiệm toàn bộ Cựu Ước: Chiên Vượt Qua đích thực, Đền thờ đích thực, Đavít đích thực — và hơn tất cả: Thiên Chúa nhập thể.',
    bibleRef: 'Ga 1 · Mt 5 · Mc 1 · Lc 23–24 · Ga 3,16',
  },
  {
    id: 'mary',
    isHero: false,
    name: 'Đức Maria',
    title: 'Mẹ Thiên Chúa · Mẹ Hội Thánh',
    period: '~18 TCN – ~48 sau CN',
    LucideIcon: Heart,
    era: 'Nhập thể',
    heroColor: '#F472B6',   // pink-400
    glowRgb: '244,114,182',
    nameMeaning: '"Miriam" — nguồn gốc tranh luận: "Được yêu thương", "Ngôi sao biển", "Biển đắng". Mẹ là "Eva Mới": tiếng "xin vâng" đảo ngược tiếng "không" của Eva.',
    mainEvent: 'Tiếng "Xin vâng" với sứ thần (Lc 1) · Sinh Chúa Giêsu tại Bêlem · Dưới chân Thập giá không bỏ đi (Ga 19) · Cùng Hội Thánh đón Chúa Thánh Thần.',
    role: 'Mẹ Thiên Chúa (Theotokos) — "Hòm Bia Giao ước Mới", mang Đức Kitô đến thế gian. Mẫu gương đức tin hoàn hảo cho mọi Kitô hữu.',
    lesson: 'Một tiếng "xin vâng" khiêm tốn đã mở cánh cửa nhập thể. Thiên Chúa cần sự cộng tác của con người — dù nhỏ bé đến đâu.',
    verse: '"Này tôi là tôi tớ Đức Chúa, xin hãy thực hiện cho tôi theo lời sứ thần." — Lc 1,38',
    fulfillment: 'Ứng nghiệm Is 7,14: "Này đây trinh nữ sẽ thụ thai và sinh hạ một con trai, đặt tên là Emmanuel."',
    bibleRef: 'Lc 1,26–38 · Lc 1,46–55 · Ga 2,5 · Ga 19,25–27',
  },
  {
    id: 'joseph',
    isHero: false,
    name: 'Thánh Giuse',
    title: 'Cha nuôi Đức Giêsu',
    period: '~40 TCN – ~26 sau CN',
    LucideIcon: Hammer,
    era: 'Nhập thể',
    heroColor: '#818CF8',   // indigo-400
    glowRgb: '129,140,248',
    nameMeaning: '"Yosef" = "Thiên Chúa thêm vào / gia tăng". Ông Giuse trong Cựu Ước là hình bóng: cũng bị bán đi rồi trở thành người cứu gia đình — tiên trưng Đức Giêsu bị phản nộp để cứu nhân loại.',
    mainEvent: 'Nhận nuôi Đức Giêsu theo lệnh thiên thần (Mt 1) · Đưa Gia đình sang Ai Cập tránh Hêrôđê · Bảo vệ và nuôi dưỡng Gia đình Thánh tại Nadarét.',
    role: 'Người cha nuôi, đầu Gia đình Thánh — bảo vệ "mầm mống ơn cứu độ" trong những năm đầu tiên mong manh nhất của Đức Giêsu trên đời.',
    lesson: 'Thinh lặng, cần cù, vâng phục — không một lời nào của Thánh Giuse được ghi lại trong Tin Mừng, nhưng hành động của ông hoàn hảo. Đôi khi trung thành không cần lời.',
    verse: '"Ông Giuse trỗi dậy, đưa Hài Nhi và mẹ Người trốn sang Ai Cập ngay đêm ấy." — Mt 2,14',
    fulfillment: 'Ứng nghiệm Mt 2,15: "Ta gọi con Ta ra khỏi Ai Cập" — lặp lại Xuất hành, Giêsu là Môsê Mới.',
    bibleRef: 'Mt 1,18–25 · Mt 2,13–23 · Lc 2,41–52',
  },
  {
    id: 'john-baptist',
    isHero: false,
    name: 'Gioan Tẩy Giả',
    title: 'Người dọn đường — Êlia Mới',
    period: '~5 TCN – ~28 sau CN',
    LucideIcon: Droplets,
    era: 'Dọn đường',
    heroColor: '#38BDF8',   // sky-400
    glowRgb: '56,189,248',
    nameMeaning: '"Yohanan" = YHWH đã thương xót / Thiên Chúa ban ơn. Tên được sứ thần Gabriel đặt trước khi ông sinh ra — báo hiệu ông là hồng ân đặc biệt (Lc 1,13).',
    mainEvent: 'Rao giảng hoán cải ở sông Jordan · Làm phép rửa cho Đức Giêsu · Công bố "Đây là Chiên Thiên Chúa!" · Tử đạo vì dám lên án tội bất công của vua.',
    role: '"Người vĩ đại nhất sinh ra từ người phụ nữ" (Mt 11,11) — cầu nối cuối cùng giữa Cựu Ước và Tân Ước, người chỉ về Đức Kitô.',
    lesson: '"Người phải lớn lên, còn tôi phải nhỏ lại." (Ga 3,30) — mẫu gương khiêm tốn hoàn hảo: vinh quang không nằm ở mình mà ở việc chỉ đường cho người khác đến Chúa.',
    verse: '"Đây là Chiên Thiên Chúa, Đấng xóa bỏ tội trần gian!" — Ga 1,29',
    fulfillment: 'Ứng nghiệm Is 40,3: "Tiếng hô trong sa mạc: Hãy dọn đường cho Đức Chúa." Và Ml 3,1: "Ta sai sứ giả đi trước mặt Ta."',
    bibleRef: 'Mc 1,1–8 · Lc 1,5–25 · Ga 1,29 · Ga 3,30',
  },
  {
    id: 'peter',
    isHero: false,
    name: 'Thánh Phêrô',
    title: 'Đá tảng Hội Thánh',
    period: '~1 TCN – ~64/68 sau CN',
    LucideIcon: KeyRound,
    era: 'Hội Thánh',
    heroColor: '#FB923C',   // orange-400
    glowRgb: '251,146,60',
    nameMeaning: '"Kêpha" (Aramaic) / "Petros" (Hy Lạp) = Đá tảng. Tên nguyên thủy là Simon. Đức Giêsu đổi tên — hành động này chứa đựng sứ mạng lãnh đạo Hội Thánh.',
    mainEvent: 'Được gọi từ lưới cá · Tuyên xưng: "Thầy là Đức Kitô, Con Thiên Chúa" · Ba lần chối Chúa & hối hận · Phục hồi ở hồ Galilê · Bài giảng Lễ Ngũ Tuần · Tử đạo tại Roma.',
    role: 'Nền tảng hữu hình của Hội Thánh — "Trên đá này Ta sẽ xây Hội Thánh Ta, và quyền lực tử thần sẽ không thắng nổi." (Mt 16,18)',
    lesson: 'Sự vấp ngã không phải là kết thúc — Tình yêu và ăn năn thật lòng luôn được Chúa phục hồi. Phêrô dạy ta: ân sủng mạnh hơn tội lỗi.',
    verse: '"Lạy Thầy, Thầy biết rõ mọi sự; Thầy biết con yêu mến Thầy." — Ga 21,17',
    fulfillment: 'Ứng nghiệm Ed 34: Thiên Chúa hứa đặt một người chăn chiên trên đàn chiên — Phêrô nhận sứ mạng "Hãy chăn dắt chiên của Thầy".',
    bibleRef: 'Mt 4,18–20 · Mt 16,16–18 · Lc 22,54–62 · Ga 21,15–17',
  },
  {
    id: 'paul',
    isHero: false,
    name: 'Thánh Phaolô',
    title: 'Tông đồ dân ngoại',
    period: '~5–67 sau CN',
    LucideIcon: ScrollText,
    era: 'Hội Thánh',
    heroColor: '#34D399',   // emerald-400
    glowRgb: '52,211,153',
    nameMeaning: '"Paulos" (Latin) = Nhỏ bé, khiêm tốn. Tên gốc là Saolê (Saul = được hỏi/cầu xin). Sau biến cố Damascus, ông dùng tên Paulos — dấu hiệu của sự biến đổi căn bản.',
    mainEvent: 'Bắt bớ Kitô hữu gắt gao · Gặp Đức Kitô phục sinh trên đường Damascus · 3 chuyến truyền giáo đến Hy Lạp, Tiểu Á, Italia · Viết 13 thư Tân Ước · Tử đạo tại Roma.',
    role: '"Tông đồ dân ngoại" — người đem Tin Mừng vượt khỏi Palestine đến toàn Đế quốc Roma. 13 thư của ông là nền thần học Kitô giáo.',
    lesson: '"Ơn của Thầy đủ cho anh rồi, vì sức mạnh của Thầy được biểu lộ trọn vẹn trong sự yếu đuối." (2Cr 12,9) — sức mạnh thật đến từ Chúa, không từ bản thân.',
    verse: '"Tôi sống, nhưng không còn là tôi sống nữa, mà là Đức Kitô sống trong tôi." — Gl 2,20',
    fulfillment: 'Ứng nghiệm Is 49,6: "Ta đặt ngươi làm ánh sáng muôn dân, để ơn cứu độ của Ta lan tràn đến tận cùng trái đất." — Phaolô là người thực hiện lời này.',
    bibleRef: 'Cv 9,1–19 · Rm · 1Cr · Gl · Pl 2,9–11',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM CROSS ICON (Lucide không có icon Cross)
// ═══════════════════════════════════════════════════════════════════════════════

const CrossSVG = ({ size = 40, color = '#F59E0B' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden
  >
    <rect x="17" y="3" width="6" height="34" rx="3" fill={color} />
    <rect x="4" y="12" width="32" height="6" rx="3" fill={color} />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHT PARTICLES (Tân Ước — trắng/xanh, khác với vàng OT)
// ═══════════════════════════════════════════════════════════════════════════════

const NT_PARTICLES = [
  { x: 6,  y: 18, s: 1.5, dur: 5.8, del: 0    },
  { x: 24, y: 72, s: 1,   dur: 4.5, del: 0.7  },
  { x: 41, y: 40, s: 2,   dur: 6.2, del: 1.4  },
  { x: 58, y: 85, s: 1,   dur: 4.8, del: 2.1  },
  { x: 72, y: 22, s: 1.5, dur: 5.3, del: 0.4  },
  { x: 86, y: 60, s: 1,   dur: 6.7, del: 1.0  },
  { x: 14, y: 55, s: 2,   dur: 4.3, del: 2.5  },
  { x: 32, y: 95, s: 1,   dur: 5.1, del: 0.8  },
  { x: 64, y: 10, s: 1.5, dur: 6.0, del: 1.8  },
  { x: 93, y: 42, s: 1,   dur: 4.6, del: 3.0  },
  { x: 48, y: 30, s: 2,   dur: 5.4, del: 0.3  },
  { x: 78, y: 78, s: 1,   dur: 4.9, del: 2.2  },
];

const LightParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {NT_PARTICLES.map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.s,
          height: p.s,
          background: 'rgba(186,230,253,0.8)',
          boxShadow: '0 0 3px rgba(186,230,253,0.6)',
        }}
        animate={{ y: [-6, -28, -6], opacity: [0.8, 0.1, 0.8] }}
        transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// INFO ROW — accordion với icon
// ═══════════════════════════════════════════════════════════════════════════════

const INFO_META = {
  name:   { Icon: Tag,       label: 'Ý nghĩa tên'   },
  event:  { Icon: Zap,       label: 'Biến cố chính'  },
  role:   { Icon: Shield,    label: 'Vai trò'         },
  lesson: { Icon: Lightbulb, label: 'Bài học'         },
};

const InfoRow = ({ type, value, heroColor }) => {
  const [open, setOpen] = useState(false);
  const { Icon, label } = INFO_META[type];

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: open ? `rgba(${heroColor.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',')},0.08)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${open ? heroColor + '30' : 'rgba(255,255,255,0.06)'}`,
      }}
      onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Icon size={13} className="shrink-0" style={{ color: open ? heroColor : '#64748b' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: open ? heroColor : '#64748b' }}>
          {label}
        </span>
        <div className="ml-auto">
          {open
            ? <ChevronUp size={12} style={{ color: heroColor }} />
            : <ChevronDown size={12} style={{ color: '#475569' }} />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-3 pb-3 text-slate-300 text-[12px] leading-relaxed">{value}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HERO CARD — Đức Giêsu (full width, horizontal layout)
// ═══════════════════════════════════════════════════════════════════════════════

const HeroCard = ({ char }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
      whileHover={{
        borderColor: 'rgba(245,158,11,0.6)',
        boxShadow: '0 0 32px rgba(245,158,11,0.25), 0 16px 48px rgba(0,0,0,0.5)',
      }}
      transition={{ duration: 0.22 }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Hero visual — left on md, top on mobile */}
        <div
          className="relative md:w-56 h-44 md:h-auto shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(180,110,0,0.15) 50%, rgba(2,6,23,0.95) 100%)` }}
        >
          {/* Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full" style={{ border: '1px solid rgba(245,158,11,0.12)' }} />
            <div className="absolute w-22 h-22 rounded-full" style={{ border: '1px solid rgba(245,158,11,0.18)', width: 88, height: 88 }} />
            <div className="absolute w-12 h-12 rounded-full" style={{ border: '1px solid rgba(245,158,11,0.25)' }} />
          </div>

          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle 70px at 50% 50%, rgba(245,158,11,0.35) 0%, transparent 70%)' }}
          />

          {/* Cross icon */}
          <motion.div
            className="relative z-10"
            style={{ filter: 'drop-shadow(0 0 22px rgba(245,158,11,0.7))' }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CrossSVG size={52} color="#F59E0B" />
          </motion.div>

          {/* Era badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase tracking-widest">
              {char.era}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-5 py-5 flex flex-col gap-3">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2
                    className="text-xl font-bold text-amber-400 leading-tight"
                    style={{ fontFamily: '"Lexend", "Inter", system-ui, sans-serif' }}
                  >
                    {char.name}
                  </h2>
                  {/* "Ứng nghiệm" badge */}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wider">
                    ✦ Trung tâm
                  </span>
                </div>
                <p className="text-slate-400 text-[12px]">{char.title} · {char.period}</p>
              </div>
            </div>
          </div>

          {/* Info rows — 2x2 grid on md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <InfoRow type="name"   value={char.nameMeaning} heroColor={char.heroColor} />
            <InfoRow type="event"  value={char.mainEvent}   heroColor={char.heroColor} />
            <InfoRow type="role"   value={char.role}        heroColor={char.heroColor} />
            <InfoRow type="lesson" value={char.lesson}      heroColor={char.heroColor} />
          </div>

          {/* Verse */}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(245,158,11,0.08)', borderLeft: '2px solid rgba(245,158,11,0.45)' }}
          >
            <p className="text-amber-300/80 text-[11px] italic leading-relaxed">{char.verse}</p>
          </div>

          {/* Fulfillment toggle */}
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => setExpanded(e => !e)}
          >
            <Sparkles size={11} style={{ color: 'rgba(255,215,0,0.55)' }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,215,0,0.5)' }}>
              Ứng nghiệm Cựu Ước
            </span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
              <ChevronDown size={12} style={{ color: 'rgba(255,215,0,0.4)' }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.18)' }}
                >
                  <Link2 size={11} className="shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.6)' }} />
                  <p className="text-slate-300 text-[12px] leading-relaxed">{char.fulfillment}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGULAR NT CARD
// ═══════════════════════════════════════════════════════════════════════════════

const NTCard = ({ char, index }) => {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = char.LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.article
        className="rounded-2xl overflow-hidden h-full flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        whileHover={{
          y: -5,
          borderColor: `rgba(${char.glowRgb},0.5)`,
          boxShadow: `0 0 20px rgba(${char.glowRgb},0.2), 0 10px 36px rgba(0,0,0,0.45)`,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Hero image area */}
        <div
          className="relative h-32 flex items-center justify-center overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(160deg, rgba(${char.glowRgb},0.25) 0%, rgba(2,6,23,0.95) 100%)`,
          }}
        >
          {/* Concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />
            <div className="absolute w-16 h-16 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.07)' }} />
          </div>

          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle 50px at 50% 50%, rgba(${char.glowRgb},0.3) 0%, transparent 70%)` }}
          />

          {/* Era badge — top left */}
          <div className="absolute top-2.5 left-3">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: `rgba(${char.glowRgb},0.12)`,
                color: char.heroColor,
                border: `1px solid rgba(${char.glowRgb},0.25)`,
              }}
            >
              {char.era}
            </span>
          </div>

          {/* "Ứng nghiệm" badge — top right */}
          <div className="absolute top-2.5 right-3">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25 uppercase tracking-wider">
              Ứng nghiệm
            </span>
          </div>

          {/* Lucide icon */}
          <motion.div
            className="relative z-10"
            style={{ filter: `drop-shadow(0 0 14px rgba(${char.glowRgb},0.7))` }}
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.25 }}
          >
            {IconComponent && (
              <IconComponent
                size={40}
                style={{ color: char.heroColor }}
                strokeWidth={1.5}
              />
            )}
          </motion.div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-3">
          {/* Name */}
          <div>
            <h3
              className="font-bold text-base leading-tight mb-0.5"
              style={{
                fontFamily: '"Lexend", "Inter", system-ui, sans-serif',
                color: char.heroColor,
              }}
            >
              {char.name}
            </h3>
            <p className="text-slate-400 text-[11px]">{char.title} · {char.period}</p>
          </div>

          {/* Info rows */}
          <div className="space-y-1.5 flex-1">
            <InfoRow type="name"   value={char.nameMeaning} heroColor={char.heroColor} />
            <InfoRow type="event"  value={char.mainEvent}   heroColor={char.heroColor} />
            <InfoRow type="role"   value={char.role}        heroColor={char.heroColor} />
            <InfoRow type="lesson" value={char.lesson}      heroColor={char.heroColor} />
          </div>

          {/* Verse */}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{
              background: `rgba(${char.glowRgb},0.07)`,
              borderLeft: `2px solid rgba(${char.glowRgb},0.45)`,
            }}
          >
            <p
              className="text-[11px] italic leading-relaxed"
              style={{ color: `rgba(${char.glowRgb},0.85)` }}
            >
              {char.verse}
            </p>
          </div>

          {/* Fulfillment toggle */}
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => setExpanded(e => !e)}
          >
            <Link2 size={11} style={{ color: `rgba(${char.glowRgb},0.45)` }} className="shrink-0" />
            <span
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: `rgba(${char.glowRgb},0.45)` }}
            >
              Ứng nghiệm Cựu Ước
            </span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
              <ChevronDown size={12} style={{ color: `rgba(${char.glowRgb},0.35)` }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: `rgba(${char.glowRgb},0.07)`, border: `1px solid rgba(${char.glowRgb},0.2)` }}
                >
                  <Sparkles size={11} className="shrink-0 mt-0.5" style={{ color: `rgba(${char.glowRgb},0.6)` }} />
                  <p className="text-slate-300 text-[12px] leading-relaxed">{char.fulfillment}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default function NTCharacterCards() {
  const hero = NT_CHARACTERS.find(c => c.isHero);
  const others = NT_CHARACTERS.filter(c => !c.isHero);

  return (
    <div className="relative">
      {/* Sky particles background */}
      <LightParticles />

      {/* Section label */}
      <div className="relative z-10 flex items-center gap-3 mb-5">
        <div className="w-1 h-4 rounded-full bg-sky-400/60" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/70">
          Nhân vật Tân Ước
        </p>
        <div
          className="h-px flex-1"
          style={{ background: 'linear-gradient(to right, rgba(56,189,248,0.2), transparent)' }}
        />
        <span className="text-[10px] text-slate-600">Click vào ô để xem chi tiết</span>
      </div>

      {/* Jesus hero card — full width */}
      <div className="relative z-10 mb-4">
        {hero && <HeroCard char={hero} />}
      </div>

      {/* 5 remaining characters — responsive grid */}
      {/* Desktop: 3-col | Tablet: 2-col | Mobile: 2-col (smaller) */}
      <motion.div
        className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {others.map((char, i) => (
          <NTCard key={char.id} char={char} index={i} />
        ))}
      </motion.div>

      {/* Bottom gradient blend */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.3), transparent)' }}
      />
    </div>
  );
}
