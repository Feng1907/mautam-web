import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import PageSkeleton from './PageSkeleton';

// roles: mảng vai trò được phép, VD ['admin'] hoặc ['admin','giaoly']
const RouteGuard = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;

  if (!user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.vaiTro))
    return <Navigate to="/" replace />;

  return children;
};

export default RouteGuard;
