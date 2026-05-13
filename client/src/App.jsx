import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteGuard from './components/RouteGuard';
import UrgentBanner from './components/UrgentBanner';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PushNotificationManager from './components/PushNotificationManager';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const GioLe = lazy(() => import('./pages/GioLe'));
const LoiChua = lazy(() => import('./pages/LoiChua'));
const ClassList = lazy(() => import('./pages/ClassList'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const Gallery = lazy(() => import('./pages/Gallery'));
const LichSuCuuDo = lazy(() => import('./pages/LichSuCuuDo'));
const NhanVat = lazy(() => import('./pages/NhanVat'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses'));
const AdminExport = lazy(() => import('./pages/admin/AdminExport'));
const AdminNamHoc = lazy(() => import('./pages/admin/AdminNamHoc'));
const AdminPromotion = lazy(() => import('./pages/admin/AdminPromotion'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminRBAC = lazy(() => import('./pages/admin/AdminRBAC'));
const AdminBackup = lazy(() => import('./pages/admin/AdminBackup'));

const ConditionalFooter = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <Footer />;
};

const withErrorBoundary = (children, boundaryName, props = {}) => (
  <ErrorBoundary boundaryName={boundaryName} {...props}>
    {children}
  </ErrorBoundary>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <HelmetProvider>
          <BrowserRouter>
            <PushNotificationManager />
            <Navbar />
            <UrgentBanner />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={withErrorBoundary(<Home />, 'Home')} />
                <Route path="/login" element={withErrorBoundary(<Login />, 'Login')} />
                <Route path="/dang-ky" element={withErrorBoundary(<Signup />, 'Signup')} />
                <Route path="/forgot-password" element={withErrorBoundary(<ForgotPassword />, 'ForgotPassword')} />
                <Route path="/gio-le" element={withErrorBoundary(<GioLe />, 'GioLe')} />
                <Route path="/loi-chua" element={withErrorBoundary(<LoiChua />, 'LoiChua')} />
                <Route path="/tin-tuc" element={withErrorBoundary(<News />, 'News')} />
                <Route path="/tin-tuc/:id" element={withErrorBoundary(<NewsDetail />, 'NewsDetail')} />
                <Route path="/thu-vien" element={withErrorBoundary(<Gallery />, 'Gallery')} />
                <Route
                  path="/lich-su-cuu-do"
                  element={withErrorBoundary(<LichSuCuuDo />, 'LichSuCuuDo', {
                    title: 'Khong tai duoc trang Lich su Cuu do',
                    description: 'Trang nay co nhieu noi dung tuong tac. Mot phan dang gap loi, vui long thu lai sau.',
                  })}
                />
                <Route path="/nhan-vat" element={withErrorBoundary(<NhanVat />, 'NhanVat')} />

                <Route
                  path="/ho-so"
                  element={withErrorBoundary(<RouteGuard><Profile /></RouteGuard>, 'Profile')}
                />
                <Route
                  path="/phu-huynh"
                  element={withErrorBoundary(<RouteGuard roles={['PARENT']}><ParentDashboard /></RouteGuard>, 'ParentDashboard')}
                />
                <Route
                  path="/lop-hoc"
                  element={withErrorBoundary(<RouteGuard><ClassList /></RouteGuard>, 'ClassList')}
                />
                <Route
                  path="/lop-hoc/:id"
                  element={withErrorBoundary(<RouteGuard><ClassDetail /></RouteGuard>, 'ClassDetail')}
                />

                <Route
                  path="/admin"
                  element={withErrorBoundary(<RouteGuard roles={['admin']}><AdminLayout /></RouteGuard>, 'AdminLayout')}
                >
                  <Route index element={withErrorBoundary(<AdminDashboard />, 'AdminDashboard')} />
                  <Route path="bai-viet" element={withErrorBoundary(<AdminPosts />, 'AdminPosts')} />
                  <Route path="nguoi-dung" element={withErrorBoundary(<AdminUsers />, 'AdminUsers')} />
                  <Route path="lop-hoc" element={withErrorBoundary(<AdminClasses />, 'AdminClasses')} />
                  <Route path="nam-hoc" element={withErrorBoundary(<AdminNamHoc />, 'AdminNamHoc')} />
                  <Route path="nien-hoc" element={withErrorBoundary(<AdminPromotion />, 'AdminPromotion')} />
                  <Route path="thong-ke" element={withErrorBoundary(<AdminStats />, 'AdminStats')} />
                  <Route path="export" element={withErrorBoundary(<AdminExport />, 'AdminExport')} />
                  <Route path="lich-su" element={withErrorBoundary(<AdminAuditLog />, 'AdminAuditLog')} />
                  <Route path="phan-quyen" element={withErrorBoundary(<AdminRBAC />, 'AdminRBAC')} />
                  <Route path="sao-luu" element={withErrorBoundary(<AdminBackup />, 'AdminBackup')} />
                </Route>
              </Routes>
            </Suspense>
            <ConditionalFooter />
          </BrowserRouter>
        </HelmetProvider>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
