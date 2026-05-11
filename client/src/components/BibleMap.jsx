import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, BookOpen, Compass } from 'lucide-react';

// ─── Dữ liệu địa danh Kinh Thánh ─────────────────────────────────────────────
// Toạ độ (x, y) trong viewBox 720×500
const BIBLE_LOCATIONS = [
  {
    id: 'ur',
    name: 'Ur',
    region: 'Lưỡng Hà',
    x: 615,
    y: 352,
    category: 'patriarch',
    color: '#CD853F',
    summary: 'Quê hương của Abraham. Thiên Chúa gọi ông rời khỏi nơi đây để đi đến vùng đất hứa.',
    verse: '"Hãy rời bỏ xứ sở, họ hàng và nhà cha ngươi." — St 12,1',
    catechism: 'GLCG 59: Abraham được gọi là cha của mọi tín hữu.',
  },
  {
    id: 'haran',
    name: 'Haran',
    region: 'Bắc Mesopotamia',
    x: 432,
    y: 68,
    category: 'patriarch',
    color: '#CD853F',
    summary: 'Điểm dừng chân của gia đình Abraham trên đường từ Ur đến Canaan. Ông ở đây cho đến khi cha là Têra qua đời.',
    verse: '"Họ rời Ur của người Canđê... họ đến Haran và ở lại đó." — St 11,31',
    catechism: 'GLCG 60: Thiên Chúa tuyển chọn Abraham để lập nên một dân thánh.',
  },
  {
    id: 'sichem',
    name: 'Sichem',
    region: 'Trung tâm Canaan',
    x: 234,
    y: 188,
    category: 'patriarch',
    color: '#C8860A',
    summary: 'Nơi đầu tiên Thiên Chúa hiện ra với Abraham tại Canaan và hứa ban đất này cho dòng dõi ông. Abraham dựng bàn thờ đầu tiên tại đây.',
    verse: '"Đất này, Ta sẽ ban cho dòng dõi ngươi." — St 12,7',
    catechism: 'GLCG 145: Abraham đã tuân theo tiếng gọi của Thiên Chúa bằng đức tin.',
  },
  {
    id: 'hebron',
    name: 'Hébron',
    region: 'Nam Canaan / Judah',
    x: 236,
    y: 290,
    category: 'patriarch',
    color: '#C8860A',
    summary: 'Nơi Abraham, Isaac và Giacóp sống và được chôn cất. Thiên Chúa lập Giao ước cắt bì với Abraham tại đây.',
    verse: '"Ta sẽ trở lại thăm ngươi vào mùa xuân tới, Sara vợ ngươi sẽ có một con trai." — St 18,10',
    catechism: 'GLCG 706: Ở Hébron, lời hứa về dòng dõi bắt đầu trở nên cụ thể.',
  },
  {
    id: 'goshen',
    name: 'Gôsen (Ai Cập)',
    region: 'Đồng bằng sông Nile',
    x: 96,
    y: 368,
    category: 'exodus',
    color: '#4A90D9',
    summary: 'Vùng đất màu mỡ ở Ai Cập mà Pharaô cấp cho gia tộc Giacóp / Israel. Dân Israel sống ở đây 430 năm trước khi Xuất hành.',
    verse: '"Hãy ở lại xứ Gôsen và gần Ta." — St 45,10',
    catechism: 'GLCG 62: Thiên Chúa dùng cả hoàn cảnh khó khăn để thực hiện kế hoạch cứu độ.',
  },
  {
    id: 'sinai',
    name: 'Núi Sinai',
    region: 'Bán đảo Sinai',
    x: 188,
    y: 430,
    category: 'exodus',
    color: '#4A90D9',
    summary: 'Thiên Chúa hiện ra với Môsê trong bụi gai bốc lửa. Sau Xuất hành, dân Israel nhận Mười Điều Răn và Giao ước tại đây.',
    verse: '"Ta là Đấng Ta Là (YHWH)." — Xh 3,14',
    catechism: 'GLCG 2056: Mười Điều Răn là nền tảng của đạo đức Kitô giáo.',
  },
  {
    id: 'jericho',
    name: 'Giêricô',
    region: 'Thung lũng Jordan',
    x: 254,
    y: 236,
    category: 'conquest',
    color: '#7B68EE',
    summary: 'Thành phố đầu tiên bị dân Israel chiếm khi vào Canaan dưới sự dẫn dắt của Giôsuê. Các bức tường sụp đổ khi dân đi vòng quanh thành và thổi tù và.',
    verse: '"Hãy đi vòng quanh thành bảy lần... bức tường sẽ sụp đổ." — Gs 6,3–5',
    catechism: 'GLCG 1093: Chinh phục Canaan báo hiệu cuộc chiến thiêng liêng của mỗi Kitô hữu.',
  },
  {
    id: 'jerusalem',
    name: 'Giêrusalem',
    region: 'Đồi Zion / Giuđa',
    x: 242,
    y: 260,
    category: 'kingdom',
    color: '#9B59B6',
    summary: 'Vua Đavít chinh phục Giêrusalem và lập làm thủ đô. Salômôn xây Đền thờ. Đây là nơi Đức Giêsu chịu chết và sống lại.',
    verse: '"Giêrusalem, được xây dựng như thành đô kiên cố." — Tv 122,3',
    catechism: 'GLCG 585: Đức Giêsu hoàn tất việc thờ phượng của Đền thờ bằng chính thân mình Ngài.',
  },
  {
    id: 'bethlehem',
    name: 'Bêlem',
    region: 'Nam Giuđa',
    x: 238,
    y: 276,
    category: 'newt',
    color: '#FFD700',
    summary: 'Quê hương của vua Đavít. Đức Giêsu Kitô, Con Thiên Chúa, được sinh ra tại đây bởi Đức Trinh Nữ Maria theo lời sứ thần báo.',
    verse: '"Hôm nay, một Đấng Cứu Độ đã sinh ra cho anh em trong thành vua Đavít." — Lc 2,11',
    catechism: 'GLCG 437: Tên "Bêlem" nghĩa là "nhà bánh mì" — hình bóng của Bánh Thánh Thể.',
  },
  {
    id: 'nazareth',
    name: 'Nadarét',
    region: 'Miền Galilê',
    x: 228,
    y: 155,
    category: 'newt',
    color: '#FFD700',
    summary: 'Nơi Đức Giêsu lớn lên trong 30 năm ẩn dật với Mẹ Maria và Thánh Giuse. Sứ thần Gabriel truyền tin cho Đức Maria tại đây.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta." — Ga 1,14',
    catechism: 'GLCG 533: Đời sống ẩn dật tại Nadarét dạy ta giá trị lao động và sống gia đình.',
  },
  {
    id: 'galilee-lake',
    name: 'Biển Hồ Galilê',
    region: 'Miền Bắc Israel',
    x: 262,
    y: 160,
    category: 'newt',
    color: '#FFD700',
    summary: 'Đức Giêsu gọi các môn đệ đầu tiên — Simon, Anrê, Giacôbê, Gioan — là những ngư phủ trên hồ này. Ngài đi trên mặt nước tại đây.',
    verse: '"Hãy theo Ta, Ta sẽ làm cho các anh thành những kẻ lưới người." — Mc 1,17',
    catechism: 'GLCG 878: Nhóm Mười Hai đặt nền tảng cho cơ cấu tông truyền của Hội Thánh.',
  },
  {
    id: 'babylon',
    name: 'Babylon',
    region: 'Nam Lưỡng Hà',
    x: 572,
    y: 292,
    category: 'exile',
    color: '#607D8B',
    summary: 'Vua Nabucôđônôsor phá hủy Giêrusalem và dẫn dân Israel lưu đày về đây năm 587 TCN. Tại đây, các ngôn sứ loan báo Giao ước Mới.',
    verse: '"Bên bờ sông Babylon, chúng tôi ngồi mà khóc." — Tv 137,1',
    catechism: 'GLCG 710: Lưu đày chuẩn bị dân Israel đón nhận Đấng Cứu Thế.',
  },
];

// ─── Màu theo category ────────────────────────────────────────────────────────
const CATEGORY_META = {
  patriarch: { label: 'Tổ phụ', glow: '#CD853F' },
  exodus:    { label: 'Xuất hành', glow: '#4A90D9' },
  conquest:  { label: 'Chinh phục', glow: '#7B68EE' },
  kingdom:   { label: 'Vương quốc', glow: '#9B59B6' },
  exile:     { label: 'Lưu đày', glow: '#607D8B' },
  newt:      { label: 'Tân Ước', glow: '#FFD700' },
};

// ─── SVG Map Shapes ────────────────────────────────────────────────────────────
// ViewBox 720×500 — Toàn vùng Cận Đông cổ đại: Ai Cập → Lưỡng Hà
const MAP = {
  // Địa hình đất liền chính
  land: `M 112,28 L 180,14 L 280,8 L 380,4 L 468,0 L 720,0 L 720,500
         L 560,500 L 460,498 L 368,500 L 290,498 L 234,500 L 172,492
         L 110,500 L 50,480 L 14,456 L 0,430 L 0,400 L 8,368 L 0,330
         L 0,290 L 12,250 L 8,210 L 18,168 L 32,134 L 52,100 L 72,68
         L 92,46 Z`,

  // Biển Chết (Dead Sea)
  deadSea: `M 248,261 L 256,256 L 264,262 L 266,278 L 260,297 L 250,300 L 242,292 L 240,276 Z`,

  // Biển Hồ Galilê (Sea of Galilee)
  galileeSea: `M 250,148 L 258,144 L 266,150 L 268,162 L 260,170 L 250,168 L 244,160 Z`,

  // Sông Jordan (Jordan River)
  jordan: `M 258,138 Q 262,155 260,172 Q 258,188 261,204 Q 264,220 260,238 Q 256,252 252,258`,

  // Sông Nile (gợi ý)
  nile: `M 88,355 Q 76,378 64,410 Q 50,438 36,462 Q 22,480 8,496`,

  // Sông Euphrates
  euphrates: `M 436,52 Q 460,88 484,132 Q 512,180 530,230 Q 548,270 562,310 Q 576,342 590,365`,

  // Sông Tigris
  tigris: `M 494,20 Q 516,60 532,108 Q 550,162 566,212 Q 582,256 596,298 Q 614,332 630,358`,

  // Bờ biển Địa Trung Hải (chỉ gợi ý đường bờ)
  medCoast: `M 112,28 Q 104,50 96,80 Q 84,110 76,140 Q 68,168 64,196 Q 56,224 52,252 Q 48,278 46,305 Q 40,330 36,354`,
};

// ─── Popover ──────────────────────────────────────────────────────────────────
const LocationPopover = ({ loc, svgRect, onClose }) => {
  if (!loc || !svgRect) return null;

  const meta = CATEGORY_META[loc.category] || {};
  const PAD = 12;
  const W = 280;
  const H_EST = 210;

  // Tính vị trí trong SVG → vị trí màn hình
  const scaleX = svgRect.width / 720;
  const scaleY = svgRect.height / 500;
  const screenX = svgRect.left + loc.x * scaleX;
  const screenY = svgRect.top + loc.y * scaleY;

  // Hướng popover: tránh tràn ra ngoài viewport
  let left = screenX + PAD;
  let top = screenY - H_EST / 2;
  if (left + W > window.innerWidth - 8) left = screenX - W - PAD;
  if (top < 8) top = 8;
  if (top + H_EST > window.innerHeight - 8) top = window.innerHeight - H_EST - 8;

  return (
    <AnimatePresence>
      <motion.div
        key={loc.id}
        className="fixed z-50 shadow-2xl rounded-2xl overflow-hidden"
        style={{
          left,
          top,
          width: W,
          background: 'linear-gradient(135deg, #12100c 0%, #0d0b08 100%)',
          border: `1px solid ${loc.color}40`,
          boxShadow: `0 8px 40px ${loc.color}30, 0 0 0 1px ${loc.color}20`,
        }}
        initial={{ opacity: 0, scale: 0.88, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-4 py-3 gap-2"
          style={{ background: `${loc.color}18`, borderBottom: `1px solid ${loc.color}25` }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${loc.color}22`, color: loc.color }}
              >
                {meta.label}
              </span>
            </div>
            <h3
              className="font-bold leading-tight text-base"
              style={{ fontFamily: '"EB Garamond", Georgia, serif', color: loc.color }}
            >
              {loc.name}
            </h3>
            <p className="text-white/40 text-[11px] mt-0.5">{loc.region}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition mt-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          <p className="text-white/70 text-[13px] leading-relaxed">{loc.summary}</p>

          <p
            className="text-[12px] italic leading-relaxed border-l-2 pl-2.5"
            style={{ color: `${loc.color}bb`, borderColor: `${loc.color}50` }}
          >
            {loc.verse}
          </p>

          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ background: `${loc.color}12`, border: `1px solid ${loc.color}20` }}
          >
            <BookOpen size={12} className="shrink-0 mt-0.5" style={{ color: loc.color }} />
            <p className="text-[11px] leading-relaxed" style={{ color: `${loc.color}aa` }}>
              {loc.catechism}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Legend item ──────────────────────────────────────────────────────────────
const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}80` }} />
    <span className="text-[11px] text-white/50">{label}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BibleMap() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const svgRef = useRef(null);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    if (!selected) return;
    const handler = (e) => {
      if (!e.target.closest('[data-bible-map]')) setSelected(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selected]);

  const [svgRect, setSvgRect] = useState(null);

  const handleMarkerClick = (loc) => {
    setSvgRect(svgRef.current?.getBoundingClientRect() ?? null);
    setSelected(prev => prev?.id === loc.id ? null : loc);
  };

  return (
    <div data-bible-map className="relative w-full" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* ── Title bar ── */}
      <div className="flex items-center gap-3 mb-4">
        <Compass size={18} style={{ color: '#D4AF37' }} />
        <h2
          className="font-bold text-lg"
          style={{ fontFamily: '"EB Garamond", Georgia, serif', color: '#D4AF37' }}
        >
          Bản đồ Vùng Đất Kinh Thánh
        </h2>
      </div>

      {/* ── Map container ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#060e18',
          border: '1px solid #D4AF3722',
          boxShadow: '0 4px 32px #00000066, inset 0 1px 0 #D4AF3715',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 720 500"
          preserveAspectRatio="xMidYMid meet"
          className="w-full block"
          style={{ maxHeight: 480 }}
        >
          <defs>
            {/* Gradient nước */}
            <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#061828" />
              <stop offset="100%" stopColor="#091f32" />
            </linearGradient>

            {/* Gradient đất liền */}
            <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a2214" />
              <stop offset="100%" stopColor="#1e1a0e" />
            </linearGradient>

            {/* Gradient vùng Tân Ước (Canaan) */}
            <radialGradient id="holyGrad" cx="33%" cy="48%" r="18%">
              <stop offset="0%" stopColor="#3a2e14" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Glow filter cho marker */}
            {BIBLE_LOCATIONS.map(loc => (
              <filter key={`glow-${loc.id}`} id={`glow-${loc.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feFlood floodColor={loc.color} floodOpacity="0.9" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* Glow cho sông */}
            <filter id="riverGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feFlood floodColor="#4A90D9" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Grain texture */}
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="multiply" />
            </filter>
          </defs>

          {/* ── Nền biển ── */}
          <rect width="720" height="500" fill="url(#seaGrad)" />

          {/* Sóng biển (decorative) */}
          {[60, 90, 120].map((y, i) => (
            <path
              key={i}
              d={`M 0,${y} Q 15,${y - 4} 30,${y} Q 45,${y + 4} 60,${y}`}
              fill="none"
              stroke="#0d3055"
              strokeWidth="0.6"
              opacity="0.5"
            />
          ))}

          {/* ── Đất liền ── */}
          <path d={MAP.land} fill="url(#landGrad)" stroke="#3a3020" strokeWidth="1" />

          {/* Vùng sáng Canaan (Holy Land highlight) */}
          <path d={MAP.land} fill="url(#holyGrad)" />

          {/* ── Sông ngòi ── */}
          {/* Jordan */}
          <path
            d={MAP.jordan}
            fill="none"
            stroke="#2a5a9a"
            strokeWidth="1.8"
            strokeLinecap="round"
            filter="url(#riverGlow)"
            opacity="0.75"
          />

          {/* Nile */}
          <path
            d={MAP.nile}
            fill="none"
            stroke="#1e4a7a"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#riverGlow)"
            opacity="0.65"
          />

          {/* Euphrates */}
          <path
            d={MAP.euphrates}
            fill="none"
            stroke="#1e4070"
            strokeWidth="1.6"
            strokeLinecap="round"
            filter="url(#riverGlow)"
            opacity="0.55"
          />

          {/* Tigris */}
          <path
            d={MAP.tigris}
            fill="none"
            stroke="#1e4070"
            strokeWidth="1.4"
            strokeLinecap="round"
            filter="url(#riverGlow)"
            opacity="0.45"
          />

          {/* ── Biển Chết & Hồ Galilê ── */}
          <path d={MAP.deadSea} fill="#0a2a48" stroke="#1a4a78" strokeWidth="0.8" />
          <path d={MAP.galileeSea} fill="#0c3258" stroke="#1a4a78" strokeWidth="0.8" />

          {/* ── Nhãn địa lý ── */}
          {[
            { x: 36,  y: 200, text: 'Địa Trung Hải', angle: -72, size: 9 },
            { x: 200, y: 340, text: 'Sinai', angle: 0, size: 8 },
            { x: 68,  y: 420, text: 'Ai Cập', angle: 0, size: 9 },
            { x: 540, y: 160, text: 'Lưỡng Hà', angle: 0, size: 9 },
            { x: 240, y: 220, text: 'CANAAN', angle: 0, size: 8 },
            { x: 258, y: 283, text: 'Biển Chết', angle: 0, size: 6.5 },
            { x: 258, y: 157, text: 'Galilê', angle: 0, size: 6 },
          ].map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              fontSize={l.size}
              fill="rgba(255,255,255,0.18)"
              fontFamily='"EB Garamond", Georgia, serif'
              fontStyle="italic"
              transform={l.angle ? `rotate(${l.angle}, ${l.x}, ${l.y})` : undefined}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {l.text}
            </text>
          ))}

          {/* ── Đường la bàn (decorative) ── */}
          <g opacity="0.08">
            <circle cx="650" cy="60" r="28" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
            <line x1="650" y1="32" x2="650" y2="88" stroke="#D4AF37" strokeWidth="0.6" />
            <line x1="622" y1="60" x2="678" y2="60" stroke="#D4AF37" strokeWidth="0.6" />
            <text x="650" y="28" textAnchor="middle" fontSize="7" fill="#D4AF37" fontFamily="serif">N</text>
          </g>

          {/* ── Markers địa danh ── */}
          {BIBLE_LOCATIONS.map(loc => {
            const isHov = hovered === loc.id;
            const isSel = selected?.id === loc.id;
            const active = isHov || isSel;

            return (
              <g
                key={loc.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(loc.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleMarkerClick(loc)}
              >
                {/* Vòng sáng outer (khi hover/select) */}
                {active && (
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r={14}
                    fill="none"
                    stroke={loc.color}
                    strokeWidth="0.8"
                    opacity="0.45"
                  />
                )}

                {/* Pulse ring */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={active ? 10 : 8}
                  fill={active ? `${loc.color}22` : 'transparent'}
                  stroke={loc.color}
                  strokeWidth={active ? 1 : 0.6}
                  opacity={active ? 1 : 0.5}
                  filter={active ? `url(#glow-${loc.id})` : undefined}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Chấm trung tâm */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={active ? 4 : 2.8}
                  fill={loc.color}
                  opacity={active ? 1 : 0.8}
                  filter={active ? `url(#glow-${loc.id})` : undefined}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Nhãn tên */}
                <text
                  x={loc.x}
                  y={loc.y - 14}
                  textAnchor="middle"
                  fontSize={active ? 8.5 : 7.5}
                  fill={active ? loc.color : `${loc.color}99`}
                  fontFamily='"EB Garamond", Georgia, serif'
                  fontWeight={active ? 'bold' : 'normal'}
                  style={{ transition: 'all 0.2s ease', userSelect: 'none', pointerEvents: 'none' }}
                >
                  {loc.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── Legend ── */}
        <div
          className="absolute bottom-3 left-3 rounded-xl px-3 py-2.5 flex flex-wrap gap-x-3 gap-y-1.5"
          style={{ background: 'rgba(6,10,18,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {Object.entries(CATEGORY_META).map(([key, val]) => (
            <LegendDot key={key} color={val.glow} label={val.label} />
          ))}
        </div>

        {/* Hint text */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(6,10,18,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <MapPin size={11} style={{ color: '#D4AF3788' }} />
          <span className="text-[10px] text-white/40">Click vào địa danh để xem</span>
        </div>
      </div>

      {/* ── Popover (rendered outside SVG, in DOM) ── */}
      <LocationPopover
        loc={selected}
        svgRect={svgRect}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
