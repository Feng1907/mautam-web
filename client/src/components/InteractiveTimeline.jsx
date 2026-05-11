import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BookOpen, ChevronRight, X, Users } from 'lucide-react';

// ─── Dữ liệu vị trí & nhân vật cho từng mốc ─────────────────────────────────
const MILESTONE_META = {
  'sang-the': {
    loc: { name: 'Vườn Eden', region: 'Vùng đất khởi nguyên', note: 'Thiên Chúa dựng nên Adam và Eva theo hình ảnh Ngài. Con người được đặt trong vườn Eden để canh tác và gìn giữ.' },
    chars: [{ name: 'Adam', emoji: '🧑' }, { name: 'Eva', emoji: '👩' }],
  },
  'to-phu': {
    loc: { name: 'Ur → Haran → Hébron', region: 'Mesopotamia → Canaan', note: 'Hành trình đức tin của Abraham: từ Ur qua Haran, vào Canaan, rồi định cư tại Hébron. Thiên Chúa lập Giao ước tại đây.' },
    chars: [{ name: 'Abraham', emoji: '👴' }, { name: 'Isaac', emoji: '👦' }, { name: 'Giacóp', emoji: '👨' }],
  },
  'xuat-hanh': {
    loc: { name: 'Gôsen · Biển Đỏ · Sinai', region: 'Ai Cập → Bán đảo Sinai', note: 'Xuất hành khỏi Ai Cập, vượt Biển Đỏ, 40 năm trong sa mạc, nhận Mười Điều Răn trên núi Sinai.' },
    chars: [{ name: 'Môsê', emoji: '🔥' }, { name: 'Aaron', emoji: '✡️' }],
  },
  'vuong-quoc': {
    loc: { name: 'Giêrusalem · Bêlem', region: 'Đồi Zion · Giuđa', note: 'Đavít lấy Giêrusalem làm kinh đô. Salômôn xây Đền Thờ trên núi Moriah để Thiên Chúa ngự giữa dân.' },
    chars: [{ name: 'Đavít', emoji: '👑' }, { name: 'Salômôn', emoji: '🏛️' }],
  },
  'luu-day': {
    loc: { name: 'Giêrusalem → Babylon', region: 'Giuđa → Lưỡng Hà', note: 'Nabucôđônôsor phá huỷ Đền Thờ (587 TCN), dẫn dân Israel lưu đày sang Babylon. Các ngôn sứ loan báo Giao Ước Mới.' },
    chars: [{ name: 'Isaia', emoji: '📜' }, { name: 'Giêrêmia', emoji: '✍️' }, { name: 'Êdêkiel', emoji: '⚡' }],
  },
  'hoi-huong': {
    loc: { name: 'Babylon → Giêrusalem', region: 'Ba Tư → Judah', note: 'Sắc lệnh Kyrô (538 TCN) cho hồi hương. Esdra mang Luật Chúa về. Nêhêmia xây lại thành và chờ đợi Đấng Mêsia.' },
    chars: [{ name: 'Kyrô', emoji: '🏺' }, { name: 'Esdra', emoji: '📖' }, { name: 'Nêhêmia', emoji: '🧱' }],
  },
  'nhap-the': {
    loc: { name: 'Nadarét · Bêlem', region: 'Galilê · Giuđa', note: 'Sứ thần truyền tin cho Đức Maria tại Nadarét. Đức Giêsu — Ngôi Lời nhập thể — sinh ra trong máng cỏ tại Bêlem.' },
    chars: [{ name: 'Đức Giêsu', emoji: '✝️' }, { name: 'Đức Maria', emoji: '💙' }, { name: 'Thánh Giuse', emoji: '🔨' }],
  },
  'su-vu': {
    loc: { name: 'Galilê · Samaria · Giuđê', region: 'Đất Thánh — Ba miền', note: 'Ba năm sứ vụ: chịu phép rửa tại sông Jordan, gọi 12 tông đồ, rao giảng và làm phép lạ khắp Đất Thánh.' },
    chars: [{ name: 'Gioan Tẩy Giả', emoji: '💧' }, { name: 'Phêrô', emoji: '⚓' }, { name: 'Nhóm 12', emoji: '👥' }],
  },
  'kho-nan': {
    loc: { name: 'Giêrusalem · Calvê', region: 'Đồi Sọ · Phòng Tiệc Ly', note: 'Bữa Tiệc Ly, vườn Ghếtsêmani, Thập giá trên đồi Calvê. Ngày thứ ba Ngài sống lại — trung tâm đức tin Kitô giáo.' },
    chars: [{ name: 'Đức Giêsu', emoji: '✝️' }, { name: 'Phêrô', emoji: '⚓' }, { name: 'Maria M.', emoji: '🌹' }],
  },
  'hien-xuong': {
    loc: { name: 'Giêrusalem · Antiokia · Rôma', region: 'Đất Thánh → Toàn thế giới', note: 'Lễ Ngũ Tuần: Thánh Thần hiện xuống, Hội Thánh ra đời. Phaolô mang Tin Mừng đến Rôma — trung tâm thế giới.' },
    chars: [{ name: 'Phêrô', emoji: '⚓' }, { name: 'Phaolô', emoji: '✉️' }, { name: 'Stêphanô', emoji: '🌟' }],
  },
};

const SALVATION_FIGURES = [
  { name: 'Môsê',        role: 'Người Lãnh Đạo',  verse: '"Ta là Đấng Ta Là." — Xh 3,14',             emoji: '🔥', color: '#4A90D9' },
  { name: 'Đức Giêsu',   role: 'Đấng Cứu Thế',    verse: '"Ta là đường, sự thật và sự sống." — Ga 14,6', emoji: '✝️', color: '#FFD700' },
  { name: 'Gioan T.Đ.',  role: 'Người Chứng Nhân', verse: '"Thiên Chúa là tình yêu." — 1Ga 4,16',        emoji: '💙', color: '#38BDF8' },
  { name: 'Thánh Giuse', role: 'Người Bảo Vệ',     verse: '"Ông là người công chính." — Mt 1,19',         emoji: '🔨', color: '#C8860A' },
];

// ─── Location Popup ───────────────────────────────────────────────────────────
const LocationPopup = ({ milestone, onClose }) => {
  const meta = MILESTONE_META[milestone.id];
  if (!meta) return null;
  const { borderColor, accent } = milestone;

  return (
    <motion.div
      className="absolute z-40 w-60 rounded-2xl overflow-hidden"
      style={{
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(8,6,3,0.97), rgba(16,12,5,0.97))',
        border: `1px solid ${borderColor}45`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${borderColor}18`,
      }}
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.94 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-2"
        style={{ background: `${borderColor}14`, borderBottom: `1px solid ${borderColor}20` }}>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <MapPin size={9} style={{ color: borderColor }} />
            <span className="text-[9px] uppercase tracking-widest font-bold"
              style={{ color: `${borderColor}80` }}>Vị trí</span>
          </div>
          <p className="font-bold text-[13px] leading-tight truncate"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
            {meta.loc.name}
          </p>
          <p className="text-[10px] mt-0.5 text-white/38">{meta.loc.region}</p>
        </div>
        <button onClick={onClose}
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white/35 hover:text-white mt-0.5">
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

      {/* caret */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm"
        style={{ background: 'rgba(16,12,5,0.97)', borderRight: `1px solid ${borderColor}35`, borderBottom: `1px solid ${borderColor}35` }}
      />
    </motion.div>
  );
};

// ─── Single Timeline Card ─────────────────────────────────────────────────────
const TimelineCard = ({ milestone, index, onOpen }) => {
  const [locOpen, setLocOpen] = useState(false);
  const isRight = index % 2 === 0;
  const { id, label, period, summary, verse, accent, borderColor, badgeLabel, badgeStyle, emoji } = milestone;
  const hasMeta = !!MILESTONE_META[id];

  return (
    <motion.div
      id={`tl-${id}`}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_56px_1fr] items-start gap-0"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Left cell ── */}
      <div className={`${isRight ? 'md:flex md:justify-end md:pr-6' : 'md:block'} hidden md:block`}>
        {!isRight && (
          <CardBody milestone={milestone} onOpen={onOpen}
            locOpen={locOpen} setLocOpen={setLocOpen} hasMeta={hasMeta} slide="left" />
        )}
      </div>

      {/* ── Center node ── */}
      <div className="hidden md:flex flex-col items-center">
        <motion.button
          className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-xl border-2"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${accent}ee, ${accent}66)`,
            borderColor: borderColor,
            boxShadow: `0 0 0 4px ${accent}18, 0 0 20px ${accent}50`,
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
        </motion.button>
      </div>

      {/* ── Right cell ── */}
      <div className={`${isRight ? 'md:pl-6' : 'md:block'} md:block`}>
        {/* Mobile: always show */}
        <div className="md:hidden mb-1">
          <CardBody milestone={milestone} onOpen={onOpen}
            locOpen={locOpen} setLocOpen={setLocOpen} hasMeta={hasMeta} slide="right" />
        </div>
        {/* Desktop: only if right */}
        {isRight && (
          <div className="hidden md:block">
            <CardBody milestone={milestone} onOpen={onOpen}
              locOpen={locOpen} setLocOpen={setLocOpen} hasMeta={hasMeta} slide="right" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Card Body ────────────────────────────────────────────────────────────────
const CardBody = ({ milestone, onOpen, locOpen, setLocOpen, hasMeta, slide }) => {
  const { accent, borderColor, badgeLabel, badgeStyle, period, label, emoji, summary, verse } = milestone;

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
      onClick={() => onOpen(milestone)}
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 95% 5%, ${borderColor}16, transparent 65%)` }} />

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
          style={badgeStyle}>{badgeLabel}</span>
        <span className="text-[10px] text-white/30 font-mono tracking-tight">{period}</span>

        {hasMeta && (
          <button
            className="ml-auto flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: `${borderColor}1a`, border: `1px solid ${borderColor}35`, color: borderColor }}
            onClick={e => { e.stopPropagation(); setLocOpen(v => !v); }}
          >
            <MapPin size={9} />Vị trí
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-xl leading-tight mb-2"
        style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
        {emoji} {label}
      </h3>

      {/* Summary */}
      <p className="text-[13px] leading-relaxed mb-4 text-white/58"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
        {summary}
      </p>

      {/* Verse quote */}
      <div className="rounded-xl px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${accent}10, ${accent}06)`,
          borderLeft: `3px solid ${borderColor}65`,
        }}>
        <p className="text-[12px] leading-relaxed"
          style={{ color: `${borderColor}c8`, fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic' }}>
          {verse}
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: borderColor }}>
        <BookOpen size={11} /><span>Xem bài giáo lý</span><ChevronRight size={11} />
      </div>

      {/* Location popup — relative to card */}
      <AnimatePresence>
        {locOpen && (
          <LocationPopup milestone={milestone} onClose={() => setLocOpen(false)} />
        )}
      </AnimatePresence>
    </motion.article>
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
            <span className="text-[15px] shrink-0" style={{ filter: on ? 'none' : 'grayscale(55%) opacity(0.7)' }}>
              {m.emoji}
            </span>
            <span className="text-[11px] font-medium leading-tight truncate transition-colors"
              style={{ color: on ? m.borderColor : 'rgba(255,255,255,0.38)' }}>
              {m.label}
            </span>
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
    <div className="px-6 pt-5 pb-4 border-b border-white/5">
      <div className="flex items-center gap-2.5">
        <Users size={15} style={{ color: theme.tabGlow }} />
        <h3 className="font-bold"
          style={{ fontFamily: '"EB Garamond", Georgia, serif', color: theme.tabGlow, fontSize: '1.05rem' }}>
          Kế hoạch Cứu độ — Nhân vật tiêu biểu
        </h3>
      </div>
      <p className="text-[11px] text-white/30 mt-1 leading-snug">
        Bốn nhân vật then chốt trong hành trình Thiên Chúa tìm kiếm con người
      </p>
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
            <p className="font-bold text-[14px] leading-tight"
              style={{ fontFamily: '"EB Garamond", Georgia, serif', color: f.color }}>{f.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: `${f.color}68` }}>{f.role}</p>
          </div>
          <p className="text-[11px] italic leading-relaxed pl-2.5"
            style={{ color: 'rgba(255,255,255,0.42)', borderLeft: `2px solid ${f.color}45`,
              fontFamily: '"EB Garamond", Georgia, serif' }}>
            {f.verse}
          </p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function InteractiveTimeline({ milestones, theme, onOpen }) {
  const [activeId, setActiveId] = useState(milestones[0]?.id ?? null);
  const isOT = milestones.length > 4;

  // IntersectionObserver — cập nhật activeId khi mốc vào viewport
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

  return (
    <div className="flex gap-5 lg:gap-6 items-start">
      {/* Sidebar */}
      <SidebarNav milestones={milestones} activeId={activeId} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Spine */}
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 inset-y-0 w-px pointer-events-none"
            style={{ background: theme.spineLine }} />

          {/* Cards */}
          <div className="flex flex-col gap-10 md:gap-14">
            {milestones.map((m, i) => (
              <TimelineCard key={m.id} milestone={m} index={i} onOpen={onOpen} />
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
              style={{
                borderColor: theme.tabGlow,
                background: isOT ? '#1a1005' : '#12100a',
                boxShadow: `0 0 24px ${theme.tabGlow}44`,
              }}>
              {isOT ? '✦' : '✝'}
            </div>
            <p className="text-[10px] text-white/22 tracking-widest uppercase">
              {isOT ? 'Chờ đợi Đấng Cứu Thế' : 'Maranatha · Lạy Chúa Giêsu, xin hãy đến!'}
            </p>
          </div>
        </motion.div>

        {/* Salvation Footer */}
        <SalvationFooter theme={theme} />
      </div>
    </div>
  );
}
