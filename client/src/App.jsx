import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import RouteGuard    from './components/RouteGuard';
import UrgentBanner  from './components/UrgentBanner';

import Home           from './pages/Home';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import News           from './pages/News';
import NewsDetail     from './pages/NewsDetail';
import GioLe          from './pages/GioLe';
import LoiChua        from './pages/LoiChua';
import ClassList      from './pages/ClassList';
import ClassDetail    from './pages/ClassDetail';
import Profile        from './pages/Profile';
import Gallery        from './pages/Gallery';
import LichSuCuuDo   from './pages/LichSuCuuDo';
import NhanVat        from './pages/NhanVat';

import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts     from './pages/admin/AdminPosts';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminClasses   from './pages/admin/AdminClasses';
import AdminExport    from './pages/admin/AdminExport';
import AdminNamHoc    from './pages/admin/AdminNamHoc';
import AdminPromotion from './pages/admin/AdminPromotion';
import AdminStats     from './pages/admin/AdminStats';
import AdminAuditLog  from './pages/admin/AdminAuditLog';
import AdminRBAC      from './pages/admin/AdminRBAC';
import AdminBackup    from './pages/admin/AdminBackup';

// Footer ẩn trong khu vực /admin
const ConditionalFooter = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <Footer />;
};

const App = () => (
  <ThemeProvider>
  <AuthProvider>
  <ToastProvider>
    <BrowserRouter>
      <Navbar />
      <UrgentBanner />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/dang-ky"         element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gio-le"          element={<GioLe />} />
        <Route path="/loi-chua"        element={<LoiChua />} />
        <Route path="/tin-tuc"         element={<News />} />
        <Route path="/tin-tuc/:id"     element={<NewsDetail />} />
        <Route path="/thu-vien"        element={<Gallery />} />
        <Route path="/lich-su-cuu-do"  element={<LichSuCuuDo />} />
        <Route path="/nhan-vat"        element={<NhanVat />} />

        {/* Yêu cầu đăng nhập */}
        <Route path="/ho-so" element={
          <RouteGuard><Profile /></RouteGuard>
        } />
        <Route path="/lop-hoc" element={
          <RouteGuard><ClassList /></RouteGuard>
        } />
        <Route path="/lop-hoc/:id" element={
          <RouteGuard><ClassDetail /></RouteGuard>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <RouteGuard roles={['admin']}><AdminLayout /></RouteGuard>
        }>
          <Route index               element={<AdminDashboard />} />
          <Route path="bai-viet"     element={<AdminPosts />} />
          <Route path="nguoi-dung"   element={<AdminUsers />} />
          <Route path="lop-hoc"      element={<AdminClasses />} />
          <Route path="nam-hoc"      element={<AdminNamHoc />} />
          <Route path="nien-hoc"     element={<AdminPromotion />} />
          <Route path="thong-ke"     element={<AdminStats />} />
          <Route path="export"       element={<AdminExport />} />
          <Route path="lich-su"      element={<AdminAuditLog />} />
          <Route path="phan-quyen"   element={<AdminRBAC />} />
          <Route path="sao-luu"      element={<AdminBackup />} />
        </Route>
      </Routes>
      <ConditionalFooter />
    </BrowserRouter>
  </ToastProvider>
  </AuthProvider>
  </ThemeProvider>
);

export default App;
