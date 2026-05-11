import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BookOpen, ChevronRight, X, Users } from 'lucide-react';

// ─── Dữ liệu bổ sung: vị trí địa lý + nhân vật cho mỗi mốc ────────────────
const MILESTONE_META = {
  'sang-the':  {
    location: { name: 'Vườn Eden', region: 'Vùng đất khởi nguyên', note: 'Thiên Chúa dựng nên Adam và Eva — con người đầu tiên theo hình ảnh Ngài.' },
    chars: [{ name: 'Adam', emoji: '🧑' }, { name: 'Eva', emoji: '👩' }],
  },
  'to-phu': {
    location: { name: 'Hébron · Ur · Haran', region: 'Mesopotamia → Canaan', note: 'Hành trình đức tin của Abraham: từ Ur qua Haran, đến Sichem, rồi định cư tại Hébron.' },
    chars: [{ name: 'Abraham', emoji: '👴' }, { name: 'Isaac', emoji: '👦' }, { name: 'Giacóp', emoji: '👨' }],
  },
  'xuat-hanh': {
    location: { name: 'Gôsen · Sinai · Biển Đỏ', region: 'Ai Cập → Bán đảo Sinai', note: 'Xuất hành khỏi Ai Cập, vượt Biển Đỏ, nhận Mười Điều Răn trên núi Sinai.' },
    chars: [{ name: 'Môsê', emoji: '🧙' }, { name: 'Aaron', emoji: '👨‍⚕️' }],
  },
  'vuong-quoc': {
    location: { name: 'Giêrusalem · Bêlem', region: 'Đồi Zion · Giuđa', note: 'Đavít lấy Giêrusalem làm kinh đô. Salômôn xây Đền Thờ trên núi Moriah.' },
    chars: [{ name: 'Đavít', emoji: '👑' }, { name: 'Salômôn', emoji: '🏛️' }],
  },
  'luu-day': {
    location: { name: 'Babylon · Giêrusalem', region: 'Lưỡng Hà · Giuđa', note: 'Nabucôđônôsor phá huỷ Đền Thờ, dẫn dân Israel lưu đày sang Babylon 587 TCN.' },
    chars: [{ name: 'Isaia', emoji: '📜' }, { name: 'Giêrêmia', emoji: '✍️' }, { name: 'Êdêkiel', emoji: '🔥' }],
  },
  'hoi-huong': {
    location: { name: 'Giêrusalem · Ba Tư', region: 'Judah · Persia', note: 'Sắc lệnh Kyrô (538 TCN) cho hồi hương. Esdra và Nêhêmia tái thiết thành và Đền Thờ.' },
    chars: [{ name: 'Kyrô', emoji: '👸' }, { name: 'Esdra', emoji: '📖' }, { name: 'Nêhêmia', emoji: '🧱' }],
  },
  'nhap-the': {
    location: { name: 'Bêlem · Nadarét', region: 'Giuđa · Galilê', note: 'Sứ thần truyền tin tại Nadarét. Đức Giêsu sinh tại Bêlem trong máng cỏ — Ngôi Lời nhập thể.' },
    chars: [{ name: 'Đức Giêsu', emoji: '✝️' }, { name: 'Đức Maria', emoji: '💙' }, { name: 'Thánh Giuse', emoji: '🔨' }],
  },
  'su-vu': {
    location: { name: 'Galilê · Giuđê · Samaria', region: 'Đất Thánh', note: 'Ba năm sứ vụ: chịu phép rửa tại sông Jordan, rao giảng Tin Mừng Nước Trời, làm phép lạ.' },
    chars: [{ name: 'Gioan Tẩy Giả', emoji: '💧' }, { name: 'Phêrô', emoji: '⚓' }, { name: 'Nhóm 12', emoji: '👥' }],
  },
  'kho-nan': {
    location: { name: 'Giêrusalem · Calvê', region: 'Đồi Sọ · Đền Thờ', note: 'Bữa Tiệc Ly tại phòng Tiệc Ly. Bị bắt tại vườn Ghếtsêmani. Thập giá và Phục sinh.' },
    chars: [{ name: 'Đức Giêsu', emoji: '✝️' }, { name: 'Phêrô', emoji: '⚓' }, { name: 'Maria Mácđala', emoji: '🌹' }],
  },
  'hien-xuong': {
    location: { name: 'Giêrusalem · Antiokia · Rôma', region: 'Đất Thánh → Toàn thế giới', note: 'Lễ Ngũ Tuần: Thánh Thần hiện xuống. Hội Thánh ra đời và loan Tin Mừng đến tận cùng đất.' },
    chars: [{ name: 'Phêrô', emoji: '⚓' }, { name: 'Phaolô', emoji: '✉️' }, { name: 'Stêphanô', emoji: '🌟' }],
  },
};

// ─── Mini Location Popup ──────────────────────────────────────────────────────
const LocationPopup = ({ milestone, onClose, borderColor }) => {
  const meta = MILESTONE_META[milestone.id];
  if (!meta) return null;
  const { location, chars } = meta;

  return (
    <motion.div
      className="absolute z-30 w-64 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10,8,4,0.97) 0%, rgba(18,14,6,0.97) 100%)',
        border: `1px solid ${borderColor}40`,
        boxShadow: `0 8px 32px ${borderColor}25, 0 0 0 1px ${borderColor}15`,
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 gap-2"
        style={{ background: `${borderColor}12`, borderBottom: `1px solid ${borderColor}20` }}>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <MapPin size={10} style={{ color: borderColor }} />
            <span className="text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: `${borderColor}99` }}>Vị trí địa lý</span>
          </div>
          <p className="font-bold text-sm leading-tight"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
            {location.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {location.region}
          </p>
        </div>
        <button onClick={onClose}
          className="shrink-0 p-1 rounded-full hover:bg-white/10 transition text-white/40 hover:text-white">
          <X size={12} />
        </button>
      </div>

      {/* Note */}
      <div className="px-4 py-3">
        <p className="text-[12px] leading-relaxed text-white/65">{location.note}</p>
      </div>

      {/* Characters */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {chars.map(c => (
          <span key={c.name}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: `${borderColor}15`, border: `1px solid ${borderColor}25`, color: borderColor }}>
            {c.emoji} {c.name}
          </span>
        ))}
      </div>

      {/* Arrow caret */}
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
        style={{ background: 'rgba(18,14,6,0.97)', border: `1px solid ${borderColor}30`, borderTop: 'none', borderLeft: 'none' }} />
    </motion.div>
  );
};

// ─── Timeline Card ────────────────────────────────────────────────────────────
const TimelineCard = ({ milestone, index, onOpen, theme, isOT }) => {
  const [locOpen, setLocOpen] = useState(false);
  const isRight = index % 2 === 0; // card bên phải
  const { label, period, summary, verse, accent, borderColor, badgeLabel, badgeStyle, emoji } = milestone;
  const hasMeta = !!MILESTONE_META[milestone.id];

  const cardVariants = {
    hidden: { opacity: 0, x: isRight ? 40 : -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div id={`milestone-${milestone.id}`}
      className={`relative flex items-start gap-0 ${isRight ? 'flex-row' : 'flex-row-reverse'} md:gap-0`}>

      {/* ── Card ── */}
      <motion.div
        className={`w-full md:w-[calc(50%-32px)] ${isRight ? 'md:mr-8' : 'md:ml-8'}`}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <motion.div
          className="relative rounded-2xl p-5 cursor-pointer group"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${borderColor}28`,
            boxShadow: `0 4px 24px ${accent}14, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
          whileHover={{
            boxShadow: `0 8px 36px ${accent}30, 0 0 0 1px ${borderColor}40, inset 0 1px 0 rgba(255,255,255,0.08)`,
            y: -3,
          }}
          transition={{ duration: 0.2 }}
          onClick={() => onOpen(milestone)}
        >
          {/* Glow accent corner */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 100% 0%, ${borderColor}18, transparent 70%)` }} />

          {/* Badges row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
              style={badgeStyle}>{badgeLabel}</span>
            <span className="text-[9px] text-white/35 font-mono">{period}</span>
            {hasMeta && (
              <button
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all hover:scale-105"
                style={{ background: `${borderColor}18`, border: `1px solid ${borderColor}30`, color: borderColor }}
                onClick={e => { e.stopPropagation(); setLocOpen(o => !o); }}
              >
                <MapPin size={9} />
                Vị trí
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl mb-2 leading-tight"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: borderColor }}>
            {emoji} {label}
          </h3>

          {/* Summary */}
          <p className="text-white/60 text-[13px] leading-relaxed mb-4"
            style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
            {summary}
          </p>

          {/* Verse quote */}
          <div className="relative rounded-xl px-4 py-3 overflow-hidden"
            style={{ background: `${accent}12`, borderLeft: `3px solid ${borderColor}70` }}>
            <p className="text-[12px] italic leading-relaxed"
              style={{ color: `${borderColor}cc`, fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic' }}>
              {verse}
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: borderColor }}>
            <BookOpen size={11} />
            <span>Xem bài giáo lý</span>
            <ChevronRight size={11} />
          </div>

          {/* Location popup */}
          <AnimatePresence>
            {locOpen && (
              <LocationPopup
                milestone={milestone}
                borderColor={borderColor}
                onClose={() => setLocOpen(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Spine node (desktop) ── */}
      <div className="hidden md:flex flex-col items-center shrink-0 w-16 relative z-10">
        <motion.button
          onClick={() => onOpen(milestone)}
          className="flex items-center justify-center w-12 h-12 rounded-full text-xl border-2 shadow-lg"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${accent}ee, ${accent}77)`,
            borderColor: borderColor,
            boxShadow: `0 0 20px ${accent}55, 0 0 0 4px ${accent}18`,
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {emoji}
        </motion.button>
      </div>

      {/* ── Spacer bên kia (desktop) ── */}
      <div className="hidden md:block w-[calc(50%-32px)]" />
    </div>
  );
};

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
const SidebarNav = ({ milestones, theme, activeId }) => (
  <motion.div
    className="hidden lg:flex flex-col gap-1 sticky"
    style={{ top: '88px', width: '168px', flexShrink: 0 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <p className="text-[9px] uppercase tracking-[0.22em] mb-2 px-3"
      style={{ color: 'rgba(255,255,255,0.25)' }}>
      Giai đoạn
    </p>
    {milestones.map((m, i) => {
      const isActive = activeId === m.id;
      return (
        <button
          key={m.id}
          onClick={() => {
            document.getElementById(`milestone-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 group"
          style={{
            background: isActive ? `${m.accent}22` : 'transparent',
            border: `1px solid ${isActive ? m.borderColor + '40' : 'transparent'}`,
          }}
        >
          <span className="text-base shrink-0" style={{ filter: isActive ? 'none' : 'grayscale(60%)' }}>
            {m.emoji}
          </span>
          <span className="text-[11px] font-medium leading-tight truncate transition-colors"
            style={{ color: isActive ? m.borderColor : 'rgba(255,255,255,0.4)' }}>
            {m.label}
          </span>
          {isActive && (
            <motion.div className="ml-auto w-1 h-4 rounded-full shrink-0"
              style={{ background: m.borderColor }}
              layoutId="sidebarActiveBar"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
        </button>
      );
    })}
  </motion.div>
);

// ─── Salvation Plan Footer ────────────────────────────────────────────────────
const SalvationFooter = ({ theme }) => {
  const FIGURES = [
    { name: 'Môsê', role: 'Người Lãnh Đạo', verse: '"Ta là Đấng Ta Là."', emoji: '🔥', color: '#4A90D9' },
    { name: 'Đức Giêsu', role: 'Đấng Cứu Thế', verse: '"Ta là đường, sự thật và sự sống."', emoji: '✝️', color: '#FFD700' },
    { name: 'Gioan Tông Đồ', role: 'Người Chứng Nhân', verse: '"Thiên Chúa là tình yêu."', emoji: '💙', color: '#38BDF8' },
    { name: 'Thánh Giuse', role: 'Người Bảo Vệ', verse: '"Ông là người công chính."', emoji: '🔨', color: '#C8860A' },
  ];

  return (
    <motion.div
      className="mt-20 rounded-3xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55 }}
    >
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Users size={16} style={{ color: theme.tabGlow }} />
          <h3 className="font-bold text-base"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: theme.tabGlow }}>
            Kế hoạch Cứu độ — Nhân vật tiêu biểu
          </h3>
        </div>
        <p className="text-white/35 text-[12px] mt-1">
          Bốn nhân vật then chốt trong hành trình Thiên Chúa tìm kiếm con người
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/5">
        {FIGURES.map((f, i) => (
          <motion.div key={f.name}
            className="px-5 py-5 flex flex-col gap-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="text-3xl mb-1">{f.emoji}</div>
            <div>
              <p className="font-bold text-sm leading-tight"
                style={{ fontFamily: '"EB Garamond", Georgia, serif', color: f.color }}>
                {f.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5"
                style={{ color: `${f.color}70` }}>
                {f.role}
              </p>
            </div>
            <p className="text-[11px] italic leading-relaxed border-l pl-2.5"
              style={{ color: 'rgba(255,255,255,0.45)', borderColor: `${f.color}50`,
                fontFamily: '"EB Garamond", Georgia, serif' }}>
              {f.verse}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InteractiveTimeline({ milestones, theme, onOpen }) {
  const [activeId, setActiveId] = useState(milestones[0]?.id ?? null);
  const isOT = milestones.length === 6;

  // IntersectionObserver: theo dõi milestone nào đang trong viewport
  useEffect(() => {
    const observers = [];
    milestones.forEach(m => {
      const el = document.getElementById(`milestone-${m.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(m.id); },
        { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [milestones]);

  return (
    <div className="relative flex gap-6">
      {/* ── Sidebar nav ── */}
      <SidebarNav milestones={milestones} theme={theme} activeId={activeId} />

      {/* ── Main timeline ── */}
      <div className="flex-1 min-w-0">
        {/* Spine — vertical center line (desktop) */}
        <div className="hidden md:block absolute left-1/2 inset-y-0 w-px pointer-events-none"
          style={{ background: theme.spineLine, transform: 'translateX(calc(-50% + 84px))' }} />

        {/* Cards */}
        <div className="relative flex flex-col gap-10 md:gap-14">
          {milestones.map((m, i) => (
            <TimelineCard
              key={m.id}
              milestone={m}
              index={i}
              onOpen={onOpen}
              theme={theme}
              isOT={isOT}
            />
          ))}
        </div>

        {/* End marker */}
        <motion.div className="flex justify-center mt-14"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
              style={{ borderColor: theme.tabGlow, background: isOT ? '#1a1005' : '#12100a',
                boxShadow: `0 0 24px ${theme.tabGlow}44` }}>
              {isOT ? '✦' : '✝'}
            </div>
            <p className="text-[10px] text-white/25 tracking-widest uppercase">
              {isOT ? 'Chờ đợi Đấng Cứu Thế' : 'Maranatha · Lạy Chúa Giêsu, xin hãy đến!'}
            </p>
          </div>
        </motion.div>

        {/* Salvation Plan Footer */}
        <SalvationFooter theme={theme} />
      </div>
    </div>
  );
}
