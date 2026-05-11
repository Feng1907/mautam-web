import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, BookOpen, Compass } from 'lucide-react';

// ─── Hệ toạ độ % → SVG units (viewBox 500×800, portrait — khớp ảnh Đất Thánh) ──
// Ảnh mapsland-geography-full.webp là bản đồ Israel portrait (~1:1.6 ratio)
// viewBox 500×800 giữ đúng tỷ lệ, P(x%,y%) ánh xạ vị trí đọc từ ảnh gốc
const P = (xPct, yPct) => ({ x: Math.round(xPct * 5), y: Math.round(yPct * 8) });

// Tọa độ đọc trực tiếp từ ảnh gốc (góc trên-trái = 0,0):
//   Sidon:      x≈38%, y≈11%   | Tyre:       x≈22%, y≈18%
//   Nazareth:   x≈43%, y≈35%   | Galilee Lk: x≈64%, y≈34%
//   Samaria:    x≈42%, y≈49%   | Jericho:    x≈57%, y≈60%
//   Jerusalem:  x≈46%, y≈62%   | Bethlehem:  x≈46%, y≈65%
//   Hebron:     x≈42%, y≈70%   | Dead Sea:   x≈60%, y≈67%
//   Beersheba:  x≈32%, y≈79%

// ─── Dữ liệu địa danh (toạ độ đọc từ ảnh Đất Thánh gốc) ─────────────────────
const BIBLE_LOCATIONS = [
  // ── Tổ phụ (trong bản đồ) ──
  {
    id: 'sichem', name: 'Sichem', region: 'Samaria',
    ...P(42, 49), category: 'patriarch', color: '#C8860A', marker: 'circle',
    tooltip: 'Nơi đầu tiên Thiên Chúa hiện ra với Abraham tại Canaan',
    summary: 'Nơi đầu tiên Thiên Chúa hiện ra với Abraham tại Canaan và hứa ban đất này cho dòng dõi ông.',
    verse: '"Đất này, Ta sẽ ban cho dòng dõi ngươi." — St 12,7',
    catechism: 'GLCG 145: Abraham đã tuân theo tiếng gọi của Thiên Chúa bằng đức tin.',
  },
  {
    id: 'hebron', name: 'Hébron', region: 'Nam Canaan',
    ...P(42, 70), category: 'patriarch', color: '#C8860A', marker: 'circle',
    tooltip: 'Nơi Abraham, Isaac và Giacóp sống và được chôn cất',
    summary: 'Nơi Abraham, Isaac và Giacóp sống và được chôn cất. Thiên Chúa lập Giao ước cắt bì với Abraham tại đây.',
    verse: '"Ta sẽ trở lại thăm ngươi vào mùa xuân tới." — St 18,10',
    catechism: 'GLCG 706: Ở Hébron, lời hứa về dòng dõi bắt đầu trở nên cụ thể.',
  },
  // ── Xuất hành ──
  {
    id: 'beersheba', name: 'Bê E Sê Ba', region: 'Negev',
    ...P(32, 79), category: 'exodus', color: '#4A90D9', marker: 'circle',
    tooltip: 'Cửa ngõ sa mạc — điểm dừng của các Tổ phụ và dân Israel trong hành trình',
    summary: 'Thành phố cực nam của Israel. Đây là điểm dừng của Abraham, Isaac và là nơi dân Israel tập hợp trước khi tiếp tục hành trình.',
    verse: '"Từ Đan đến Bê E Sê Ba" — thành ngữ chỉ toàn bộ đất Israel (Tl 20,1)',
    catechism: 'GLCG 62: Thiên Chúa dùng hoàn cảnh khó khăn để thực hiện kế hoạch cứu độ.',
  },
  {
    id: 'jericho', name: 'Giêricô', region: 'Thung lũng Jordan',
    ...P(57, 60), category: 'conquest', color: '#7B68EE', marker: 'circle',
    tooltip: 'Thành đầu tiên sụp đổ khi dân Israel vào Đất Hứa',
    summary: 'Thành phố đầu tiên bị dân Israel chiếm khi vào Canaan. Các bức tường sụp đổ khi dân thổi tù và.',
    verse: '"Hãy đi vòng quanh thành bảy lần... bức tường sẽ sụp đổ." — Gs 6,3–5',
    catechism: 'GLCG 1093: Chinh phục Canaan báo hiệu cuộc chiến thiêng liêng.',
  },
  // ── Vương quốc ──
  {
    id: 'jerusalem', name: 'Giêrusalem', region: 'Đồi Zion',
    ...P(46, 62), category: 'kingdom', color: '#9B59B6', marker: 'star',
    tooltip: 'Thành Thánh — kinh đô Đavít, Đền thờ Salômôn, nơi Đức Giêsu chịu chết và sống lại',
    summary: 'Vua Đavít chinh phục Giêrusalem và lập làm thủ đô. Salômôn xây Đền thờ. Đây là nơi Đức Giêsu chịu chết và sống lại.',
    verse: '"Giêrusalem, được xây dựng như thành đô kiên cố." — Tv 122,3',
    catechism: 'GLCG 585: Đức Giêsu hoàn tất việc thờ phượng của Đền thờ bằng chính thân mình Ngài.',
  },
  // ── Tân Ước ──
  {
    id: 'bethlehem', name: 'Bêlem', region: 'Nam Giuđa',
    ...P(46, 65), category: 'newt', color: '#FFD700', marker: 'circle',
    tooltip: 'Quê hương Đavít — nơi Đức Giêsu Kitô giáng sinh',
    summary: 'Quê hương của vua Đavít. Đức Giêsu Kitô, Con Thiên Chúa, được sinh ra tại đây theo lời tiên tri.',
    verse: '"Hôm nay, một Đấng Cứu Độ đã sinh ra trong thành vua Đavít." — Lc 2,11',
    catechism: 'GLCG 437: "Bêlem" nghĩa là "nhà bánh mì" — hình bóng của Bánh Thánh Thể.',
  },
  {
    id: 'nazareth', name: 'Nadarét', region: 'Galilê',
    ...P(43, 35), category: 'newt', color: '#FFD700', marker: 'circle',
    tooltip: 'Nơi Đức Giêsu sống 30 năm ẩn dật, sứ thần Gabriel truyền tin cho Đức Maria',
    summary: 'Nơi Đức Giêsu lớn lên trong 30 năm ẩn dật với Mẹ Maria và Thánh Giuse. Sứ thần truyền tin tại đây.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta." — Ga 1,14',
    catechism: 'GLCG 533: Đời sống ẩn dật tại Nadarét dạy ta giá trị lao động và sống gia đình.',
  },
  {
    id: 'galilee-lake', name: 'Biển Hồ Galilê', region: 'Bắc Israel',
    ...P(64, 34), category: 'newt', color: '#38BDF8', marker: 'wave',
    tooltip: 'Nơi Đức Giêsu gọi các môn đệ, đi trên mặt nước và làm nhiều phép lạ',
    summary: 'Đức Giêsu gọi các môn đệ đầu tiên — Simon, Anrê, Giacôbê, Gioan — là những ngư phủ trên hồ này.',
    verse: '"Hãy theo Ta, Ta sẽ làm cho các anh thành những kẻ lưới người." — Mc 1,17',
    catechism: 'GLCG 878: Nhóm Mười Hai đặt nền tảng cho cơ cấu tông truyền của Hội Thánh.',
  },
  {
    id: 'sidon', name: 'Si Đôn', region: 'Phê ni xi',
    ...P(38, 11), category: 'newt', color: '#A78BFA', marker: 'circle',
    tooltip: 'Đức Giêsu đi đến vùng Tia và Si Đôn, chữa lành con gái bà người Canaan',
    summary: 'Thành phố cảng Phê-ni-xi ở phía Bắc. Đức Giêsu đã đến vùng này và chữa lành con gái bà người Canaan.',
    verse: '"Đức Giêsu rút lui về miền Tia và Si Đôn." — Mt 15,21',
    catechism: 'GLCG 543: Ơn cứu độ dành cho mọi dân tộc.',
  },
];

// ─── Hành trình (Routes) — trong bản đồ Israel ───────────────────────────────
const ROUTES = [
  {
    id: 'patriarch',
    label: 'Hành trình Tổ phụ',
    color: '#CD853F',
    glow: false,
    dashLength: 7,
    gapLength: 5,
    animDur: '18s',
    // Vào từ Bắc (Haran) → Si Đôn → Sichem(42%,49%) → Hébron(42%,70%)
    d: 'M 192,0 Q 200,50 195,90 Q 192,90 210,392 Q 210,490 210,560',
  },
  {
    id: 'exodus',
    label: 'Hành trình Xuất Hành',
    color: '#3B82F6',
    glow: true,
    dashLength: 8,
    gapLength: 5,
    animDur: '10s',
    // Vào từ Nam (Sinai/Ai Cập) → Bê E Sê Ba(32%,79%) → Giêricô(57%,60%)
    d: 'M 220,800 Q 200,760 180,720 Q 165,680 162,632 Q 175,600 220,565 Q 255,540 272,505 Q 278,484 285,480',
  },
];

// ─── Màu theo category ────────────────────────────────────────────────────────
const CATEGORY_META = {
  patriarch: { label: 'Tổ phụ',     glow: '#CD853F' },
  exodus:    { label: 'Xuất hành',  glow: '#4A90D9' },
  conquest:  { label: 'Chinh phục', glow: '#7B68EE' },
  kingdom:   { label: 'Vương quốc', glow: '#9B59B6' },
  exile:     { label: 'Lưu đày',    glow: '#607D8B' },
  newt:      { label: 'Tân Ước',    glow: '#FFD700' },
};

// ─── SVG Map Shapes (toạ độ trong viewBox 500×800) ────────────────────────────
const MAP = {
  // Dead Sea: x≈58%, y≈63–75% → trong viewBox 500×800
  // Hình oval dọc, trung tâm ~x:295, y:540
  deadSea: `M 282,504 L 295,498 L 308,506 L 314,528 L 312,558 L 302,576 L 288,572 L 275,552 L 272,526 Z`,
  // Sea of Galilee: x≈60–66%, y≈32–37%
  galileeSea: `M 302,257 L 315,252 L 328,258 L 334,270 L 330,286 L 318,292 L 305,286 L 299,274 Z`,
  // Jordan River: từ Galilee (x:318,y:292) xuống Dead Sea (x:290,y:504)
  jordan: `M 316,292 Q 314,340 310,390 Q 307,440 300,478 Q 295,492 290,504`,
};

// ─── Marker shapes ────────────────────────────────────────────────────────────
// 5-pointed star centred at (cx,cy) with outer radius r
function starPoints(cx, cy, r, points = 5) {
  const inner = r * 0.42;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = (i * Math.PI) / points - Math.PI / 2;
    const len = i % 2 === 0 ? r : inner;
    pts.push(`${cx + len * Math.cos(rad)},${cy + len * Math.sin(rad)}`);
  }
  return pts.join(' ');
}

// Wave path centred at (cx,cy)
function wavePath(cx, cy, w = 10, h = 4) {
  return `M ${cx - w},${cy} Q ${cx - w / 2},${cy - h} ${cx},${cy} Q ${cx + w / 2},${cy + h} ${cx + w},${cy}`;
}

// ─── Hover Tooltip (SVG-internal) ────────────────────────────────────────────
const HoverTooltip = ({ loc }) => {
  if (!loc) return null;
  const text = loc.tooltip;
  const charW = 5.6;
  const maxChars = 36;
  // Split into up to 2 lines
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach(w => {
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  });
  if (current) lines.push(current);
  const lineCount = Math.min(lines.length, 2);
  const boxW = Math.min(text.length, maxChars) * charW + 16;
  const boxH = lineCount * 13 + 10;

  // Position above the marker; shift left if near right edge
  let tx = loc.x - boxW / 2;
  let ty = loc.y - 24 - boxH;
  if (tx < 4) tx = 4;
  if (tx + boxW > 716) tx = 716 - boxW;
  if (ty < 4) ty = loc.y + 14;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={tx} y={ty} width={boxW} height={boxH}
        rx="4" ry="4"
        fill="rgba(8,12,20,0.92)"
        stroke={loc.color}
        strokeWidth="0.7"
        strokeOpacity="0.6"
      />
      {lines.slice(0, 2).map((line, i) => (
        <text
          key={i}
          x={tx + boxW / 2}
          y={ty + 9 + i * 13}
          textAnchor="middle"
          fontSize="7.5"
          fill={loc.color}
          fontFamily='"EB Garamond", Georgia, serif'
          opacity="0.95"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

// ─── Popover ──────────────────────────────────────────────────────────────────
const LocationPopover = ({ loc, svgRect, onClose }) => {
  if (!loc || !svgRect) return null;
  const meta = CATEGORY_META[loc.category] || {};
  const W = 280, H_EST = 210, PAD = 12;
  const scaleX = svgRect.width / 500;
  const scaleY = svgRect.height / 800;
  const screenX = svgRect.left + loc.x * scaleX;
  const screenY = svgRect.top  + loc.y * scaleY;
  let left = screenX + PAD;
  let top  = screenY - H_EST / 2;
  if (left + W > window.innerWidth - 8) left = screenX - W - PAD;
  if (top < 8) top = 8;
  if (top + H_EST > window.innerHeight - 8) top = window.innerHeight - H_EST - 8;

  return (
    <AnimatePresence>
      <motion.div
        key={loc.id}
        className="fixed z-50 shadow-2xl rounded-2xl overflow-hidden"
        style={{
          left, top, width: W,
          background: 'linear-gradient(135deg, #12100c 0%, #0d0b08 100%)',
          border: `1px solid ${loc.color}40`,
          boxShadow: `0 8px 40px ${loc.color}30, 0 0 0 1px ${loc.color}20`,
        }}
        initial={{ opacity: 0, scale: 0.88, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div
          className="flex items-start justify-between px-4 py-3 gap-2"
          style={{ background: `${loc.color}18`, borderBottom: `1px solid ${loc.color}25` }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${loc.color}22`, color: loc.color }}>
                {meta.label}
              </span>
            </div>
            <h3 className="font-bold leading-tight text-base"
              style={{ fontFamily: '"EB Garamond", Georgia, serif', color: loc.color }}>
              {loc.name}
            </h3>
            <p className="text-white/40 text-[11px] mt-0.5">{loc.region}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition mt-0.5">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-3 space-y-3">
          <p className="text-white/70 text-[13px] leading-relaxed">{loc.summary}</p>
          <p className="text-[12px] italic leading-relaxed border-l-2 pl-2.5"
            style={{ color: `${loc.color}bb`, borderColor: `${loc.color}50` }}>
            {loc.verse}
          </p>
          <div className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ background: `${loc.color}12`, border: `1px solid ${loc.color}20` }}>
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
  const [svgRect, setSvgRect] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!selected) return;
    const handler = (e) => {
      if (!e.target.closest('[data-bible-map]')) setSelected(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selected]);

  const handleMarkerClick = (loc) => {
    setSvgRect(svgRef.current?.getBoundingClientRect() ?? null);
    setSelected(prev => prev?.id === loc.id ? null : loc);
  };

  const hoveredLoc = BIBLE_LOCATIONS.find(l => l.id === hovered) ?? null;

  return (
    <div data-bible-map className="relative w-full" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* ── Title bar ── */}
      <div className="flex items-center gap-3 mb-4">
        <Compass size={18} style={{ color: '#D4AF37' }} />
        <h2 className="font-bold text-lg"
          style={{ fontFamily: '"EB Garamond", Georgia, serif', color: '#D4AF37' }}>
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
          viewBox="0 0 500 800"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block"
        >
          <defs>
            {/* Glow + drop-shadow filter cho marker — mạnh hơn để nổi trên nền ảnh thật */}
            {BIBLE_LOCATIONS.map(loc => (
              <filter key={`glow-${loc.id}`} id={`bm-glow-${loc.id}`} x="-80%" y="-80%" width="260%" height="260%">
                {/* Drop shadow đen phía sau */}
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="rgba(0,0,0,0.8)" result="shadow" />
                {/* Glow màu */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feFlood floodColor={loc.color} floodOpacity="0.85" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="colorGlow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="colorGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* Glow filter cho đường Exodus (xanh dương) */}
            <filter id="bm-exodusGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feFlood floodColor="#3B82F6" floodOpacity="0.55" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Glow cho sông */}
            <filter id="bm-riverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feFlood floodColor="#4A90D9" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Glow cho đường Tổ phụ */}
            <filter id="bm-patriarchGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feFlood floodColor="#CD853F" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Nền bản đồ địa hình ── */}
          {/* Layer 1: ảnh địa hình — stretch vừa khít viewBox, filter làm nổi màu */}
          <image
            href="/images/maps/mapsland-geography-full.webp"
            x="0" y="0" width="500" height="800"
            preserveAspectRatio="none"
            style={{ filter: 'saturate(1.15) brightness(0.82)' }}
          />
          {/* Layer 2: overlay tối nhẹ */}
          <rect width="500" height="800" fill="rgba(0,0,0,0.18)" />
          {/* Layer 3: vignette viền */}
          <radialGradient id="bm-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
          <rect width="500" height="800" fill="url(#bm-vignette)" />

          {/* ── Hành trình (Routes) ── */}
          {ROUTES.map(route => (
            <g key={route.id}>
              {/* Shadow/glow layer */}
              <path
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth={route.glow ? 3.5 : 2}
                strokeLinecap="round"
                strokeDasharray={`${route.dashLength} ${route.gapLength}`}
                opacity={route.glow ? 0.2 : 0.12}
                filter={route.glow ? 'url(#bm-exodusGlow)' : 'url(#bm-patriarchGlow)'}
              />
              {/* Animated dashed line */}
              <path
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth={route.glow ? 1.8 : 1.4}
                strokeLinecap="round"
                strokeDasharray={`${route.dashLength} ${route.gapLength}`}
                opacity={route.glow ? 0.85 : 0.6}
                filter={route.glow ? 'url(#bm-exodusGlow)' : undefined}
                style={{
                  animation: `bm-dash-${route.id} ${route.animDur} linear infinite`,
                }}
              />
              {/* Direction arrow at end of route */}
            </g>
          ))}

          {/* CSS animations for dashoffset */}
          <style>{`
            @keyframes bm-dash-patriarch {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: -312; }
            }
            @keyframes bm-dash-exodus {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: -338; }
            }
          `}</style>

          {/* ── Sông Jordan ── */}
          <path d={MAP.jordan} fill="none" stroke="#2a5a9a" strokeWidth="2"
            strokeLinecap="round" filter="url(#bm-riverGlow)" opacity="0.8" />

          {/* ── Biển Chết & Hồ Galilê — overlay tăng cường ── */}
          <path d={MAP.deadSea}    fill="rgba(10,42,72,0.45)" stroke="#5aaad8" strokeWidth="1.2" />
          <path d={MAP.galileeSea} fill="rgba(12,50,88,0.45)" stroke="#5aaad8" strokeWidth="1.2" />
          {/* Sóng Biển Chết */}
          <path d="M 284,530 Q 290,526 296,530 Q 302,534 308,530"
            fill="none" stroke="#6aB4E8" strokeWidth="1" opacity="0.6" />
          {/* Sóng Galilê */}
          <path d="M 308,271 Q 315,267 322,271 Q 329,275 336,271"
            fill="none" stroke="#6aB4E8" strokeWidth="1" opacity="0.7" />

          {/* ── Mũi tên off-map: Ai Cập/Sinai (Nam), Lưỡng Hà (Bắc-Đông) ── */}
          <g opacity="0.55" style={{ pointerEvents: 'none' }}>
            {/* Ai Cập ← phía Nam */}
            <text x="220" y="792" textAnchor="middle" fontSize="8" fill="#4A90D9"
              fontFamily='"EB Garamond", Georgia, serif' fontStyle="italic">
              ↓ Ai Cập · Sinai · Gôsen
            </text>
            {/* Lưỡng Hà → phía Bắc-Đông */}
            <text x="460" y="30" textAnchor="end" fontSize="8" fill="#CD853F"
              fontFamily='"EB Garamond", Georgia, serif' fontStyle="italic">
              Haran · Ur · Babylon →
            </text>
          </g>

          {/* ── Route labels ── */}
          {ROUTES.map(route => {
            const labelPos = route.id === 'patriarch'
              ? { x: 165, y: 300 }
              : { x: 175, y: 700 };
            return (
              <text key={`lbl-${route.id}`}
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle" fontSize="7"
                fill={route.color} opacity="0.7"
                fontFamily='"EB Garamond", Georgia, serif'
                fontStyle="italic"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {route.label}
              </text>
            );
          })}

          {/* ── La bàn ── */}
          <g opacity="0.15">
            <circle cx="455" cy="55" r="24" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
            <line x1="455" y1="31" x2="455" y2="79" stroke="#D4AF37" strokeWidth="0.7" />
            <line x1="431" y1="55" x2="479" y2="55" stroke="#D4AF37" strokeWidth="0.7" />
            <text x="455" y="24" textAnchor="middle" fontSize="8" fill="#D4AF37"
              fontFamily="serif" fontWeight="bold">N</text>
          </g>

          {/* ── Markers địa danh ── */}
          {BIBLE_LOCATIONS.map(loc => {
            const isHov = hovered === loc.id;
            const isSel = selected?.id === loc.id;
            const active = isHov || isSel;

            return (
              <g key={loc.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(loc.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleMarkerClick(loc)}
              >
                {/* Vòng sáng outer khi active */}
                {active && (
                  <circle cx={loc.x} cy={loc.y} r={14}
                    fill="none" stroke={loc.color}
                    strokeWidth="0.8" opacity="0.45" />
                )}

                {loc.marker === 'star' ? (
                  // ── Ngôi sao — Jerusalem ──
                  <>
                    {active && (
                      <polygon
                        points={starPoints(loc.x, loc.y, 13)}
                        fill="none" stroke={loc.color}
                        strokeWidth="0.8" opacity="0.35" />
                    )}
                    <polygon
                      points={starPoints(loc.x, loc.y, active ? 9 : 7)}
                      fill={active ? loc.color : `${loc.color}99`}
                      filter={active ? `url(#bm-glow-${loc.id})` : undefined}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  </>
                ) : loc.marker === 'wave' ? (
                  // ── Sóng nước — Biển Hồ Galilê ──
                  <>
                    <circle cx={loc.x} cy={loc.y} r={active ? 9 : 7}
                      fill={active ? `${loc.color}28` : 'transparent'}
                      stroke={loc.color}
                      strokeWidth={active ? 1 : 0.7}
                      opacity={active ? 1 : 0.6}
                      filter={active ? `url(#bm-glow-${loc.id})` : undefined}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <path d={wavePath(loc.x, loc.y - 2, 6, 2.5)}
                      fill="none" stroke={loc.color}
                      strokeWidth={active ? 1.6 : 1.2}
                      strokeLinecap="round"
                      opacity={active ? 1 : 0.75}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <path d={wavePath(loc.x, loc.y + 2, 5, 2)}
                      fill="none" stroke={loc.color}
                      strokeWidth={active ? 1.2 : 0.9}
                      strokeLinecap="round"
                      opacity={active ? 0.8 : 0.55}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  </>
                ) : (
                  // ── Circle — mặc định ──
                  <>
                    <circle cx={loc.x} cy={loc.y}
                      r={active ? 10 : 8}
                      fill={active ? `${loc.color}22` : 'transparent'}
                      stroke={loc.color}
                      strokeWidth={active ? 1 : 0.6}
                      opacity={active ? 1 : 0.5}
                      filter={active ? `url(#bm-glow-${loc.id})` : undefined}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <circle cx={loc.x} cy={loc.y}
                      r={active ? 4 : 2.8}
                      fill={loc.color}
                      opacity={active ? 1 : 0.8}
                      filter={active ? `url(#bm-glow-${loc.id})` : undefined}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  </>
                )}

                {/* Nhãn tên — paint-order stroke trước để tạo viền đen đọc rõ trên ảnh thật */}
                <text
                  x={loc.x}
                  y={loc.y - 14}
                  textAnchor="middle"
                  fontSize={active ? 8.5 : 7.5}
                  fill={active ? loc.color : `${loc.color}cc`}
                  stroke="rgba(0,0,0,0.85)"
                  strokeWidth={active ? 2.5 : 2}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  fontFamily='"EB Garamond", Georgia, serif'
                  fontWeight="bold"
                  style={{ transition: 'all 0.2s ease', userSelect: 'none', pointerEvents: 'none' }}
                >
                  {loc.name}
                </text>
              </g>
            );
          })}

          {/* ── Hover Tooltip ── */}
          <HoverTooltip loc={hoveredLoc && !selected ? hoveredLoc : null} />
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

        {/* Route legend */}
        <div
          className="absolute bottom-3 right-3 rounded-xl px-3 py-2 flex flex-col gap-1"
          style={{ background: 'rgba(6,10,18,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {ROUTES.map(r => (
            <div key={r.id} className="flex items-center gap-1.5">
              <svg width="18" height="6" viewBox="0 0 18 6">
                <line x1="0" y1="3" x2="18" y2="3"
                  stroke={r.color} strokeWidth="1.5"
                  strokeDasharray="4 3" strokeLinecap="round" />
              </svg>
              <span className="text-[10px]" style={{ color: `${r.color}99` }}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* Hint text */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(6,10,18,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <MapPin size={11} style={{ color: '#D4AF3788' }} />
          <span className="text-[10px] text-white/40">Hover / Click địa danh</span>
        </div>
      </div>

      {/* ── Popover (rendered outside SVG) ── */}
      <LocationPopover
        loc={selected}
        svgRect={svgRect}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
