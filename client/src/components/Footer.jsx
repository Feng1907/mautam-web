const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/anrephuyengxmautam',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.tiktok.com/@tnttgxmautam_2607',
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@tnttmautam',
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

const Footer = () => (
  <footer className="relative bg-red-800 text-white/80 text-center text-sm pt-10 pb-6 mt-auto overflow-hidden">

    {/* Wave SVG phía trên footer */}
    <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none" style={{ marginTop: -1 }}>
      <svg
        viewBox="0 0 1440 56"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 56, display: 'block' }}
      >
        <defs>
          <style>{`
            @keyframes footer-wave-1 {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes footer-wave-2 {
              0%   { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .fw1 { animation: footer-wave-1 9s linear infinite; }
            .fw2 { animation: footer-wave-2 13s linear infinite; }
          `}</style>
        </defs>
        <g className="fw1">
          <path d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 C1680,56 1920,0 2160,28 C2400,56 2640,0 2880,28 L2880,0 L0,0 Z" fill="#fdfbf7" />
        </g>
        <g className="fw2" style={{ opacity: 0.35 }}>
          <path d="M0,18 C200,40 400,4 600,22 C800,40 1000,4 1200,22 C1400,40 1600,4 1800,22 C2000,40 2200,4 2400,22 L2400,0 L0,0 Z" fill="#fdfbf7" />
        </g>
      </svg>
    </div>

    {/* Nội dung footer */}
    <p className="relative font-semibold text-white">
      Xứ Đoàn Thiếu Nhi Thánh Thể Anrê Phú Yên – Mẫu Tâm
    </p>
    <p className="relative mt-1 italic text-xs opacity-75">
      "Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."
    </p>

    {/* Social links */}
    <div className="relative mt-4 flex items-center justify-center gap-3">
      {SOCIAL_LINKS.map(({ href, label, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.12)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          {icon}
        </a>
      ))}
    </div>

    <p className="relative mt-4 text-xs opacity-50">&copy; {new Date().getFullYear()}</p>
  </footer>
);

export default Footer;
