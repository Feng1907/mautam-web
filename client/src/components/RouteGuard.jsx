import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// roles: mảng vai trò được phép, VD ['admin'] hoặc ['admin','giaoly']
const RouteGuard = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.vaiTro))
    return <Navigate to="/" replace />;

  return children;
};

export default RouteGuard;
