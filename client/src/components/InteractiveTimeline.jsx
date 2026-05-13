import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BookOpen, ChevronRight, X, Users, Volume2, VolumeX } from 'lucide-react';

// ─── Mapping milestone → BibleMap location ────────────────────────────────────
const MILESTONE_TO_MAP_LOC = {
  'to-phu':    'hebron',
  'xuat-hanh': 'beersheba',
  'vuong-quoc':'jerusalem',
  'luu-day':   'jerusalem',
  'hoi-huong': 'jerusalem',
  'nhap-the':  'bethlehem',
  'su-vu':     'galilee-lake',
  'kho-nan':   'jerusalem',
  'hien-xuong':'jerusalem',
};

// ─── Metadata địa lý + nhân vật ───────────────────────────────────────────────
const MILESTONE_META = {
  'sang-the': {
    loc: { name: 'Vườn Eden', note: 'Thiên Chúa dựng nên Adam và Eva — Imago Dei.' },
    chars: [
      { name: 'Adam', emoji: '🧑', role: 'Người đầu tiên, hình ảnh Thiên Chúa. Tội bất tuân phá vỡ Giao ước nguyên thủy.' },
      { name: 'Eva', emoji: '👩', role: '"Bà là mẹ của chúng sinh" (St 3,20). Tiên báo về Đức Maria — Eva mới.' },
    ],
  },
  'to-phu': {
    loc: { name: 'Ur · Haran · Hébron', note: 'Hành trình đức tin từ Mesopotamia đến Canaan.' },
    chars: [
      { name: 'Abraham', emoji: '👴', role: 'Cha của đức tin. "Mọi gia tộc sẽ được chúc phúc nhờ ngươi." (St 12,3)' },
      { name: 'Isaac', emoji: '👦', role: 'Con của lời hứa. Hình bóng Đức Kitô — sẵn sàng được hiến dâng.' },
      { name: 'Giacóp', emoji: '👨', role: 'Được đặt tên Israel. 12 người con = 12 chi tộc Israel.' },
    ],
  },
  'xuat-hanh': {
    loc: { name: 'Gôsen · Biển Đỏ · Sinai', note: '430 năm nô lệ, vượt Biển Đỏ, Mười Điều Răn.' },
    chars: [
      { name: 'Môsê', emoji: '🔥', role: 'Người giải phóng. Nhận danh Thiên Chúa: YHWH. Trung gian Giao ước Sinai.' },
      { name: 'Aaron', emoji: '✡️', role: 'Thầy tư tế đầu tiên. Phát ngôn viên của Môsê trước Pharaô.' },
    ],
  },
  'vuong-quoc': {
    loc: { name: 'Giêrusalem · Bêlem · Đồi Moriah', note: 'Kinh đô Đavít, Đền Thờ Salômôn.' },
    chars: [
      { name: 'Đavít', emoji: '👑', role: 'Vua theo lòng Thiên Chúa. Giao ước: dòng dõi ông sẽ trị vì mãi mãi.' },
      { name: 'Salômôn', emoji: '🏛️', role: 'Xây Đền Thờ — nơi Thiên Chúa ngự. Khôn ngoan nhất loài người.' },
    ],
  },
  'luu-day': {
    loc: { name: 'Giêrusalem → Babylon', note: 'Đền Thờ bị phá (587 TCN). Ngôn sứ loan báo Giao Ước Mới.' },
    chars: [
      { name: 'Isaia', emoji: '📜', role: '"Người Tôi Tớ đau khổ" (Is 53) — tiên tri trực tiếp về Đức Kitô.' },
      { name: 'Giêrêmia', emoji: '✍️', role: 'Loan báo Giao Ước Mới ghi vào lòng người (Gr 31,33).' },
      { name: 'Êdêkiel', emoji: '⚡', role: 'Thị kiến xương khô sống lại — hình bóng Phục Sinh.' },
    ],
  },
  'hoi-huong': {
    loc: { name: 'Babylon → Giêrusalem', note: 'Sắc lệnh Kyrô (538 TCN). Tái thiết Đền Thờ.' },
    chars: [
      { name: 'Kyrô', emoji: '🏺', role: 'Vua Ba Tư — "Người chăn chiên" của Thiên Chúa (Is 44,28). Đạo cụ quan phòng.' },
      { name: 'Esdra', emoji: '📖', role: 'Mang Luật Chúa về. Canh tân đức tin cho dân hồi hương.' },
      { name: 'Nêhêmia', emoji: '🧱', role: 'Xây lại tường thành trong 52 ngày dưới sự bảo trợ Thiên Chúa.' },
    ],
  },
  'nhap-the': {
    loc: { name: 'Nadarét · Bêlem', note: 'Truyền tin, Giáng sinh trong máng cỏ.' },
    chars: [
      { name: 'Đức Giêsu', emoji: '✝️', role: '"Ngôi Lời đã trở nên người phàm." (Ga 1,14) Trung tâm Lịch sử Cứu độ.' },
      { name: 'Đức Maria', emoji: '💙', role: '"Xin hãy thực hiện theo lời sứ thần." Eva Mới, Mẹ Thiên Chúa (Lk 1,38).' },
      { name: 'Thánh Giuse', emoji: '🔨', role: '"Người công chính." Cha nuôi Đức Giêsu, bảo vệ Gia đình Thánh.' },
    ],
  },
  'su-vu': {
    loc: { name: 'Galilê · Samaria · Giuđê', note: '3 năm rao giảng Tin Mừng Nước Trời.' },
    chars: [
      { name: 'Gioan T.G.', emoji: '💧', role: '"Dọn đường Chúa." Rao giảng sám hối và phép rửa ở sông Jordan.' },
      { name: 'Phêrô', emoji: '⚓', role: '"Anh là Đá, trên đá này Ta sẽ xây Hội Thánh." (Mt 16,18)' },
      { name: 'Nhóm Mười Hai', emoji: '👥', role: 'Nền tảng tông truyền của Hội Thánh — 12 như 12 chi tộc Israel mới.' },
    ],
  },
  'kho-nan': {
    loc: { name: 'Giêrusalem · Calvê', note: 'Tiệc Ly, Thập giá, Phục Sinh ngày thứ ba.' },
    chars: [
      { name: 'Đức Giêsu', emoji: '✝️', role: '"Không có tình yêu nào lớn hơn..." Chiên Vượt Qua đích thực.' },
      { name: 'Maria M.', emoji: '🌹', role: '"Người đầu tiên thấy Chúa Phục Sinh." Tông đồ của các tông đồ.' },
    ],
  },
  'hien-xuong': {
    loc: { name: 'Giêrusalem · Antiokia · Rôma', note: 'Lễ Ngũ Tuần — Hội Thánh ra đời.' },
    chars: [
      { name: 'Phêrô', emoji: '⚓', role: 'Thủ lĩnh Hội Thánh sơ khai. Bài giảng Ngũ Tuần — 3.000 người chịu phép rửa.' },
      { name: 'Phaolô', emoji: '✉️', role: 'Từ kẻ bách hại thành tông đồ. 3 chuyến truyền giáo, 14 thư.' },
      { name: 'Stêphanô', emoji: '🌟', role: 'Tử đạo đầu tiên. "Lạy Chúa Giêsu, xin nhận lấy hồn con." (Cv 7,59)' },
    ],
  },
};

const SALVATION_FIGURES = [
  { name: 'Môsê',        role: 'Người Lãnh Đạo',  verse: '"Ta là Đấng Ta Là." — Xh 3,14',              emoji: '🔥', color: '#4A90D9' },
  { name: 'Đức Giêsu',   role: 'Đấng Cứu Thế',    verse: '"Ta là đường, sự thật và sự sống." — Ga 14,6', emoji: '✝️', color: '#FFD700' },
  { name: 'Gioan T.Đ.',  role: 'Người Chứng Nhân', verse: '"Thiên Chúa là tình yêu." — 1Ga 4,16',         emoji: '💙', color: '#38BDF8' },
  { name: 'Thánh Giuse', role: 'Người Bảo Vệ',     verse: '"Ông là người công chính." — Mt 1,19',          emoji: '🔨', color: '#C8860A' },
];

// ─── Character Popup ──────────────────────────────────────────────────────────
const CharacterPopup = ({ char, color, onClose }) => (
  <motion.div
    className="absolute z-50 w-52 rounded-xl overflow-hidden shadow-2xl"
    style={{
      bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(8,6,3,0.97)',
      border: `1px solid ${color}45`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}18`,
    }}
    initial={{ opacity: 0, y: 6, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.92 }}
    transition={{ duration: 0.15 }}
    onClick={e => e.stopPropagation()}
  >
    <div className="flex items-start justify-between px-3.5 py-2.5 gap-2"
      style={{ background: `${color}14`, borderBottom: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{char.emoji}</span>
        <span className="font-bold text-[13px]"
          style={{ fontFamily: '"EB Garamond", Georgia, serif', color }}>{char.name}</span>
      </div>
      <button onClick={onClose}
        className="text-white/30 hover:text-white transition p-0.5">
        <X size={11} />
      </button>
    </div>
    <p className="px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white/65"
      style={{ fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic' }}>
      {char.role}
    </p>
  </motion.div>
);

// ─── Location Popup ───────────────────────────────────────────────────────────
const LocationPopup = ({ milestone, onClose }) => {
  const meta = MILESTONE_META[milestone.id];
  if (!meta) return null;
  const { borderColor, accent } = milestone;
  return (
    <motion.div
      className="absolute z-40 w-60 rounded-2xl overflow-hidden"
      style={{
        bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(8,6,3,0.97), rgba(16,12,5,0.97))',
        border: `1px solid ${borderColor}45`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${borderColor}18`,
      }}
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.94 }}
      transition={{ duration: 0.16 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-2"
        style={{ background: `${borderColor}14`, borderBottom: `1px solid ${borderColor}20` }}>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <MapPin size={9} style={{ color: borderColor }} />
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: `${borderColor}80` }}>Vị trí</span>
          </div>
          <p className="font-bold text-[13px] leading-tight"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
            {meta.loc.name}
          </p>
        </div>
        <button onClick={onClose}
          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white/35 hover:text-white shrink-0">
          <X size={11} />
        </button>
      </div>
      <p className="px-4 py-3 text-[12px] text-white/62 leading-relaxed">{meta.loc.note}</p>
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {meta.chars.map(c => (
          <span key={c.name}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: `${accent}18`, border: `1px solid ${borderColor}28`, color: borderColor }}>
            {c.emoji} {c.name}
          </span>
        ))}
      </div>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm"
        style={{ background: 'rgba(16,12,5,0.97)', borderRight: `1px solid ${borderColor}35`, borderBottom: `1px solid ${borderColor}35` }} />
    </motion.div>
  );
};

// ─── Card Body ────────────────────────────────────────────────────────────────
const CardBody = ({ milestone, onOpen, locOpen, setLocOpen, slide, onMapSync }) => {
  const [activeChar, setActiveChar] = useState(null);
  const { id, accent, borderColor, badgeLabel, badgeStyle, period, label, emoji, summary, verse } = milestone;
  const meta = MILESTONE_META[id];

  return (
    <motion.article
      className="relative rounded-2xl p-5 cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1px solid ${borderColor}2a`,
        boxShadow: `0 4px 24px ${accent}12, inset 0 1px 0 rgba(255,255,255,0.055)`,
      }}
      initial={{ opacity: 0, x: slide === 'right' ? 32 : -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -4,
        boxShadow: `0 10px 40px ${accent}28, 0 0 0 1px ${borderColor}45, inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
      onHoverStart={() => onMapSync(MILESTONE_TO_MAP_LOC[id] ?? null)}
      onHoverEnd={() => onMapSync(null)}
      onClick={() => onOpen(milestone)}
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 95% 5%, ${borderColor}16, transparent 65%)` }} />

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest" style={badgeStyle}>{badgeLabel}</span>
        <span className="text-[10px] text-white/30 font-mono">{period}</span>
        {meta && (
          <button
            className="ml-auto flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold transition-all hover:scale-105"
            style={{ background: `${borderColor}1a`, border: `1px solid ${borderColor}35`, color: borderColor }}
            onClick={e => { e.stopPropagation(); setLocOpen(v => !v); }}
          >
            <MapPin size={9} />Vị trí
          </button>
        )}
      </div>

      {/* Title — serif */}
      <h3 className="font-bold text-xl leading-tight mb-2"
        style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
        {emoji} {label}
      </h3>

      {/* Summary — sans-serif */}
      <p className="text-[13px] leading-relaxed mb-4 text-white/58"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
        {summary}
      </p>

      {/* Verse — serif italic với border-left */}
      <div className="rounded-xl px-4 py-3 mb-4"
        style={{ background: `linear-gradient(135deg, ${accent}10, ${accent}06)`, borderLeft: `3px solid ${borderColor}65` }}>
        <p className="text-[12px] leading-relaxed"
          style={{ color: `${borderColor}c8`, fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic' }}>
          {verse}
        </p>
      </div>

      {/* Character avatars */}
      {meta && (
        <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
          <span className="text-[9px] uppercase tracking-wider text-white/25 mr-0.5">Nhân vật:</span>
          {meta.chars.map(c => (
            <div key={c.name} className="relative">
              <button
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background: activeChar === c.name ? `${borderColor}28` : `${borderColor}10`,
                  border: `1px solid ${borderColor}${activeChar === c.name ? '50' : '25'}`,
                  color: activeChar === c.name ? borderColor : `${borderColor}aa`,
                }}
                onClick={() => setActiveChar(prev => prev === c.name ? null : c.name)}
              >
                {c.emoji} {c.name}
              </button>
              <AnimatePresence>
                {activeChar === c.name && (
                  <CharacterPopup char={c} color={borderColor} onClose={() => setActiveChar(null)} />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: borderColor }}>
        <BookOpen size={11} /><span>Xem bài giáo lý</span><ChevronRight size={11} />
      </div>

      {/* Location popup */}
      <AnimatePresence>
        {locOpen && <LocationPopup milestone={milestone} onClose={() => setLocOpen(false)} />}
      </AnimatePresence>
    </motion.article>
  );
};

// ─── Single Timeline Row ──────────────────────────────────────────────────────
const TimelineCard = ({ milestone, index, onOpen, onMapSync, isActive }) => {
  const [locOpen, setLocOpen] = useState(false);
  const isRight = index % 2 === 0;
  const { id, accent, borderColor, emoji } = milestone;

  return (
    <div id={`tl-${id}`}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_56px_1fr] items-start gap-0">
      {/* Left */}
      <div className="hidden md:flex justify-end pr-6">
        {!isRight && (
          <CardBody milestone={milestone} onOpen={onOpen} locOpen={locOpen}
            setLocOpen={setLocOpen} slide="left" onMapSync={onMapSync} />
        )}
      </div>
      {/* Center node */}
      <div className="hidden md:flex flex-col items-center">
        <motion.button
          className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-xl border-2 overflow-visible"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${accent}ee, ${accent}66)`,
            borderColor: borderColor,
            boxShadow: isActive
              ? `0 0 0 4px ${accent}45, 0 0 0 10px ${accent}22, 0 0 36px ${accent}85`
              : `0 0 0 4px ${accent}18, 0 0 20px ${accent}50`,
            transition: 'box-shadow 0.4s ease',
          }}
          onClick={() => onOpen(milestone)}
          whileHover={{ scale: 1.14 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          {emoji}
          {/* Active pulse rings */}
          {isActive && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor }}
                animate={{ scale: [1, 2.0], opacity: [0.55, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border pointer-events-none"
                style={{ borderColor }}
                animate={{ scale: [1, 2.6], opacity: [0.3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
              />
            </>
          )}
        </motion.button>
      </div>
      {/* Right */}
      <div>
        {/* Mobile: always */}
        <div className="md:hidden">
          <CardBody milestone={milestone} onOpen={onOpen} locOpen={locOpen}
            setLocOpen={setLocOpen} slide="right" onMapSync={onMapSync} />
        </div>
        {/* Desktop: only if right */}
        {isRight && (
          <div className="hidden md:block pl-6">
            <CardBody milestone={milestone} onOpen={onOpen} locOpen={locOpen}
              setLocOpen={setLocOpen} slide="right" onMapSync={onMapSync} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Progress Spine ───────────────────────────────────────────────────────────
const ProgressSpine = ({ milestones, activeId }) => {
  const idx = milestones.findIndex(m => m.id === activeId);
  const pct = milestones.length <= 1 ? 0 : (idx / (milestones.length - 1)) * 100;
  const activeM = milestones[idx] ?? milestones[0];
  const color = activeM?.borderColor ?? '#D4AF37';
  const accentColor = activeM?.accent ?? '#C8860A';

  return (
    <>
      {/* Dim background line */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 inset-y-0 w-px pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.06)' }} />
      {/* Bright progress fill — motion-animated */}
      <motion.div
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-0.5 pointer-events-none"
        animate={{ height: `${pct}%` }}
        transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: `linear-gradient(180deg, ${color} 0%, ${accentColor}88 100%)`,
          boxShadow: `0 0 12px ${accentColor}80`,
        }}
      />
      {/* Glowing orb at the progress tip */}
      <div
        className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
        style={{
          top: `${pct}%`,
          marginTop: '-6px',
          transition: 'top 0.75s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 14px ${color}, 0 0 28px ${accentColor}90` }}
          animate={{ scale: [1, 1.45, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </>
  );
};

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
const SidebarNav = ({ milestones, activeId }) => (
  <div className="hidden lg:block self-start" style={{ width: 164, flexShrink: 0, position: 'sticky', top: 88 }}>
    <p className="text-[9px] uppercase tracking-[0.22em] mb-2.5 px-2 text-white/22">Giai đoạn</p>
    <div className="flex flex-col gap-0.5">
      {milestones.map(m => {
        const on = activeId === m.id;
        return (
          <button key={m.id}
            onClick={() => document.getElementById(`tl-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all duration-200"
            style={{
              background: on ? `${m.accent}20` : 'transparent',
              border: `1px solid ${on ? m.borderColor + '38' : 'transparent'}`,
            }}
          >
            <span className="text-[15px] shrink-0" style={{ filter: on ? 'none' : 'grayscale(55%) opacity(0.7)' }}>{m.emoji}</span>
            <span className="text-[11px] font-medium leading-tight truncate" style={{ color: on ? m.borderColor : 'rgba(255,255,255,0.38)' }}>{m.label}</span>
            {on && (
              <motion.span className="ml-auto w-1 h-3.5 rounded-full shrink-0"
                style={{ background: m.borderColor }}
                layoutId="tlSidebarBar"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Ambient Sound Toggle ─────────────────────────────────────────────────────
const AmbientToggle = () => {
  const [on, setOn] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (on) { audioRef.current.pause(); }
    else { audioRef.current.volume = 0.18; audioRef.current.play().catch(() => {}); }
    setOn(p => !p);
  };

  return (
    <>
      {/* Audio file — người dùng đặt /audio/ambient-middle-east.mp3 vào public/ */}
      <audio ref={audioRef} src="/audio/ambient-middle-east.mp3" loop preload="none" />
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-105"
        style={{
          background: on ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${on ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: on ? '#D4AF37' : 'rgba(255,255,255,0.35)',
        }}
        title={on ? 'Tắt nhạc nền' : 'Bật nhạc nền Trung Đông cổ đại'}
      >
        {on ? <Volume2 size={11} /> : <VolumeX size={11} />}
        <span>{on ? 'Đang phát' : 'Nhạc nền'}</span>
      </button>
    </>
  );
};

// ─── Salvation Footer ─────────────────────────────────────────────────────────
const SalvationFooter = ({ theme }) => (
  <motion.section
    className="mt-20 rounded-3xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.065)' }}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.5 }}
  >
    <div className="px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <Users size={15} style={{ color: theme.tabGlow }} />
          <h3 className="font-bold" style={{ fontFamily: '"EB Garamond", Georgia, serif', color: theme.tabGlow, fontSize: '1.05rem' }}>
            Kế hoạch Cứu độ — Nhân vật tiêu biểu
          </h3>
        </div>
        <p className="text-[11px] text-white/30 mt-1">Bốn nhân vật then chốt trong hành trình Thiên Chúa tìm kiếm con người</p>
      </div>
      <AmbientToggle />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/4.5">
      {SALVATION_FIGURES.map((f, i) => (
        <motion.div key={f.name} className="px-5 py-5 flex flex-col gap-2.5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
        >
          <span className="text-3xl">{f.emoji}</span>
          <div>
            <p className="font-bold text-[14px]" style={{ fontFamily: '"EB Garamond", Georgia, serif', color: f.color }}>{f.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: `${f.color}68` }}>{f.role}</p>
          </div>
          <p className="text-[11px] italic leading-relaxed pl-2.5"
            style={{ color: 'rgba(255,255,255,0.42)', borderLeft: `2px solid ${f.color}45`, fontFamily: '"EB Garamond", Georgia, serif' }}>
            {f.verse}
          </p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function InteractiveTimeline({ milestones, theme, onOpen, onMapSync }) {
  const [activeId, setActiveId] = useState(milestones[0]?.id ?? null);
  const isOT = milestones.length > 4;

  useEffect(() => {
    const observers = milestones.map(m => {
      const el = document.getElementById(`tl-${m.id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(m.id); },
        { rootMargin: '-25% 0px -55% 0px' }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);
    return () => observers.forEach(o => o.disconnect());
  }, [milestones]);

  const handleMapSync = (locId) => onMapSync?.(locId);

  return (
    <div className="flex gap-5 lg:gap-6 items-start">
      <SidebarNav milestones={milestones} activeId={activeId} />

      <div className="flex-1 min-w-0">
        <div className="relative">
          {/* Progress Spine */}
          <ProgressSpine milestones={milestones} activeId={activeId} spineLine={theme.spineLine} />

          {/* Cards */}
          <div className="flex flex-col gap-10 md:gap-14">
            {milestones.map((m, i) => (
              <TimelineCard key={m.id} milestone={m} index={i} onOpen={onOpen} onMapSync={handleMapSync} isActive={activeId === m.id} />
            ))}
          </div>
        </div>

        {/* End marker */}
        <motion.div className="flex justify-center mt-14"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
              style={{ borderColor: theme.tabGlow, background: isOT ? '#1a1005' : '#12100a', boxShadow: `0 0 24px ${theme.tabGlow}44` }}>
              {isOT ? '✦' : '✝'}
            </div>
            <p className="text-[10px] text-white/22 tracking-widest uppercase">
              {isOT ? 'Chờ đợi Đấng Cứu Thế' : 'Maranatha · Lạy Chúa Giêsu, xin hãy đến!'}
            </p>
          </div>
        </motion.div>

        <SalvationFooter theme={theme} />
      </div>
    </div>
  );
}
