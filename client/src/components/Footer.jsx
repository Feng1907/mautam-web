const Footer = () => (
  <footer className="bg-red-800 text-white/80 text-center text-sm py-6 mt-auto">
    <p className="font-semibold text-white">Xứ Đoàn Thiếu Nhi Thánh Thể Anrê Phú Yên – Mẫu Tâm</p>
    <p className="mt-1 italic text-xs opacity-75">
      "Lấy tình yêu đáp lại tình yêu, lấy mạng sống đáp lại mạng sống."
    </p>
    <p className="mt-2 text-xs opacity-50">&copy; {new Date().getFullYear()}</p>
  </footer>
);

export default Footer;
