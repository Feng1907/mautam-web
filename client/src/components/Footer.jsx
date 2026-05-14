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

        {/* Lớp sóng 1 — màu trang nền (kem) */}
        <g className="fw1">
          <path
            d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 C1680,56 1920,0 2160,28 C2400,56 2640,0 2880,28 L2880,0 L0,0 Z"
            fill="#fdfbf7"
          />
        </g>

        {/* Lớp sóng 2 — mờ hơn, chạy ngược */}
        <g className="fw2" style={{ opacity: 0.35 }}>
          <path
            d="M0,18 C200,40 400,4 600,22 C800,40 1000,4 1200,22 C1400,40 1600,4 1800,22 C2000,40 2200,4 2400,22 L2400,0 L0,0 Z"
            fill="#fdfbf7"
          />
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
    <p className="relative mt-2 text-xs opacity-50">&copy; {new Date().getFullYear()}</p>
  </footer>
);

export default Footer;
