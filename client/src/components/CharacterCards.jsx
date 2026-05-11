import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Zap, Shield, Lightbulb, BookOpen, ChevronDown, ChevronUp, Link2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU — tách biệt hoàn toàn khỏi UI
// ═══════════════════════════════════════════════════════════════════════════════

const CHARACTERS = [
  {
    id: 'abraham',
    name: 'Abraham',
    title: 'Cha của đức tin',
    period: '~2000 TCN',
    emoji: '⛺',
    era: 'Tổ phụ',
    heroColor: '#CD853F',
    imageUrl: '/images/characters/old-testament/abraham.jpg',
    imagePosition: 'top',
    nameMeaning: '"Cha của nhiều dân tộc" — từ Abram (cha được tôn trọng) đổi thành Abraham sau Giao ước cắt bì.',
    mainEvent: 'Rời Ur theo tiếng gọi Chúa; sẵn sàng dâng con trai Isaac; nhận lời hứa dòng dõi đông như sao trời.',
    role: 'Người lập nền Giao ước Cứu độ — qua ông mọi dân tộc được chúc phúc.',
    lesson: 'Đức tin đích thực không cần thấy trước — chỉ cần tin vào Đấng đang dẫn đường.',
    verse: '"Bởi đức tin, Abraham đã vâng nghe tiếng gọi mà ra đi, dù không biết mình đi đâu." — Hr 11,8',
    ntLink: 'Đức Giêsu là "Con cháu Abraham" (Mt 1,1) — ứng nghiệm lời hứa Giao ước.',
    bibleRef: 'St 12 · 15 · 17 · 22',
  },
  {
    id: 'moses',
    name: 'Môsê',
    title: 'Người giải phóng',
    period: '~1318–1198 TCN',
    emoji: '🔥',
    era: 'Xuất hành',
    heroColor: '#4A90D9',
    imageUrl: '/images/characters/old-testament/moses.jpg',
    imagePosition: 'center',
    nameMeaning: '"Được kéo ra khỏi nước" — công chúa Ai Cập đặt khi vớt ông từ sông Nile lúc còn là trẻ sơ sinh.',
    mainEvent: 'Gặp Thiên Chúa qua bụi gai lửa (Xh 3); lãnh đạo Xuất hành khỏi Ai Cập; nhận Mười Điều Răn trên Sinai.',
    role: 'Trung gian Giao ước giữa Thiên Chúa và dân Israel — hình bóng của Đức Kitô Trung gian Giao ước Mới.',
    lesson: 'Thiên Chúa không chọn người hoàn hảo — Ngài biến người yếu đuối thành khí cụ mạnh mẽ.',
    verse: '"Ta là Đấng Ta Là (YHWH). Hãy nói với con cái Israel: Đấng Ta Là đã sai tôi đến." — Xh 3,14',
    ntLink: '"Pháp luật đến từ Môsê, ân sủng và sự thật đến từ Đức Giêsu Kitô." — Ga 1,17',
    bibleRef: 'Xh 3 · 14 · 20',
  },
  {
    id: 'david',
    name: 'Đavít',
    title: 'Vua thi sĩ',
    period: '~1040–970 TCN',
    emoji: '👑',
    era: 'Vương quốc',
    heroColor: '#9B59B6',
    imageUrl: '/images/characters/old-testament/david.jpg',
    imagePosition: 'center 15%',
    nameMeaning: '"Người được yêu thương" — biểu thị tình yêu đặc biệt Thiên Chúa dành cho ông ngay từ khi còn là người chăn chiên.',
    mainEvent: 'Được xức dầu từ người chăn chiên thành vua; chiến thắng Gôliát bằng đức tin; nhận Giao ước đời đời từ Thiên Chúa (2Sm 7).',
    role: 'Nền tảng Giao ước Mêsia — "Con vua Đavít" là tước hiệu Mêsia căn bản trong Tân Ước.',
    lesson: 'Thiên Chúa không nhìn dáng vẻ bên ngoài — "Ta xét con người qua tâm lòng." (1Sm 16,7)',
    verse: '"Ta sẽ lập dòng dõi ngươi sau khi ngươi qua đời... vương triều ngươi sẽ kiên vững đến muôn đời." — 2Sm 7,12–13',
    ntLink: 'Sứ thần loan tin: "Thiên Chúa sẽ ban cho Người ngôi báu Đavít tổ tiên." — Lc 1,32',
    bibleRef: '1Sm 16 · 17 · 2Sm 7 · Tv 22 · 51',
  },
  {
    id: 'isaiah',
    name: 'Isaia',
    title: 'Ngôn sứ ơn cứu độ',
    period: '~740–700 TCN',
    emoji: '📜',
    era: 'Ngôn sứ',
    heroColor: '#E67E22',
    imageUrl: '/images/characters/old-testament/isaiah.jpg',
    imagePosition: 'top',
    nameMeaning: '"Thiên Chúa cứu độ" hay "Ơn cứu độ của YHWH" — tên ông chứa đựng sứ điệp cả cuộc đời.',
    mainEvent: 'Thị kiến ngai thánh (Is 6); tiên báo trinh nữ thụ thai Emmanuel (Is 7,14); viết về Người Tôi Tớ đau khổ (Is 53).',
    role: '"Tin Mừng thứ năm" — mô tả Đức Kitô chi tiết hơn bất kỳ sách Cựu Ước nào, viết trước 700 năm.',
    lesson: '"Này con đây, xin hãy sai con đi." — Sẵn sàng đáp tiếng Chúa ngay cả khi cảm thấy bất xứng.',
    verse: '"Người Tôi Tớ đau khổ: vì tội lỗi ta mà Người bị đâm thâu, vì sự gian ác ta mà Người bị nghiền nát." — Is 53,5',
    ntLink: 'Đức Giêsu đọc Is 61 tại Nadarét: "Hôm nay ứng nghiệm lời Kinh Thánh này trước mặt anh em." — Lc 4,21',
    bibleRef: 'Is 6 · 7,14 · 53 · 61',
  },
  {
    id: 'jeremiah',
    name: 'Giêrêmia',
    title: 'Ngôn sứ Giao ước Mới',
    period: '~645–580 TCN',
    emoji: '🕯️',
    era: 'Lưu đày',
    heroColor: '#1ABC9C',
    imageUrl: '/images/characters/old-testament/jeremiah.jpg',
    imagePosition: 'center 20%',
    nameMeaning: '"Thiên Chúa nâng đỡ" — nhưng chính ông lại là ngôn sứ chịu khổ đau nhất, hình bóng của Đức Kitô.',
    mainEvent: 'Được gọi từ trước khi sinh (Gr 1); viết thư gửi người lưu đày Babylon; tiên báo Giao ước Mới ghi vào lòng (Gr 31).',
    role: 'Cầu nối Lưu đày → Tân Ước. Lời Gr 31 về Giao ước Mới là tiên tri trực tiếp nhất về Bí tích Thánh Thể.',
    lesson: 'Trung thành với Chúa không đo bằng thành công — mà đo bằng kiên trung dù không ai nghe.',
    verse: '"Ta sẽ đặt Luật Ta vào lòng họ, khắc vào tâm khảm họ. Ta sẽ là Thiên Chúa của chúng." — Gr 31,33',
    ntLink: '"Chén này là Giao ước Mới lập bằng Máu Ta — Máu đổ ra vì anh em." — Lc 22,20 (ứng nghiệm Gr 31)',
    bibleRef: 'Gr 1 · 29 · 31,31–34',
  },
  {
    id: 'elijah',
    name: 'Êlia',
    title: 'Ngôn sứ lửa',
    period: '~870–850 TCN',
    emoji: '⚡',
    era: 'Ngôn sứ',
    heroColor: '#F1C40F',
    imageUrl: '/images/characters/old-testament/elijah.jpg',
    imagePosition: 'center top',
    nameMeaning: '"Thiên Chúa của tôi là YHWH" — tên ông là lời tuyên xưng đức tin, đối nghịch với thờ Baal.',
    mainEvent: 'Chiến thắng 450 ngôn sứ Baal trên núi Carmel (1V 18); gặp Thiên Chúa trong tiếng gió hiu hiu (1V 19); được rước lên trời.',
    role: 'Tiêu biểu cho toàn bộ các ngôn sứ — đại diện trong biến cố Chúa biến hình cùng Môsê (Mt 17).',
    lesson: 'Thiên Chúa không phải trong lửa ầm ĩ mà trong tiếng thì thầm — Ngài gần gũi hơn ta nghĩ.',
    verse: '"Sau lửa có tiếng gió hiu hiu. Khi Êlia nghe, ông lấy áo che mặt rồi ra đứng ở cửa hang." — 1V 19,12–13',
    ntLink: 'Gioan Tẩy Giả được xem là "Êlia mới" dọn đường cho Đấng Cứu Thế (Mt 11,14).',
    bibleRef: '1V 17–19 · Mt 17,3',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GOLD PARTICLES (deterministic — không dùng Math.random() khi render)
// ═══════════════════════════════════════════════════════════════════════════════

// Vị trí và thuộc tính tính trước để tránh shimmer khi re-render
const PARTICLES = [
  { x: 8,  y: 12, s: 2,   dur: 5.2, del: 0    },
  { x: 22, y: 68, s: 1.5, dur: 4.8, del: 0.6  },
  { x: 38, y: 35, s: 1,   dur: 6.1, del: 1.2  },
  { x: 54, y: 82, s: 2.5, dur: 4.4, del: 0.3  },
  { x: 67, y: 18, s: 1.5, dur: 5.7, del: 1.8  },
  { x: 79, y: 55, s: 1,   dur: 4.9, del: 0.9  },
  { x: 91, y: 75, s: 2,   dur: 5.5, del: 2.1  },
  { x: 12, y: 90, s: 1,   dur: 6.3, del: 1.5  },
  { x: 46, y: 58, s: 1.5, dur: 4.6, del: 0.4  },
  { x: 73, y: 40, s: 2,   dur: 5.0, del: 2.7  },
  { x: 85, y: 22, s: 1,   dur: 6.8, del: 1.1  },
  { x: 30, y: 15, s: 2.5, dur: 4.2, del: 2.4  },
  { x: 60, y: 95, s: 1.5, dur: 5.3, del: 0.7  },
  { x: 95, y: 48, s: 1,   dur: 4.7, del: 3.0  },
  { x: 18, y: 44, s: 2,   dur: 5.9, del: 1.3  },
  { x: 42, y: 78, s: 1,   dur: 6.0, del: 2.0  },
  { x: 76, y: 8,  s: 1.5, dur: 4.5, del: 0.2  },
  { x: 5,  y: 62, s: 2,   dur: 5.6, del: 3.2  },
  { x: 57, y: 30, s: 1,   dur: 5.1, del: 1.7  },
  { x: 88, y: 88, s: 2.5, dur: 4.3, del: 2.8  },
];

const GoldParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {PARTICLES.map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.s,
          height: p.s,
          background: 'rgba(212,175,55,0.7)',
          boxShadow: '0 0 4px rgba(212,175,55,0.5)',
        }}
        animate={{ y: [-8, -32, -8], opacity: [0.7, 0.15, 0.7] }}
        transition={{
          duration: p.dur,
          delay: p.del,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// INFO ROW — icon + label + value
// ═══════════════════════════════════════════════════════════════════════════════

const INFO_ICONS = {
  name:   { Icon: Tag,        label: 'Ý nghĩa tên',   color: '#94a3b8' },
  event:  { Icon: Zap,        label: 'Biến cố chính', color: '#94a3b8' },
  role:   { Icon: Shield,     label: 'Vai trò',        color: '#94a3b8' },
  lesson: { Icon: Lightbulb,  label: 'Bài học',        color: '#94a3b8' },
};

const InfoRow = ({ type, value, heroColor }) => {
  const { Icon, label, color } = INFO_ICONS[type];
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: open ? `${heroColor}0c` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${open ? heroColor + '28' : 'rgba(255,255,255,0.06)'}`,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Icon
          size={13}
          className="shrink-0"
          style={{ color: open ? heroColor : color }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider shrink-0"
          style={{ color: open ? heroColor : '#64748b' }}
        >
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
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p
              className="px-3 pb-3 text-slate-300 text-[12px] leading-relaxed"
              style={{ paddingTop: 0 }}
            >
              {value}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER CARD
// ═══════════════════════════════════════════════════════════════════════════════

const CharacterCard = ({ char, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError]  = useState(false);
  const showImg = char.imageUrl && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full flex flex-col"
    >
      <motion.article
        className="group rounded-2xl overflow-hidden flex flex-col h-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        whileHover={{
          y: -6,
          borderColor: 'rgba(245,158,11,0.5)',
          boxShadow: '0 0 20px rgba(245,158,11,0.2), 0 12px 40px rgba(0,0,0,0.5)',
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {/* ── Hero image area — aspect-4/3 đồng nhất ── */}
        <div className="relative aspect-4/3 overflow-hidden shrink-0 bg-slate-900">

          {showImg ? (
            /* ── Ảnh thật ── */
            <img
              src={char.imageUrl}
              alt={char.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: char.imagePosition ?? 'center' }}
              onError={() => setImgError(true)}
              loading="lazy"
              draggable={false}
            />
          ) : (
            /* ── Fallback: gradient + emoji ── */
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${char.heroColor}28 0%, rgba(2,6,23,0.95) 100%)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />
                <div className="absolute w-20 h-20 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle 60px at 50% 50%, ${char.heroColor}30 0%, transparent 70%)` }}
              />
              <span className="relative z-10 text-5xl select-none"
                style={{ filter: `drop-shadow(0 0 18px ${char.heroColor}55)` }}>
                {char.emoji}
              </span>
            </div>
          )}

          {/* Glow overlay khi hover */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${char.heroColor}22 0%, transparent 70%)` }}
          />

          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgb(2 6 23) 0%, rgba(2,6,23,0.5) 60%, transparent 100%)' }}
          />

          {/* Era badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-sm"
              style={{ background: 'rgba(245,158,11,0.15)', color: 'rgb(251,191,36)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              {char.era}
            </span>
          </div>

          {/* Bible ref */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[9px] text-slate-500 font-mono">{char.bibleRef.split('·')[0].trim()}</span>
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-col flex-1 px-4 pt-4 pb-4 gap-3">
          {/* Name + title */}
          <div>
            <h3
              className="font-bold text-lg leading-tight text-amber-400 mb-0.5"
              style={{ fontFamily: '"Lexend", "Inter", system-ui, sans-serif' }}
            >
              {char.name}
            </h3>
            <p className="text-slate-400 text-[12px]">{char.title} · {char.period}</p>
          </div>

          {/* Info rows — 4 items with icons */}
          <div className="space-y-1.5 flex-1">
            <InfoRow type="name"   value={char.nameMeaning} heroColor={char.heroColor} />
            <InfoRow type="event"  value={char.mainEvent}   heroColor={char.heroColor} />
            <InfoRow type="role"   value={char.role}        heroColor={char.heroColor} />
            <InfoRow type="lesson" value={char.lesson}      heroColor={char.heroColor} />
          </div>

          {/* Verse */}
          <div
            className="rounded-lg px-3 py-2.5 border-l-2"
            style={{
              background: `${char.heroColor}0a`,
              borderColor: `${char.heroColor}50`,
              borderTopWidth: 0,
              borderRightWidth: 0,
              borderBottomWidth: 0,
            }}
          >
            <p
              className="text-[11px] italic leading-relaxed"
              style={{ color: `${char.heroColor}cc` }}
            >
              {char.verse}
            </p>
          </div>

          {/* NT Link — toggle */}
          <button
            className="flex items-center gap-2 text-left group"
            onClick={() => setExpanded(e => !e)}
          >
            <Link2 size={11} style={{ color: 'rgba(255,215,0,0.5)' }} className="shrink-0 group-hover:text-yellow-400 transition-colors" />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,215,0,0.45)' }}>
              Liên hệ Tân Ước
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto"
            >
              <ChevronDown size={12} style={{ color: 'rgba(255,215,0,0.35)' }} />
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
                  style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.18)' }}
                >
                  <BookOpen size={11} className="shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.6)' }} />
                  <p className="text-slate-300 text-[12px] leading-relaxed">{char.ntLink}</p>
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

export default function CharacterCards() {
  return (
    <div className="relative">
      {/* Gold particle background */}
      <GoldParticles />

      {/* Section label */}
      <div className="relative z-10 flex items-center gap-3 mb-5">
        <div className="w-1 h-4 rounded-full bg-amber-500/60" />
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(245,158,11,0.65)' }}
        >
          Nhân vật Cựu Ước
        </p>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(245,158,11,0.2), transparent)' }} />
        <span className="text-[10px] text-slate-600">Click vào ô để xem chi tiết</span>
      </div>

      {/* Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHARACTERS.map((char, i) => (
          <CharacterCard key={char.id} char={char} index={i} />
        ))}
      </div>

      {/* Faint bottom gradient to blend with page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.4), transparent)' }}
      />
    </div>
  );
}
