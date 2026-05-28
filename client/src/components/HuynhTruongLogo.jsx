// HuynhTruongLogo.jsx
// Logo "Huynh Trưởng" – khiên thiêng + biểu tượng (lửa / cánh / thánh giá).
//
// Sử dụng:
//   <HuynhTruongLogo symbol="flame" size={64} animated />
//   <HuynhTruongLogo size={24} compact />   // bản rút gọn, không có biểu tượng đỉnh
//
// Props:
//   symbol   – 'flame' (mặc định) | 'wings' | 'cross' | 'service'
//              • service: chén thánh + lửa + cành thiên tuế
//                (phụng sự + Thánh Thể + Chân Phước Anrê Phú Yên)
//   size     – chiều rộng pixel (mặc định 64)
//   animated – bật animation lửa-rung / cánh-bay / glow (mặc định true)
//   compact  – chỉ render khiên + chữ HT, không có biểu tượng đỉnh
//              (dùng cho favicon, sidebar 24-40px)
//   className, title – chuyển tiếp xuống <svg>
//
// File này hoàn toàn self-contained: không cần file CSS riêng,
// gradient ID có namespace nội bộ để tránh xung đột khi mount nhiều instance.

import { useId } from 'react';

export default function HuynhTruongLogo({
  symbol = 'flame',
  size = 64,
  animated = true,
  compact = false,
  className = '',
  title = 'Phòng Huynh Trưởng',
}) {
  const uid = useId().replace(/:/g, '');
  const id = (k) => `ht-${k}-${uid}`;

  const isWings = !compact && symbol === 'wings';
  const isWide = !compact && (symbol === 'wings' || symbol === 'service');
  const vb = compact ? '0 0 32 36' : isWide ? '0 0 80 72' : '0 0 64 72';
  const ratio = compact ? 36/32 : isWide ? 72/80 : 72/64;
  const height = Math.round(size * ratio);

  return (
    <svg
      viewBox={vb}
      width={size}
      height={height}
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#A50000" />
          <stop offset="55%"  stopColor="#7A0000" />
          <stop offset="100%" stopColor="#3D0808" />
        </linearGradient>
        <linearGradient id={id('gold')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F8D444" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A8810A" />
        </linearGradient>
        <linearGradient id={id('flame')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FFF6CC" />
          <stop offset="55%"  stopColor="#FFB833" />
          <stop offset="100%" stopColor="#E04A00" />
        </linearGradient>
        <linearGradient id={id('spec')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
          <stop offset="60%"  stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={id('wing')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#A8810A" />
          <stop offset="50%"  stopColor="#F8D444" />
          <stop offset="100%" stopColor="#A8810A" />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes ht-flicker-${uid} {
            0%, 100% { transform: translateY(0) scale(1);     opacity: 1; }
            50%      { transform: translateY(-0.4px) scale(1.04); opacity: 0.92; }
          }
          @keyframes ht-wings-${uid} {
            0%, 100% { transform: translateY(0)   rotate(0);  opacity: 1; }
            50%      { transform: translateY(-0.5px) rotate(-1deg); opacity: 0.95; }
          }
          @keyframes ht-palm-left-${uid} {
            0%, 100% { transform: rotate(0)    translateY(0); }
            50%      { transform: rotate(-1.5deg) translateY(-0.3px); }
          }
          @keyframes ht-palm-right-${uid} {
            0%, 100% { transform: rotate(0)    translateY(0); }
            50%      { transform: rotate(1.5deg)  translateY(-0.3px); }
          }
          .ht-flame-${uid} {
            animation: ht-flicker-${uid} 1.8s ease-in-out infinite;
            transform-origin: 32px 18px;
            filter: drop-shadow(0 0 4px #FFE066) drop-shadow(0 0 8px #F97316);
          }
          .ht-wings-${uid} {
            animation: ht-wings-${uid} 2.4s ease-in-out infinite;
            transform-origin: 40px 18px;
          }
          .ht-palm-left-${uid}  { animation: ht-palm-left-${uid}  3.6s ease-in-out infinite; transform-origin: 16px 40px; }
          .ht-palm-right-${uid} { animation: ht-palm-right-${uid} 3.6s ease-in-out infinite; transform-origin: 56px 40px; }
        `}</style>
      )}

      {/* Wings – vẽ TRƯỚC khiên để nằm phía sau */}
      {isWings && (
        <g className={animated ? `ht-wings-${uid}` : ''} transform="translate(8 0)">
          <path
            d="M22 14 C 14 12, 6 14, 0 18 C 4 18, 8 19, 12 21
               C 6 22, 2 24, -2 28 C 4 27, 9 27, 14 28
               C 9 30, 5 33, 2 37 C 8 35, 13 34, 18 35
               C 16 26, 19 19, 22 14 Z"
            fill={`url(#${id('wing')})`} opacity="0.95" />
          <path
            d="M42 14 C 50 12, 58 14, 64 18 C 60 18, 56 19, 52 21
               C 58 22, 62 24, 66 28 C 60 27, 55 27, 50 28
               C 55 30, 59 33, 62 37 C 56 35, 51 34, 46 35
               C 48 26, 45 19, 42 14 Z"
            fill={`url(#${id('wing')})`} opacity="0.95" />
          <path d="M4 22 L14 22 M2 28 L14 28 M6 33 L18 33
                   M60 22 L50 22 M62 28 L50 28 M58 33 L46 33"
                stroke="#7A5A05" strokeWidth="0.3" opacity="0.5" />
        </g>
      )}

      {/* Palms (Phụng Sự variant) – hai cành thiên tuế hai bên, vẽ trước khiên */}
      {!compact && symbol === 'service' && (
        <>
          <g className={animated ? `ht-palm-left-${uid}` : ''}>
            <path d="M 16 42 Q 4 28 6 4"   stroke={`url(#${id('gold')})`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M 14 36 Q 6 30 0 26"  stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 11 28 Q 4 22 0 16"  stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 9 19  Q 4 14 4 8"   stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 7 11  Q 6 7 8 2"    stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>
          <g className={animated ? `ht-palm-right-${uid}` : ''}>
            <path d="M 64 42 Q 76 28 74 4"  stroke={`url(#${id('gold')})`} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M 66 36 Q 74 30 80 26" stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 69 28 Q 76 22 80 16" stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 71 19 Q 76 14 76 8"  stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d="M 73 11 Q 74 7 72 2"   stroke={`url(#${id('gold')})`} strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>
        </>
      )}

      {/* Shield body */}
      <g transform={isWide ? 'translate(8 0)' : 'translate(0 0)'}>
        {compact ? (
          <>
            <path
              d="M16 2 L27 4.5 Q28 4.5 28 5.5 L28 17
                 C28 25, 23 30, 16 34
                 C9 30, 4 25, 4 17 L4 5.5 Q4 4.5 5 4.5 Z"
              fill={`url(#${id('bg')})`}
              stroke={`url(#${id('gold')})`} strokeWidth="0.6" />
            {/* Tiny chalice bowl */}
            <path d="M 11 14 Q 11 20, 16 20 Q 21 20, 21 14 Z"
                  fill={`url(#${id('gold')})`} opacity="0.95" />
            <path d="M 11 14 Q 16 12, 21 14" stroke="#FFF6CC" strokeWidth="0.35" fill="none" opacity="0.75" />
            {/* Stem + base */}
            <rect x="15" y="20" width="2" height="3" fill={`url(#${id('gold')})`} />
            <ellipse cx="16" cy="24" rx="3.5" ry="1" fill={`url(#${id('gold')})`} />
            {/* Tiny flame above bowl */}
            <path
              d="M 16 6.5
                 C 14.5 8, 13.7 10, 14 11.8
                 C 14.2 10.5, 14.7 9.7, 15.3 9.3
                 C 15.5 10, 15.7 10.5, 16 10.8
                 C 16.3 10.5, 16.5 10, 16.7 9.3
                 C 17.3 9.7, 17.8 10.5, 18 11.8
                 C 18.3 10, 17.5 8, 16 6.5 Z"
              fill={`url(#${id('flame')})`} />
          </>
        ) : symbol === 'service' ? (
          <>
            <path
              d="M32 4 L54 9 Q56 9 56 11 L56 34
                 C56 50, 46 60, 32 68
                 C18 60, 8 50, 8 34 L8 11 Q8 9 10 9 Z"
              fill={`url(#${id('bg')})`} />
            <path
              d="M32 4 L54 9 Q56 9 56 11 L56 30
                 C50 26, 40 24, 32 24 C24 24, 14 26, 8 30
                 L8 11 Q8 9 10 9 Z"
              fill={`url(#${id('spec')})`} opacity="0.6" />
            <path
              d="M32 9 L51 13 Q52 13 52 14 L52 33
                 C52 47, 44 56, 32 63
                 C20 56, 12 47, 12 33 L12 14 Q12 13 13 13 Z"
              fill="none" stroke={`url(#${id('gold')})`} strokeWidth="0.8" opacity="0.85" />

            {/* Chalice (to hơn, đặt giữa khiên) */}
            <path d="M 22 24 Q 22 39, 32 39 Q 42 39, 42 24 Z"
                  fill={`url(#${id('gold')})`} opacity="0.95" />
            <path d="M 22 24 Q 32 20.5, 42 24" stroke="#FFF6CC" strokeWidth="0.7" fill="none" opacity="0.75" />
            <path d="M 26 25 Q 26 33, 28 38" stroke="#A8810A" strokeWidth="0.4" fill="none" opacity="0.65" />
            <path d="M 32 26 L 32 38"          stroke="#A8810A" strokeWidth="0.4" fill="none" opacity="0.5" />
            <path d="M 38 25 Q 38 33, 36 38" stroke="#A8810A" strokeWidth="0.4" fill="none" opacity="0.65" />
            <rect x="30" y="39" width="4" height="6" fill={`url(#${id('gold')})`} />
            <ellipse cx="32" cy="46" rx="7" ry="2" fill={`url(#${id('gold')})`} />
            <ellipse cx="32" cy="45.4" rx="5" ry="0.6" fill="#FFF6CC" opacity="0.6" />

            <text x="32" y="56" textAnchor="middle" fontFamily="serif" fontSize="5"
                  fill={`url(#${id('gold')})`} opacity="0.7">✦</text>
          </>
        ) : (
          <>
            <path
              d="M32 4 L54 9 Q56 9 56 11 L56 34
                 C56 50, 46 60, 32 68
                 C18 60, 8 50, 8 34 L8 11 Q8 9 10 9 Z"
              fill={`url(#${id('bg')})`} />
            <path
              d="M32 4 L54 9 Q56 9 56 11 L56 30
                 C50 26, 40 24, 32 24 C24 24, 14 26, 8 30
                 L8 11 Q8 9 10 9 Z"
              fill={`url(#${id('spec')})`} opacity="0.6" />
            <path
              d="M32 9 L51 13 Q52 13 52 14 L52 33
                 C52 47, 44 56, 32 63
                 C20 56, 12 47, 12 33 L12 14 Q12 13 13 13 Z"
              fill="none" stroke={`url(#${id('gold')})`} strokeWidth="0.8" opacity="0.85" />
            <text x="32" y="48" textAnchor="middle"
                  fontFamily="Playfair Display, EB Garamond, Georgia, serif"
                  fontWeight="700" fontSize="22" letterSpacing="-0.5"
                  fill={`url(#${id('gold')})`}>HT</text>
            <text x="32" y="58" textAnchor="middle"
                  fontFamily="serif" fontSize="6"
                  fill={`url(#${id('gold')})`} opacity="0.85">✦</text>
          </>
        )}
      </g>

      {/* Biểu tượng đỉnh – chỉ render ở bản đầy đủ (không compact, không service) */}
      {!compact && symbol === 'flame' && (
        <g className={animated ? `ht-flame-${uid}` : ''}>
          <path
            d="M32 11 C29.5 13, 28 15.5, 28.5 18.2
               C28.7 19.5, 29.4 20.5, 30 21
               C29.6 19.5, 29.8 18, 30.7 17.2
               C30.9 18.4, 31.4 19.1, 32 19.6
               C32.6 19.1, 33.1 18.4, 33.3 17.2
               C34.2 18, 34.4 19.5, 34 21
               C34.6 20.5, 35.3 19.5, 35.5 18.2
               C36 15.5, 34.5 13, 32 11 Z"
            fill={`url(#${id('flame')})`} />
          <ellipse cx="32" cy="17.5" rx="0.9" ry="2.2" fill="#FFF8E0" opacity="0.9" />
        </g>
      )}
      {!compact && symbol === 'service' && (
        <g transform={isWide ? 'translate(8 0)' : ''} className={animated ? `ht-flame-${uid}` : ''}>
          <path
            d="M 32 6
               C 28 9, 25.5 13, 26 17.5
               C 26.3 19, 27 20.5, 28 21.5
               C 27.4 19, 28 17, 29.5 16
               C 29.8 17.5, 30.8 18.5, 32 19.2
               C 33.2 18.5, 34.2 17.5, 34.5 16
               C 36 17, 36.6 19, 36 21.5
               C 37 20.5, 37.7 19, 38 17.5
               C 38.5 13, 36 9, 32 6 Z"
            fill={`url(#${id('flame')})`} />
          <ellipse cx="32" cy="14" rx="1.1" ry="3" fill="#FFF8E0" opacity="0.9" />
        </g>
      )}
      {!compact && symbol === 'cross' && (
        <g transform={isWings ? 'translate(8 0)' : ''}>
          <rect x="30.6" y="11" width="2.8" height="11" rx="0.4" fill={`url(#${id('gold')})`} />
          <rect x="27.5" y="14.5" width="9" height="2.8" rx="0.4" fill={`url(#${id('gold')})`} />
          <circle cx="32" cy="16" r="6" fill="none" stroke={`url(#${id('gold')})`} strokeWidth="0.4" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}
