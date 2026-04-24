import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <div className="nav-brand">
        <Link to="/">Xứ Đoàn AnRê Phú Yên - Mẫu Tâm</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Trang chủ</Link></li>
        <li><Link to="/gio-le">Giờ lễ</Link></li>
        <li><Link to="/tin-tuc">Tin tức</Link></li>
        {user && <li><Link to="/lop-hoc">Lớp học</Link></li>}
      </ul>
      <div className="nav-auth">
        {user ? (
          <>
            <span>{user.hoTen}</span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/login">Đăng nhập</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
