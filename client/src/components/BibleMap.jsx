import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, BookOpen, Compass } from 'lucide-react';

// ─── Dữ liệu địa danh ────────────────────────────────────────────────────────
const BIBLE_LOCATIONS = [
  {
    id: 'ur', name: 'Ur', region: 'Lưỡng Hà',
    x: 615, y: 352, category: 'patriarch', color: '#CD853F', marker: 'circle',
    tooltip: 'Quê hương Abraham — khởi điểm cuộc hành trình đức tin',
    summary: 'Quê hương của Abraham. Thiên Chúa gọi ông rời khỏi nơi đây để đi đến vùng đất hứa.',
    verse: '"Hãy rời bỏ xứ sở, họ hàng và nhà cha ngươi." — St 12,1',
    catechism: 'GLCG 59: Abraham được gọi là cha của mọi tín hữu.',
  },
  {
    id: 'haran', name: 'Haran', region: 'Bắc Mesopotamia',
    x: 432, y: 68, category: 'patriarch', color: '#CD853F', marker: 'circle',
    tooltip: 'Điểm dừng chân đầu tiên của gia đình Abraham',
    summary: 'Điểm dừng chân của gia đình Abraham trên đường từ Ur đến Canaan. Ông ở đây cho đến khi cha là Têra qua đời.',
    verse: '"Họ rời Ur của người Canđê... họ đến Haran và ở lại đó." — St 11,31',
    catechism: 'GLCG 60: Thiên Chúa tuyển chọn Abraham để lập nên một dân thánh.',
  },
  {
    id: 'sichem', name: 'Sichem', region: 'Trung tâm Canaan',
    x: 234, y: 188, category: 'patriarch', color: '#C8860A', marker: 'circle',
    tooltip: 'Nơi đầu tiên Thiên Chúa hiện ra với Abraham tại Canaan',
    summary: 'Nơi đầu tiên Thiên Chúa hiện ra với Abraham tại Canaan và hứa ban đất này cho dòng dõi ông.',
    verse: '"Đất này, Ta sẽ ban cho dòng dõi ngươi." — St 12,7',
    catechism: 'GLCG 145: Abraham đã tuân theo tiếng gọi của Thiên Chúa bằng đức tin.',
  },
  {
    id: 'hebron', name: 'Hébron', region: 'Nam Canaan',
    x: 236, y: 290, category: 'patriarch', color: '#C8860A', marker: 'circle',
    tooltip: 'Nơi Abraham, Isaac và Giacóp sống và được chôn cất',
    summary: 'Nơi Abraham, Isaac và Giacóp sống và được chôn cất. Thiên Chúa lập Giao ước cắt bì với Abraham tại đây.',
    verse: '"Ta sẽ trở lại thăm ngươi vào mùa xuân tới." — St 18,10',
    catechism: 'GLCG 706: Ở Hébron, lời hứa về dòng dõi bắt đầu trở nên cụ thể.',
  },
  {
    id: 'goshen', name: 'Gôsen', region: 'Đồng bằng sông Nile',
    x: 96, y: 368, category: 'exodus', color: '#4A90D9', marker: 'circle',
    tooltip: 'Dân Israel sống 430 năm ở Ai Cập trước khi Xuất hành',
    summary: 'Vùng đất màu mỡ ở Ai Cập mà Pharaô cấp cho gia tộc Giacóp. Dân Israel sống ở đây 430 năm.',
    verse: '"Hãy ở lại xứ Gôsen và gần Ta." — St 45,10',
    catechism: 'GLCG 62: Thiên Chúa dùng hoàn cảnh khó khăn để thực hiện kế hoạch cứu độ.',
  },
  {
    id: 'sinai', name: 'Núi Sinai', region: 'Bán đảo Sinai',
    x: 188, y: 430, category: 'exodus', color: '#4A90D9', marker: 'circle',
    tooltip: 'Nơi Môisê nhận Mười Điều Răn và lập Giao ước với Thiên Chúa',
    summary: 'Thiên Chúa hiện ra với Môsê trong bụi gai bốc lửa. Sau Xuất hành, dân Israel nhận Mười Điều Răn tại đây.',
    verse: '"Ta là Đấng Ta Là (YHWH)." — Xh 3,14',
    catechism: 'GLCG 2056: Mười Điều Răn là nền tảng của đạo đức Kitô giáo.',
  },
  {
    id: 'kadesh', name: 'Kadesh Barnea', region: 'Sa mạc Negev',
    x: 210, y: 348, category: 'exodus', color: '#4A90D9', marker: 'circle',
    tooltip: 'Nơi dân Israel ở 40 năm trong sa mạc trước khi vào Canaan',
    summary: 'Oasis trong sa mạc — căn cứ 40 năm của Israel trong hoang mạc sau khi từ chối vào Canaan.',
    verse: '"Các ngươi sẽ chăn chiên trong sa mạc 40 năm." — Ds 14,33',
    catechism: 'GLCG 1290: Bốn mươi năm sa mạc là thời gian thanh luyện và tập tành đức tin.',
  },
  {
    id: 'jericho', name: 'Giêricô', region: 'Thung lũng Jordan',
    x: 254, y: 236, category: 'conquest', color: '#7B68EE', marker: 'circle',
    tooltip: 'Thành đầu tiên bị sụp đổ khi dân Israel vào Đất Hứa',
    summary: 'Thành phố đầu tiên bị dân Israel chiếm khi vào Canaan. Các bức tường sụp đổ khi dân thổi tù và.',
    verse: '"Hãy đi vòng quanh thành bảy lần... bức tường sẽ sụp đổ." — Gs 6,3–5',
    catechism: 'GLCG 1093: Chinh phục Canaan báo hiệu cuộc chiến thiêng liêng.',
  },
  {
    id: 'jerusalem', name: 'Giêrusalem', region: 'Đồi Zion / Giuđa',
    x: 242, y: 260, category: 'kingdom', color: '#9B59B6', marker: 'star',
    tooltip: 'Thành Thánh — nơi Đavít lập kinh đô, Đền thờ được xây, và Đức Giêsu chịu chết và sống lại',
    summary: 'Vua Đavít chinh phục Giêrusalem và lập làm thủ đô. Salômôn xây Đền thờ. Đây là nơi Đức Giêsu chịu chết và sống lại.',
    verse: '"Giêrusalem, được xây dựng như thành đô kiên cố." — Tv 122,3',
    catechism: 'GLCG 585: Đức Giêsu hoàn tất việc thờ phượng của Đền thờ bằng chính thân mình Ngài.',
  },
  {
    id: 'bethlehem', name: 'Bêlem', region: 'Nam Giuđa',
    x: 238, y: 276, category: 'newt', color: '#FFD700', marker: 'circle',
    tooltip: 'Quê hương Đavít — nơi Đức Giêsu Kitô giáng sinh',
    summary: 'Quê hương của vua Đavít. Đức Giêsu Kitô, Con Thiên Chúa, được sinh ra tại đây.',
    verse: '"Hôm nay, một Đấng Cứu Độ đã sinh ra trong thành vua Đavít." — Lc 2,11',
    catechism: 'GLCG 437: "Bêlem" nghĩa là "nhà bánh mì" — hình bóng của Bánh Thánh Thể.',
  },
  {
    id: 'nazareth', name: 'Nadarét', region: 'Miền Galilê',
    x: 228, y: 155, category: 'newt', color: '#FFD700', marker: 'circle',
    tooltip: 'Nơi Đức Giêsu sống 30 năm ẩn dật, sứ thần truyền tin cho Đức Maria',
    summary: 'Nơi Đức Giêsu lớn lên trong 30 năm ẩn dật với Mẹ Maria và Thánh Giuse.',
    verse: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta." — Ga 1,14',
    catechism: 'GLCG 533: Đời sống ẩn dật tại Nadarét dạy ta giá trị lao động và sống gia đình.',
  },
  {
    id: 'galilee-lake', name: 'Biển Hồ Galilê', region: 'Miền Bắc Israel',
    x: 262, y: 160, category: 'newt', color: '#38BDF8', marker: 'wave',
    tooltip: 'Nơi Đức Giêsu gọi các môn đệ, đi trên mặt nước và làm nhiều phép lạ',
    summary: 'Đức Giêsu gọi các môn đệ đầu tiên — ngư phủ trên hồ này. Ngài đi trên mặt nước tại đây.',
    verse: '"Hãy theo Ta, Ta sẽ làm cho các anh thành những kẻ lưới người." — Mc 1,17',
    catechism: 'GLCG 878: Nhóm Mười Hai đặt nền tảng cho cơ cấu tông truyền của Hội Thánh.',
  },
  {
    id: 'babylon', name: 'Babylon', region: 'Nam Lưỡng Hà',
    x: 572, y: 292, category: 'exile', color: '#607D8B', marker: 'circle',
    tooltip: 'Nơi dân Israel bị lưu đày 587–538 TCN — các ngôn sứ loan báo Giao ước Mới',
    summary: 'Vua Nabucôđônôsor phá hủy Giêrusalem và dẫn dân Israel lưu đày về đây năm 587 TCN.',
    verse: '"Bên bờ sông Babylon, chúng tôi ngồi mà khóc." — Tv 137,1',
    catechism: 'GLCG 710: Lưu đày chuẩn bị dân Israel đón nhận Đấng Cứu Thế.',
  },
];

// ─── Hành trình (Routes) ──────────────────────────────────────────────────────
const ROUTES = [
  {
    id: 'patriarch',
    label: 'Hành trình Tổ phụ',
    color: '#CD853F',
    glow: false,
    dashLength: 7,
    gapLength: 5,
    animDur: '18s',
    totalLen: 320,
    d: 'M 615,352 Q 530,280 460,190 Q 448,130 432,68 Q 380,110 330,148 Q 285,165 234,188 Q 235,240 236,290',
  },
  {
    id: 'exodus-egypt',
    label: 'Xuất Hành',
    color: '#3B82F6',
    glow: true,
    dashLength: 8,
    gapLength: 5,
    animDur: '10s',
    totalLen: 260,
    // Goshen → Red Sea crossing → Sinai → Kadesh → Jericho
    d: 'M 96,368 Q 118,388 138,398 Q 158,412 178,428 Q 190,436 196,430 Q 208,422 210,400 Q 212,375 212,360 Q 210,354 210,348 Q 212,320 230,296 Q 242,270 254,250 Q 255,244 254,236',
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

// ─── SVG Map Shapes ───────────────────────────────────────────────────────────
const MAP = {
  land: `M 112,28 L 180,14 L 280,8 L 380,4 L 468,0 L 720,0 L 720,500
         L 560,500 L 460,498 L 368,500 L 290,498 L 234,500 L 172,492
         L 110,500 L 50,480 L 14,456 L 0,430 L 0,400 L 8,368 L 0,330
         L 0,290 L 12,250 L 8,210 L 18,168 L 32,134 L 52,100 L 72,68
         L 92,46 Z`,
  deadSea:    `M 248,261 L 256,256 L 264,262 L 266,278 L 260,297 L 250,300 L 242,292 L 240,276 Z`,
  galileeSea: `M 250,148 L 258,144 L 266,150 L 268,162 L 260,170 L 250,168 L 244,160 Z`,
  jordan:    `M 258,138 Q 262,155 260,172 Q 258,188 261,204 Q 264,220 260,238 Q 256,252 252,258`,
  nile:      `M 88,355 Q 76,378 64,410 Q 50,438 36,462 Q 22,480 8,496`,
  euphrates: `M 436,52 Q 460,88 484,132 Q 512,180 530,230 Q 548,270 562,310 Q 576,342 590,365`,
  tigris:    `M 494,20 Q 516,60 532,108 Q 550,162 566,212 Q 582,256 596,298 Q 614,332 630,358`,
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
  const scaleX = svgRect.width / 720;
  const scaleY = svgRect.height / 500;
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
          viewBox="0 0 720 500"
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
          <image
            href="/images/maps/mapsland-geography-full.webp"
            x="0" y="0" width="720" height="500"
            preserveAspectRatio="xMidYMid slice"
          />
          {/* Lớp tối hoá để khớp dark mode — giữ chi tiết địa lý, giảm chói */}
          <rect width="720" height="500" fill="rgba(0,0,0,0.48)" />
          {/* Vignette viền tối tự nhiên */}
          <radialGradient id="bm-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </radialGradient>
          <rect width="720" height="500" fill="url(#bm-vignette)" />

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
              to   { stroke-dashoffset: -${12 * 26}; }
            }
            @keyframes bm-dash-exodus-egypt {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: -${13 * 26}; }
            }
          `}</style>

          {/* ── Sông ngòi ── */}
          <path d={MAP.jordan} fill="none" stroke="#2a5a9a" strokeWidth="1.8"
            strokeLinecap="round" filter="url(#bm-riverGlow)" opacity="0.75" />
          <path d={MAP.nile} fill="none" stroke="#1e4a7a" strokeWidth="2"
            strokeLinecap="round" filter="url(#bm-riverGlow)" opacity="0.65" />
          <path d={MAP.euphrates} fill="none" stroke="#1e4070" strokeWidth="1.6"
            strokeLinecap="round" filter="url(#bm-riverGlow)" opacity="0.55" />
          <path d={MAP.tigris} fill="none" stroke="#1e4070" strokeWidth="1.4"
            strokeLinecap="round" filter="url(#bm-riverGlow)" opacity="0.45" />

          {/* ── Biển Chết & Hồ Galilê — overlay bán trong suốt ── */}
          <path d={MAP.deadSea}    fill="rgba(10,42,72,0.55)"  stroke="#4a8aB8" strokeWidth="1" />
          <path d={MAP.galileeSea} fill="rgba(12,50,88,0.55)"  stroke="#4a8aB8" strokeWidth="1" />

          {/* Sóng nhỏ trên Biển Chết */}
          <path d="M 248,278 Q 252,275 256,278 Q 260,281 264,278"
            fill="none" stroke="#6aB4E8" strokeWidth="0.9" opacity="0.7" />
          {/* Sóng nhỏ trên Hồ Galilê */}
          <path d="M 251,158 Q 254,155 258,158 Q 261,161 264,158"
            fill="none" stroke="#6aB4E8" strokeWidth="0.9" opacity="0.8" />

          {/* ── Route labels ── */}
          {ROUTES.map(route => {
            // Midpoint label positioning (approximate)
            const labelPos = route.id === 'patriarch'
              ? { x: 380, y: 105 }
              : { x: 148, y: 396 };
            return (
              <text key={`lbl-${route.id}`}
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle"
                fontSize="6.5"
                fill={route.color}
                opacity="0.6"
                fontFamily='"EB Garamond", Georgia, serif'
                fontStyle="italic"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {route.label}
              </text>
            );
          })}

          {/* ── Nhãn địa lý ── */}
          {[
            { x: 36,  y: 200, text: 'Địa Trung Hải', angle: -72, size: 9 },
            { x: 200, y: 340, text: 'Sinai',          angle: 0,   size: 8 },
            { x: 68,  y: 420, text: 'Ai Cập',         angle: 0,   size: 9 },
            { x: 540, y: 160, text: 'Lưỡng Hà',       angle: 0,   size: 9 },
            { x: 240, y: 220, text: 'CANAAN',          angle: 0,   size: 8 },
            { x: 258, y: 283, text: 'Biển Chết',       angle: 0,   size: 6.5 },
            { x: 258, y: 157, text: 'Galilê',          angle: 0,   size: 6 },
          ].map((l, i) => (
            <text key={i} x={l.x} y={l.y}
              textAnchor="middle" fontSize={l.size}
              fill="rgba(255,255,255,0.55)"
              fontFamily='"EB Garamond", Georgia, serif'
              fontStyle="italic"
              transform={l.angle ? `rotate(${l.angle}, ${l.x}, ${l.y})` : undefined}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {l.text}
            </text>
          ))}

          {/* ── La bàn ── */}
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

                {/* Nhãn tên */}
                <text
                  x={loc.x}
                  y={loc.y - (loc.marker === 'star' ? 14 : 14)}
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
