// HuynhTruongLogo.jsx
// Logo "Huynh Trưởng" – khiên thiêng + biểu tượng (lửa / cánh / thánh giá).
//
// Sử dụng:
//   <HuynhTruongLogo symbol="flame" size={64} animated />
//   <HuynhTruongLogo size={24} compact />   // → bản rút gọn, không có biểu tượng đỉnh
//
// Props:
//   symbol   → 'flame' (mặc định) | 'wings' | 'cross'
//   size     → chiều rộng pixel (mặc định 64)
//   animated → bật animation lửa-rung / cánh-bay / glow (mặc định true)
//   compact  → chỉ render khiên + chữ HT, không có biểu tượng đỉnh
//              (dùng cho favicon, sidebar 24-40px)
//   className, title → chuyển tiếp xuống <svg>
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
  // useId() đảm bảo gradient không trùng khi render nhiều logo trên cùng trang.
  const uid = useId().replace(/:/g, '');
  const id = (k) => `ht-${k}-${uid}`;

  // Bản compact: viewBox vuông hơn, không có vùng cho biểu tượng đỉnh
  const isWings = !compact && symbol === 'wings';
  const vb = compact ? '0 0 32 36' : isWings ? '0 0 80 72' : '0 0 64 72';
  const ratio = compact ? 36/32 : isWings ? 72/80 : 72/64;
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

      {/* Style nội bộ – animation chỉ chạy khi `animated` = true */}
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
          .ht-flame-${uid} {
            animation: ht-flicker-${uid} 1.8s ease-in-out infinite;
            transform-origin: 32px 18px;
            filter: drop-shadow(0 0 4px #FFE066) drop-shadow(0 0 8px #F97316);
          }
          .ht-wings-${uid} {
            animation: ht-wings-${uid} 2.4s ease-in-out infinite;
            transform-origin: 40px 18px;
          }
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

      {/* Shield body */}
      <g transform={isWings ? 'translate(8 0)' : 'translate(0 0)'}>
        {compact ? (
          <>
            <path
              d="M16 2 L27 4.5 Q28 4.5 28 5.5 L28 17
                 C28 25, 23 30, 16 34
                 C9 30, 4 25, 4 17 L4 5.5 Q4 4.5 5 4.5 Z"
              fill={`url(#${id('bg')})`}
              stroke={`url(#${id('gold')})`} strokeWidth="0.6" />
            <text x="16" y="22" textAnchor="middle"
                  fontFamily="Playfair Display, EB Garamond, Georgia, serif"
                  fontWeight="700" fontSize="13"
                  fill={`url(#${id('gold')})`}>HT</text>
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

      {/* Biểu tượng đỉnh – chỉ render ở bản đầy đủ (không compact) */}
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
