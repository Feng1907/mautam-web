import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, ChevronRight } from 'lucide-react';

// ─── Dữ liệu 3 miền Israel thời Tân Ước ──────────────────────────────────────
const REGIONS = [
  {
    id: 'galilee',
    label: 'GALILÊ',
    labelSub: 'Miền Bắc',
    // SVG polygon — ViewBox 280×450
    polygon: '45,22 88,8 135,5 178,14 215,32 238,62 248,95 250,128 246,155 236,180 195,188 148,190 100,186 62,180 35,170 20,140 18,108 24,75 35,48',
    fillBase: '#0d2b1a',
    fillActive: '#1a4a2e',
    stroke: '#22c55e',
    strokeActive: '#4ade80',
    labelPos: { x: 110, y: 100 },
    accent: '#4ade80',
    accentMid: '#22c55e',
    badgeColor: '#16a34a',
    summary: 'Nơi Đức Giêsu dành phần lớn sứ vụ công khai — rao giảng Tin Mừng Nước Trời, chữa lành người đau yếu và gọi các tông đồ từ những ngư phủ vô danh.',
    miracles: [
      'Biến nước thành rượu tại tiệc cưới Cana (Ga 2)',
      'Nhân bánh hóa nhiều nuôi 5.000 người',
      'Đi trên mặt nước Biển Hồ Galilê',
      'Chúa biến hình trên Núi Tabor (Mt 17)',
    ],
    cities: [
      { id: 'nazareth',   name: 'Nadarét',    x: 128, y: 152, verse: '"Ông Giêsu xuất thân từ Nadarét ở Galilê." — Mc 1,9',  note: '30 năm Chúa sống ẩn dật với Đức Maria và Thánh Giuse' },
      { id: 'cana',       name: 'Cana',        x: 163, y: 120, verse: '"Đây là dấu lạ đầu tiên Đức Giêsu làm." — Ga 2,11',    note: 'Phép lạ đầu tiên: nước hóa rượu tại tiệc cưới' },
      { id: 'capernaum',  name: 'Capharnaum',  x: 237, y: 106, verse: '"Đây là thành của Ngài." — Mt 9,1',                     note: 'Trung tâm sứ vụ Galilê, nhà ông Phêrô' },
      { id: 'tabor',      name: 'Núi Tabor',   x: 178, y: 160, verse: '"Dung nhan Người chói lọi như mặt trời." — Mt 17,2',   note: 'Nơi Chúa biến hình trước Phêrô, Giacôbê, Gioan' },
      { id: 'tiberias',   name: 'Tiberias',    x: 240, y: 140, verse: '"Đức Giêsu đứng trên bờ." — Ga 21,4',                  note: 'Bờ biển hồ — nơi Chúa hiện ra sau Phục sinh' },
    ],
  },
  {
    id: 'samaria',
    label: 'SAMARIA',
    labelSub: 'Miền Trung',
    polygon: '35,170 62,180 100,186 148,190 195,188 236,180 248,208 250,242 245,270 234,290 195,298 148,300 100,296 65,290 40,278 25,254 22,226 26,200',
    fillBase: '#271e04',
    fillActive: '#3d2e08',
    stroke: '#f59e0b',
    strokeActive: '#fbbf24',
    labelPos: { x: 108, y: 242 },
    accent: '#fbbf24',
    accentMid: '#f59e0b',
    badgeColor: '#d97706',
    summary: 'Vùng đất của người Samaria — bị người Do Thái thời đó xa lánh. Đức Giêsu đã phá vỡ rào cản kỳ thị bằng tình yêu vô điều kiện và mặc khải "nước hằng sống".',
    miracles: [
      'Gặp người phụ nữ bên Giếng Giacóp tại Sychar (Ga 4)',
      'Chữa lành 10 người phong cùi, chỉ 1 người Samaria quay lại tạ ơn',
      'Dụ ngôn "Người Samaria nhân hậu" (Lc 10)',
    ],
    cities: [
      { id: 'sychar',    name: 'Sychar',   x: 148, y: 250, verse: '"Ai uống nước tôi cho sẽ không bao giờ khát." — Ga 4,14', note: 'Giếng Giacóp — nơi Chúa mặc khải về nước hằng sống' },
      { id: 'shechem',   name: 'Sichem',   x: 125, y: 228, verse: '"Chúa hứa đất này cho dòng dõi ngươi." — St 12,7',        note: 'Thành cổ của tổ phụ Abraham, nơi lập giao ước' },
      { id: 'samaria-c', name: 'Samaria',  x: 102, y: 210, verse: '"Vua Amri mua ngọn núi Samaria." — 1V 16,24',             note: 'Thủ phủ vương quốc phía Bắc Israel xưa' },
    ],
  },
  {
    id: 'judea',
    label: 'GIUDÊ',
    labelSub: 'Miền Nam',
    polygon: '40,278 65,290 100,296 148,300 195,298 234,290 245,312 248,348 240,384 220,410 192,428 165,438 140,442 116,436 90,418 68,392 48,362 36,326 34,300',
    fillBase: '#1e0e06',
    fillActive: '#321808',
    stroke: '#f97316',
    strokeActive: '#fb923c',
    labelPos: { x: 120, y: 368 },
    accent: '#fb923c',
    accentMid: '#f97316',
    badgeColor: '#ea580c',
    summary: 'Trái tim của ơn Cứu độ. Tại Giêrusalem, Đức Giêsu chịu tử nạn trên thập giá và sống lại vào ngày thứ ba — hoàn tất toàn bộ lịch sử Kinh Thánh.',
    miracles: [
      'Phục sinh Ladarô tại Bêtania (Ga 11) — "Ta là sự sống lại và là sự sống"',
      'Vào thành Giêrusalem trên lưng lừa (Lc 19)',
      'Lập Bí tích Thánh Thể tại Phòng Tiệc Ly',
      'Tử nạn trên thập giá và Phục sinh (Lc 24)',
    ],
    cities: [
      { id: 'jerusalem', name: 'Giêrusalem', x: 148, y: 336, verse: '"Thành thánh mà mọi người hành hương về." — Lc 2,41', note: 'Nơi Chúa chịu chết và sống lại — trung tâm ơn Cứu độ' },
      { id: 'bethlehem', name: 'Bêlem',      x: 143, y: 358, verse: '"Hôm nay Đấng Cứu Độ đã sinh ra cho anh em." — Lc 2,11', note: 'Thành Đavít — nơi Đức Giêsu giáng sinh' },
      { id: 'jericho',   name: 'Giêricô',   x: 226, y: 314, verse: '"Zakêu, xuống mau đi!" — Lc 19,5',                    note: 'Chữa người mù Bartimê; Zakêu leo cây sung' },
      { id: 'bethany',   name: 'Bêtania',   x: 168, y: 326, verse: '"Ladarô ơi, hãy ra khỏi mồ!" — Ga 11,43',            note: 'Phục sinh Ladarô; nhà của Mácta và Maria' },
      { id: 'emmaus',    name: 'Emmaus',    x: 104, y: 328, verse: '"Lòng chúng ta đã bừng lên!" — Lc 24,32',             note: 'Chúa hiện ra sau Phục sinh, bẻ bánh' },
    ],
  },
];

// ─── Info panel ───────────────────────────────────────────────────────────────
const InfoPanel = ({ region, selectedCity, onCityClick }) => {
  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <MapPin size={20} style={{ color: 'rgba(255,255,255,0.18)' }} />
        </div>
        <p className="text-white/25 text-sm leading-relaxed">
          Chọn một miền để xem<br />chi tiết lịch sử & phép lạ
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={region.id}
        className="flex flex-col h-full overflow-y-auto no-scrollbar"
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -14 }}
        transition={{ duration: 0.22 }}
      >
        {/* Region header */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${region.accentMid}22` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: `${region.badgeColor}33`, color: region.accent }}>
              {region.labelSub}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2"
            style={{ fontFamily: '"Playfair Display", "EB Garamond", Georgia, serif', color: region.accent, letterSpacing: '0.08em' }}>
            {region.label}
          </h3>
          <p className="text-white/55 text-[13px] leading-relaxed">{region.summary}</p>
        </div>

        {/* Miracles */}
        <div className="px-5 py-3 shrink-0" style={{ borderBottom: 'none' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} style={{ color: region.accentMid }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: region.accentMid }}>
              Phép lạ & Sự kiện
            </p>
          </div>
          <ul className="space-y-1.5">
            {region.miracles.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: region.accentMid }} />
                <span className="text-white/50 text-[12px] leading-relaxed">{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cities */}
        <div className="px-5 pb-4 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: region.accentMid }}>
            Các thành phố
          </p>
          <div className="space-y-0.5">
            {region.cities.map(city => {
              const isSel = selectedCity?.id === city.id;
              return (
                <button key={city.id} onClick={() => onCityClick(city)}
                  className="w-full text-left rounded-xl px-3 py-2 transition-all duration-200 group"
                  style={{
                    background: isSel ? `${region.accentMid}1a` : 'transparent',
                    border: `1px solid ${isSel ? region.accentMid + '35' : 'transparent'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                      style={{ background: isSel ? region.accent : `${region.accent}55` }} />
                    <span className="text-[13px] font-medium transition-colors"
                      style={{ color: isSel ? region.accent : 'rgba(255,255,255,0.65)' }}>
                      {city.name}
                    </span>
                    <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: region.accentMid }} />
                  </div>
                  {isSel && (
                    <motion.div className="mt-1.5 ml-3.5 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}>
                      <p className="text-[11px] leading-relaxed text-white/45">{city.note}</p>
                      <p className="text-[11px] italic border-l pl-2"
                        style={{ color: `${region.accent}88`, borderColor: `${region.accentMid}35` }}>
                        {city.verse}
                      </p>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IsraelMap() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion,  setHoveredRegion]  = useState(null);
  const [selectedCity,   setSelectedCity]   = useState(null);

  const activeId   = hoveredRegion || selectedRegion;
  const activeData = REGIONS.find(r => r.id === activeId) ?? null;

  const handleRegionClick = (id) => {
    setSelectedCity(null);
    setSelectedRegion(prev => (prev === id ? null : id));
  };

  const handleCityClick = (city) => {
    setSelectedCity(prev => (prev?.id === city.id ? null : city));
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: '#07060a',
        border: '1px solid rgba(212,175,55,0.18)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.07)',
      }}>

      {/* ── Header ── */}
      <div className="px-5 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <MapPin size={14} style={{ color: '#D4AF3777' }} />
        <div>
          <p className="text-sm font-bold leading-tight"
            style={{ fontFamily: '"Playfair Display", "EB Garamond", Georgia, serif', color: '#D4AF37' }}>
            Israel thời Tân Ước
          </p>
          <p className="text-[10px] text-white/28">Ba miền địa lý — Nhấn để xem chi tiết</p>
        </div>
        {/* Legend pills */}
        <div className="ml-auto flex items-center gap-2">
          {REGIONS.map(r => (
            <button key={r.id}
              onClick={() => handleRegionClick(r.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200"
              style={{
                background: selectedRegion === r.id ? `${r.badgeColor}33` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedRegion === r.id ? r.accentMid + '60' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="w-2 h-2 rounded-full shrink-0"
                style={{ background: r.accentMid, boxShadow: `0 0 5px ${r.accentMid}90` }} />
              <span className="text-[10px] font-semibold hidden sm:block"
                style={{ color: selectedRegion === r.id ? r.accent : 'rgba(255,255,255,0.4)' }}>
                {r.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row">

        {/* ── SVG Map ── */}
        <div className="relative md:w-[55%] shrink-0 flex items-center justify-center p-4 md:p-5"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: 340 }}>

          {/* Sea glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 55% 90% at 2% 50%, #06142588 0%, transparent 65%)' }} />

          <svg viewBox="0 0 280 455" className="relative z-10 w-full" style={{ maxWidth: 255, maxHeight: 420 }}>
            <defs>
              {/* Region glow filters */}
              {REGIONS.map(r => (
                <filter key={r.id} id={`rglow-${r.id}`} x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor={r.stroke} floodOpacity="0.55" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <filter id="waterGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feFlood floodColor="#3b82f6" floodOpacity="0.55" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="g" />
                <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="cityGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Gradient for sea on left */}
              <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#061428" stopOpacity="1" />
                <stop offset="100%" stopColor="#030810" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Mediterranean Sea area (left of coast line) */}
            <path
              d="M 0,0 L 45,22 Q 35,60 20,110 Q 14,150 22,190 Q 26,225 40,278 Q 36,310 36,326 Q 34,340 34,300 L 0,455 Z"
              fill="url(#seaGrad)"
              opacity="0.9"
            />
            {/* Sea label */}
            <text x="12" y="240" textAnchor="middle" fontSize="5.5" fill="#3b82f655"
              fontFamily='"Inter", system-ui, sans-serif' fontStyle="italic"
              transform="rotate(-90, 12, 240)" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              ĐỊỊA TRUNG HẢI
            </text>

            {/* ── 3 Region polygons ── */}
            {REGIONS.map(r => {
              const isActive = activeId === r.id;
              const isSelected = selectedRegion === r.id;
              return (
                <g key={r.id}>
                  {/* Fill */}
                  <polygon
                    points={r.polygon}
                    fill={isActive ? r.fillActive : r.fillBase}
                    stroke={r.stroke}
                    strokeWidth={isActive ? 1.8 : 1.0}
                    strokeOpacity={isActive ? 1 : 0.55}
                    filter={isActive ? `url(#rglow-${r.id})` : undefined}
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease, stroke-width 0.15s ease' }}
                    onMouseEnter={() => setHoveredRegion(r.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => handleRegionClick(r.id)}
                  />

                  {/* Region name label — always visible */}
                  <text x={r.labelPos.x} y={r.labelPos.y} textAnchor="middle"
                    fontSize={isActive ? 11 : 9.5}
                    fill={isActive ? r.accent : `${r.accent}88`}
                    fontFamily='"Inter", system-ui, sans-serif' fontWeight="700"
                    letterSpacing="0.18em"
                    style={{ pointerEvents: 'none', userSelect: 'none', transition: 'all 0.2s ease' }}>
                    {r.label}
                  </text>
                  <text x={r.labelPos.x} y={r.labelPos.y + 12} textAnchor="middle"
                    fontSize={isActive ? 7.5 : 6.5}
                    fill={isActive ? `${r.accent}bb` : `${r.accent}50`}
                    fontFamily='"Inter", system-ui, sans-serif'
                    style={{ pointerEvents: 'none', userSelect: 'none', transition: 'all 0.2s ease' }}>
                    {r.labelSub}
                  </text>

                  {/* ── Cities — always visible dots, grow on region active ── */}
                  {r.cities.map(city => {
                    const isCitySel = selectedCity?.id === city.id;
                    const showDetail = isActive || isSelected;
                    return (
                      <motion.g
                        key={city.id}
                        style={{ cursor: showDetail ? 'pointer' : 'default' }}
                        onClick={(e) => {
                          if (!showDetail) return;
                          e.stopPropagation();
                          handleCityClick(city);
                        }}
                      >
                        {/* Pulse ring when selected */}
                        {isCitySel && (
                          <motion.circle cx={city.x} cy={city.y} r={9}
                            fill="none" stroke={r.accent} strokeWidth={0.8} opacity={0.45}
                            animate={{ r: [8, 12, 8] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
                        )}
                        {/* City dot */}
                        <circle
                          cx={city.x} cy={city.y}
                          r={showDetail ? (isCitySel ? 5 : 3.5) : 2}
                          fill={showDetail ? (isCitySel ? r.accent : `${r.accent}cc`) : `${r.accentMid}66`}
                          style={{
                            filter: showDetail ? `drop-shadow(0 0 3px ${r.accent})` : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        />
                        {/* City label — visible when region active */}
                        {showDetail && (
                          <text x={city.x} y={city.y - 8} textAnchor="middle"
                            fontSize={isCitySel ? 8.5 : 7.5}
                            fill={isCitySel ? r.accent : `${r.accent}cc`}
                            fontFamily='"Inter", system-ui, sans-serif'
                            fontWeight={isCitySel ? '700' : '500'}
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {city.name}
                          </text>
                        )}
                        {/* Minimal dot label when region not active */}
                        {!showDetail && (
                          <text x={city.x} y={city.y - 5} textAnchor="middle" fontSize={5.5}
                            fill={`${r.accentMid}44`}
                            fontFamily='"Inter", system-ui, sans-serif'
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {city.name}
                          </text>
                        )}
                      </motion.g>
                    );
                  })}
                </g>
              );
            })}

            {/* ── Dividing lines between regions (dashed) ── */}
            {/* Galilee–Samaria border */}
            <path d="M 35,170 Q 62,180 148,190 Q 195,188 236,180"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.6} strokeDasharray="3 3" />
            {/* Samaria–Judea border */}
            <path d="M 40,278 Q 65,290 148,300 Q 195,298 234,290"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.6} strokeDasharray="3 3" />

            {/* ── Water features ── */}
            {/* Sea of Galilee */}
            <ellipse cx={250} cy={126} rx={14} ry={20}
              fill="#0b2a4a" stroke="#1d5f9a" strokeWidth={0.9}
              filter="url(#waterGlow)" opacity={0.88} />
            <text x={250} y={123} textAnchor="middle" fontSize={4.8}
              fill="#4A90D9aa" fontFamily='"Inter", system-ui, sans-serif'
              fontStyle="italic" dominantBaseline="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              Hồ Galilê
            </text>

            {/* Dead Sea */}
            <ellipse cx={248} cy={342} rx={10} ry={30}
              fill="#040e1a" stroke="#0c3060" strokeWidth={0.9}
              filter="url(#waterGlow)" opacity={0.88} />
            <text x={248} y={342} textAnchor="middle" fontSize={4.5}
              fill="#3b82f677" fontFamily='"Inter", system-ui, sans-serif'
              fontStyle="italic" dominantBaseline="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              Biển Chết
            </text>

            {/* Jordan River */}
            <path d="M 250,146 Q 248,175 250,200 Q 252,222 248,252 Q 244,270 248,310"
              fill="none" stroke="#1e5fa0" strokeWidth={1.4}
              strokeLinecap="round" strokeDasharray="4 2"
              filter="url(#waterGlow)" opacity={0.65} />
            <text x={240} y={230} textAnchor="middle" fontSize={5}
              fill="#4A90D944" fontFamily='"Inter", system-ui, sans-serif' fontStyle="italic"
              transform="rotate(10, 240, 230)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              Sông Giođan
            </text>

            {/* Mediterranean coast line */}
            <path d="M 45,22 Q 35,60 20,110 Q 14,150 22,190 Q 26,225 40,278 Q 36,310 36,326"
              fill="none" stroke="#1e4878" strokeWidth={0.8} opacity={0.45} />

            {/* ── Compass rose ── */}
            <g opacity={0.22} transform="translate(24, 30)">
              <circle r={11} fill="none" stroke="#D4AF37" strokeWidth={0.6} />
              <line y1={-7} y2={7} stroke="#D4AF37" strokeWidth={0.5} />
              <line x1={-7} x2={7} stroke="#D4AF37" strokeWidth={0.5} />
              <text y={-10} textAnchor="middle" fontSize={5.5} fill="#D4AF37" fontFamily="serif">N</text>
            </g>

            {/* ── Scale bar ── */}
            <g opacity={0.25} transform="translate(26, 420)">
              <line x1={0} y1={0} x2={40} y2={0} stroke="#D4AF37" strokeWidth={0.7} />
              <line x1={0} y1={-3} x2={0} y2={3} stroke="#D4AF37" strokeWidth={0.7} />
              <line x1={40} y1={-3} x2={40} y2={3} stroke="#D4AF37" strokeWidth={0.7} />
              <text x={20} y={8} textAnchor="middle" fontSize={5} fill="#D4AF37" fontFamily='"Inter", system-ui, sans-serif'>
                ~80 km
              </text>
            </g>
          </svg>
        </div>

        {/* ── Info panel ── */}
        <div className="md:w-[45%] flex flex-col" style={{ minHeight: 340, maxHeight: 420 }}>
          <InfoPanel region={activeData} selectedCity={selectedCity} onCityClick={handleCityClick} />
        </div>
      </div>
    </div>
  );
}
