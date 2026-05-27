// HuynhTruongRoom.jsx
// Phòng "Huynh Trưởng" cho sidebar chat – featured card với gradient gold-maroon,
// viền vàng và conic-shine animation khi hover.
//
// Sử dụng:
//   <HuynhTruongRoom
//     active={currentRoom === 'ht'}
//     onClick={() => navigate('/chat/huynh-truong')}
//     online={8}
//     members={23}
//     unread={12}
//     density="detailed"   // 'detailed' | 'compact'
//     theme="dark"         // 'dark' | 'light'
//   />

import HuynhTruongLogo from './HuynhTruongLogo';

export default function HuynhTruongRoom({
  active = false,
  onClick,
  online = 0,
  members = 0,
  unread = 0,
  density = 'detailed',  // 'detailed' | 'compact'
  theme = 'dark',
  className = '',
  _name = null,  // override tên hiển thị (vd: tên lớp)
}) {
  const dark = theme === 'dark';
  const t = dark ? darkTokens : lightTokens;

  return (
    <button
      onClick={onClick}
      className={`ht-room ${className}`}
      style={{
        position: 'relative', width: '100%', textAlign: 'left',
        borderRadius: 12, transition: 'all 300ms ease',
        cursor: 'pointer',
        background: active ? t.bgActive : t.bgIdle,
        border: `1px solid ${active ? t.borderActive : t.borderIdle}`,
        boxShadow: active ? t.shadowActive : t.shadowIdle,
        padding: 0,
      }}
    >
      {/* Conic gold shine – hiện khi hover */}
      <span aria-hidden style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        opacity: 0, transition: 'opacity 500ms ease',
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(212,175,55,0.18) 18%, transparent 36%)',
        mixBlendMode: 'screen', pointerEvents: 'none',
      }} className="ht-shine" />

      {/* Gold accent bar bên trái */}
      <span style={{
        position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: '0 4px 4px 0', background: '#D4AF37',
      }} />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 12px 12px 16px',
      }}>
        <div style={{ flexShrink: 0 }}>
          <HuynhTruongLogo compact size={38} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: '"Playfair Display", "EB Garamond", Georgia, serif',
              fontWeight: 700, fontSize: 15, lineHeight: 1.1,
              color: t.fg,
            }}>{_name || 'Huynh Trưởng'}</span>
            <span style={{
              fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.18em', color: t.adminBadge,
            }}>✦ ADMIN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {online > 0 && (
              <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#34D399', opacity: 0.6,
                  animation: 'ht-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
                }} />
                <span style={{
                  position: 'relative', width: 6, height: 6, borderRadius: '50%', background: '#34D399',
                }} />
              </span>
            )}
            <span style={{ fontSize: 11, color: t.subtle, lineHeight: 1.2 }}>
              {density === 'compact'
                ? `${online} online`
                : `${online} đang trực tuyến · ${members} thành viên`}
            </span>
          </div>
        </div>
        {unread > 0 && (
          <span style={{
            flexShrink: 0, minWidth: 22, height: 22, padding: '0 6px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 9999, fontSize: 10, fontWeight: 900,
            background: 'linear-gradient(180deg, #F8D444, #C8960A)',
            color: '#3D0808',
            boxShadow: '0 0 14px rgba(248,212,68,0.45), inset 0 1px 0 rgba(255,255,255,0.45)',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </div>

      <style>{`
        @keyframes ht-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .ht-room:hover .ht-shine { opacity: 0.6; }
      `}</style>
    </button>
  );
}

const darkTokens = {
  fg:            '#FFFFFF',
  subtle:        'rgba(255,255,255,0.55)',
  bgActive:      'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(139,0,0,0.35))',
  bgIdle:        'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(139,0,0,0.18))',
  borderActive:  'rgba(212,175,55,0.55)',
  borderIdle:    'rgba(212,175,55,0.30)',
  shadowActive:  '0 6px 24px rgba(212,175,55,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
  shadowIdle:    '0 2px 10px rgba(0,0,0,0.18)',
  adminBadge:    'rgba(248,212,68,0.95)',
};
const lightTokens = {
  fg:            '#3D1515',
  subtle:        '#6B7280',
  bgActive:      'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(139,0,0,0.10))',
  bgIdle:        'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(139,0,0,0.04))',
  borderActive:  'rgba(212,175,55,0.85)',
  borderIdle:    'rgba(212,175,55,0.50)',
  shadowActive:  '0 6px 24px rgba(212,175,55,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
  shadowIdle:    '0 2px 10px rgba(139,0,0,0.06)',
  adminBadge:    '#A8810A',
};
