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
    fill: '#0f2318',
    fillHover: '#183322',
    stroke: '#22c55e',
    labelPos: { x: 110, y: 100 },
    accent: '#4ade80',
    accentMid: '#22c55e',
    summary: 'Nơi Đức Giêsu dành phần lớn sứ vụ công khai — rao giảng Tin Mừng Nước Trời, chữa lành người đau yếu và gọi các tông đồ từ những ngư phủ vô danh.',
    miracles: [
      'Biến nước thành rượu tại tiệc cưới Cana (Ga 2)',
      'Nhân bánh hóa nhiều nuôi 5.000 người',
      'Đi trên mặt nước Biển Hồ Galilê',
      'Chúa biến hình trên Núi Tabor (Mt 17)',
    ],
    cities: [
      { id: 'nazareth',   name: 'Nadarét',      x: 128, y: 152, verse: '"Ông Giêsu xuất thân từ Nadarét ở Galilê." — Mc 1,9',  note: '30 năm Chúa sống ẩn dật với Đức Maria và Thánh Giuse' },
      { id: 'cana',       name: 'Cana',          x: 160, y: 120, verse: '"Đây là dấu lạ đầu tiên Đức Giêsu làm." — Ga 2,11',    note: 'Phép lạ đầu tiên: nước hóa rượu tại tiệc cưới' },
      { id: 'capernaum',  name: 'Capharnaum',    x: 241, y: 108, verse: '"Đây là thành của Ngài." — Mt 9,1',                     note: 'Trung tâm sứ vụ Galilê, nhà ông Phêrô' },
      { id: 'tabor',      name: 'Núi Tabor',     x: 180, y: 158, verse: '"Dung nhan Người chói lọi như mặt trời." — Mt 17,2',   note: 'Nơi Chúa biến hình trước Phêrô, Giacôbê, Gioan' },
      { id: 'tiberias',   name: 'Tiberias',      x: 238, y: 140, verse: '"Đức Giêsu đứng trên bờ." — Ga 21,4',                  note: 'Bờ biển hồ — nơi Chúa hiện ra sau Phục sinh' },
    ],
  },
  {
    id: 'samaria',
    label: 'SAMARIA',
    labelSub: 'Miền Trung',
    polygon: '35,170 62,180 100,186 148,190 195,188 236,180 248,208 250,242 245,270 234,290 195,298 148,300 100,296 65,290 40,278 25,254 22,226 26,200',
    fill: '#1e1804',
    fillHover: '#2e2508',
    stroke: '#f59e0b',
    labelPos: { x: 108, y: 242 },
    accent: '#fbbf24',
    accentMid: '#f59e0b',
    summary: 'Vùng đất của người Samaria — bị người Do Thái thời đó xa lánh. Đức Giêsu đã phá vỡ rào cản kỳ thị bằng tình yêu vô điều kiện và mặc khải "nước hằng sống".',
    miracles: [
      'Gặp người phụ nữ bên Giếng Giacóp tại Sychar (Ga 4)',
      'Chữa lành 10 người phong cùi, chỉ 1 người Samaria quay lại tạ ơn',
      'Dụ ngôn "Người Samaria nhân hậu" (Lc 10)',
    ],
    cities: [
      { id: 'sychar',    name: 'Sychar',      x: 148, y: 250, verse: '"Ai uống nước tôi cho sẽ không bao giờ khát." — Ga 4,14', note: 'Giếng Giacóp — nơi Chúa mặc khải về nước hằng sống' },
      { id: 'shechem',   name: 'Sichem',      x: 128, y: 230, verse: '"Chúa hứa đất này cho dòng dõi ngươi." — St 12,7',        note: 'Thành cổ của tổ phụ Abraham, nơi lập giao ước' },
      { id: 'samaria-c', name: 'Samaria',     x: 105, y: 212, verse: '"Vua Amri mua ngọn núi Samaria." — 1V 16,24',             note: 'Thủ phủ vương quốc phía Bắc Israel xưa' },
    ],
  },
  {
    id: 'judea',
    label: 'GIUDÊ',
    labelSub: 'Miền Nam',
    polygon: '40,278 65,290 100,296 148,300 195,298 234,290 245,312 248,348 240,384 220,410 192,428 165,438 140,442 116,436 90,418 68,392 48,362 36,326 34,300',
    fill: '#1e0e06',
    fillHover: '#2e180c',
    stroke: '#f97316',
    labelPos: { x: 120, y: 368 },
    accent: '#fb923c',
    accentMid: '#f97316',
    summary: 'Trái tim của ơn Cứu độ. Tại Giêrusalem, Đức Giêsu chịu tử nạn trên thập giá và sống lại vào ngày thứ ba — hoàn tất toàn bộ lịch sử Kinh Thánh.',
    miracles: [
      'Phục sinh Ladarô tại Bêtania (Ga 11) — "Ta là sự sống lại và là sự sống"',
      'Vào thành Giêrusalem trên lưng lừa (Lc 19)',
      'Lập Bí tích Thánh Thể tại Phòng Tiệc Ly',
      'Tử nạn trên thập giá và Phục sinh (Lc 24)',
    ],
    cities: [
      { id: 'jerusalem', name: 'Giêrusalem',  x: 148, y: 336, verse: '"Thành thánh mà mọi người hành hương về." — Lc 2,41', note: 'Nơi Chúa chịu chết và sống lại — trung tâm ơn Cứu độ' },
      { id: 'bethlehem', name: 'Bêlem',        x: 145, y: 360, verse: '"Hôm nay Đấng Cứu Độ đã sinh ra cho anh em." — Lc 2,11', note: 'Thành Đavít — nơi Đức Giêsu giáng sinh' },
      { id: 'jericho',   name: 'Giêricô',     x: 228, y: 316, verse: '"Zakêu, xuống mau đi!" — Lc 19,5',                    note: 'Chữa người mù Bartimê; Zakêu leo cây sung' },
      { id: 'bethany',   name: 'Bêtania',      x: 170, y: 328, verse: '"Ladarô ơi, hãy ra khỏi mồ!" — Ga 11,43',            note: 'Phục sinh Ladarô; nhà của Mácta và Maria' },
      { id: 'emmaus',    name: 'Emmaus',       x: 106, y: 330, verse: '"Lòng chúng ta đã bừng lên!" — Lc 24,32',             note: 'Chúa hiện ra sau Phục sinh, bẻ bánh' },
    ],
  },
];

// ─── City dot component ───────────────────────────────────────────────────────
const CityDot = ({ city, accent, isRegionActive, onSelect, isSelected }) => {
  if (!isRegionActive) return null;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.2 }}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onSelect(city); }}
    >
      {/* Pulse ring */}
      {isSelected && (
        <circle cx={city.x} cy={city.y} r={10} fill="none" stroke={accent} strokeWidth={0.8} opacity={0.5} />
      )}
      {/* Dot */}
      <circle
        cx={city.x}
        cy={city.y}
        r={isSelected ? 4.5 : 3.5}
        fill={isSelected ? accent : `${accent}cc`}
        style={{ filter: isSelected ? `drop-shadow(0 0 4px ${accent})` : 'none' }}
      />
      {/* Label */}
      <text
        x={city.x}
        y={city.y - 9}
        textAnchor="middle"
        fontSize={isSelected ? 8 : 7}
        fill={isSelected ? accent : `${accent}bb`}
        fontFamily='"Inter", system-ui, sans-serif'
        fontWeight={isSelected ? '600' : '400'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {city.name}
      </text>
    </motion.g>
  );
};

// ─── Info panel ───────────────────────────────────────────────────────────────
const InfoPanel = ({ region, selectedCity, onCityClick }) => {
  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <MapPin size={22} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
        <p className="text-white/25 text-sm leading-relaxed">
          Di chuột hoặc chạm vào<br />một miền để xem chi tiết
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={region.id}
        className="flex flex-col h-full overflow-y-auto"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.25 }}
      >
        {/* Region header */}
        <div
          className="px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${region.accentMid}25` }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: `${region.accent}88` }}>
            {region.labelSub}
          </p>
          <h3
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              color: region.accent,
              letterSpacing: '0.08em',
            }}
          >
            {region.label}
          </h3>
          <p className="text-white/60 text-[13px] leading-relaxed">{region.summary}</p>
        </div>

        {/* Miracles */}
        <div className="px-5 py-3 shrink-0" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} style={{ color: region.accent }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: region.accentMid }}>
              Phép lạ & Sự kiện
            </p>
          </div>
          <ul className="space-y-1.5">
            {region.miracles.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: region.accentMid }} />
                <span className="text-white/55 text-[12px] leading-relaxed">{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cities */}
        <div className="px-5 py-3 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: region.accentMid }}>
            Các thành phố
          </p>
          <div className="space-y-1">
            {region.cities.map(city => {
              const isSel = selectedCity?.id === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => onCityClick(city)}
                  className="w-full text-left rounded-xl px-3 py-2.5 transition-all duration-200 group"
                  style={{
                    background: isSel ? `${region.accentMid}18` : 'transparent',
                    border: `1px solid ${isSel ? region.accentMid + '40' : 'transparent'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
                      style={{ background: isSel ? region.accent : `${region.accent}55` }}
                    />
                    <span
                      className="text-[13px] font-medium transition-colors duration-200"
                      style={{ color: isSel ? region.accent : 'rgba(255,255,255,0.7)' }}
                    >
                      {city.name}
                    </span>
                    <ChevronRight
                      size={12}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: region.accentMid }}
                    />
                  </div>
                  {isSel && (
                    <motion.div
                      className="mt-1.5 ml-3.5 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {city.note}
                      </p>
                      <p
                        className="text-[11px] italic border-l pl-2"
                        style={{ color: `${region.accent}99`, borderColor: `${region.accentMid}40` }}
                      >
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
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const activeRegion = hoveredRegion || selectedRegion;
  const activeData = REGIONS.find(r => r.id === activeRegion) ?? null;

  const handleRegionEnter = (id) => setHoveredRegion(id);
  const handleRegionLeave = () => setHoveredRegion(null);
  const handleRegionClick = (id) => {
    setSelectedCity(null);
    setSelectedRegion(prev => prev === id ? null : id);
  };

  const handleCityClick = (city) => {
    setSelectedCity(prev => prev?.id === city.id ? null : city);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#080604',
        border: '1px solid rgba(212,175,55,0.15)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.08)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 py-3.5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <MapPin size={15} style={{ color: '#D4AF3788' }} />
        <div>
          <p
            className="text-sm font-semibold leading-tight"
            style={{ fontFamily: '"EB Garamond", Georgia, serif', color: '#D4AF37' }}
          >
            Israel thời Tân Ước
          </p>
          <p className="text-[10px] text-white/30">Ba miền — Galilê · Samaria · Giudê</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {REGIONS.map(r => (
            <div key={r.id} className="hidden sm:flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: r.accentMid, boxShadow: `0 0 4px ${r.accentMid}80` }} />
              <span className="text-[10px] text-white/40">{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body: map + panel ── */}
      <div className="flex flex-col md:flex-row">

        {/* SVG Map */}
        <div
          className="relative md:w-[55%] shrink-0 flex items-center justify-center p-4 md:p-6"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: 340 }}
        >
          {/* Sea background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 80% at 15% 50%, #061428 0%, transparent 70%)',
            }}
          />

          <svg
            viewBox="0 0 280 450"
            className="relative z-10 w-full"
            style={{ maxWidth: 260, maxHeight: 420 }}
          >
            <defs>
              {REGIONS.map(r => (
                <filter key={r.id} id={`rglow-${r.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor={r.stroke} floodOpacity="0.7" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <filter id="waterGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="#4A90D9" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="g" />
                <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Mediterranean sea suggestion (left gradient) */}
            <defs>
              <radialGradient id="medSea" cx="0" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0a1f35" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="280" height="450" fill="url(#medSea)" />

            {/* ── 3 Region polygons ── */}
            {REGIONS.map(r => {
              const isActive = activeRegion === r.id;
              return (
                <g key={r.id}>
                  <polygon
                    points={r.polygon}
                    fill={isActive ? r.fillHover : r.fill}
                    stroke={r.stroke}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    strokeOpacity={isActive ? 0.9 : 0.45}
                    filter={isActive ? `url(#rglow-${r.id})` : undefined}
                    style={{ cursor: 'pointer', transition: 'fill 0.25s ease, stroke-width 0.2s ease' }}
                    onMouseEnter={() => handleRegionEnter(r.id)}
                    onMouseLeave={handleRegionLeave}
                    onClick={() => handleRegionClick(r.id)}
                  />
                  {/* Region label */}
                  <text
                    x={r.labelPos.x}
                    y={r.labelPos.y}
                    textAnchor="middle"
                    fontSize={isActive ? 10 : 8.5}
                    fill={isActive ? r.accent : `${r.accent}66`}
                    fontFamily='"Inter", system-ui, sans-serif'
                    fontWeight="700"
                    letterSpacing="0.15em"
                    style={{ pointerEvents: 'none', userSelect: 'none', transition: 'font-size 0.2s ease' }}
                  >
                    {r.label}
                  </text>
                  <text
                    x={r.labelPos.x}
                    y={r.labelPos.y + 11}
                    textAnchor="middle"
                    fontSize={6.5}
                    fill={isActive ? `${r.accent}cc` : `${r.accent}44`}
                    fontFamily='"Inter", system-ui, sans-serif'
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {r.labelSub}
                  </text>

                  {/* City dots — visible when region is active */}
                  <AnimatePresence>
                    {r.cities.map(city => (
                      <CityDot
                        key={city.id}
                        city={city}
                        accent={r.accent}
                        isRegionActive={isActive || selectedRegion === r.id}
                        isSelected={selectedCity?.id === city.id}
                        onSelect={handleCityClick}
                      />
                    ))}
                  </AnimatePresence>
                </g>
              );
            })}

            {/* ── Water features ── */}
            {/* Sea of Galilee */}
            <ellipse
              cx={252} cy={128} rx={15} ry={22}
              fill="#0c2f52"
              stroke="#1e5a8a"
              strokeWidth={0.8}
              filter="url(#waterGlow)"
              opacity={0.85}
            />
            <text x={252} y={128} textAnchor="middle" fontSize={5.5} fill="#4A90D955" fontFamily='"Inter", system-ui, sans-serif' fontStyle="italic" dominantBaseline="middle" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              Galilê
            </text>

            {/* Dead Sea */}
            <ellipse
              cx={250} cy={342} rx={11} ry={32}
              fill="#051020"
              stroke="#0e3060"
              strokeWidth={0.8}
              filter="url(#waterGlow)"
              opacity={0.85}
            />
            <text x={250} y={342} textAnchor="middle" fontSize={5} fill="#4A90D944" fontFamily='"Inter", system-ui, sans-serif' fontStyle="italic" dominantBaseline="middle" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              Biển Chết
            </text>

            {/* Jordan River */}
            <path
              d="M 252,150 Q 250,175 252,200 Q 254,225 250,252 Q 246,272 250,310"
              fill="none"
              stroke="#1e5a8a"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray="3 2"
              filter="url(#waterGlow)"
              opacity={0.6}
            />

            {/* Mediterranean coast line (suggestive) */}
            <path
              d="M 45,22 Q 35,60 20,110 Q 14,150 22,190 Q 26,225 40,278 Q 36,310 36,326"
              fill="none"
              stroke="#1e4070"
              strokeWidth={0.6}
              opacity={0.3}
            />

            {/* Compass rose */}
            <g opacity={0.18} transform="translate(24,26)">
              <circle r={12} fill="none" stroke="#D4AF37" strokeWidth={0.6} />
              <line y1={-8} y2={8} stroke="#D4AF37" strokeWidth={0.5} />
              <line x1={-8} x2={8} stroke="#D4AF37" strokeWidth={0.5} />
              <text y={-10} textAnchor="middle" fontSize={5} fill="#D4AF37" fontFamily="serif">N</text>
            </g>
          </svg>
        </div>

        {/* Info panel */}
        <div
          className="md:w-[45%] flex flex-col"
          style={{ minHeight: 340, maxHeight: 420 }}
        >
          <InfoPanel
            region={activeData}
            selectedCity={selectedCity}
            onCityClick={handleCityClick}
          />
        </div>
      </div>
    </div>
  );
}
