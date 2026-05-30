import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ToastProvider } from './components/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30_000,
    },
  },
});
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteGuard from './components/RouteGuard';
import UrgentBanner from './components/UrgentBanner';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';
import PushNotificationManager from './components/PushNotificationManager';
import ChatWidget from './components/ChatWidget';
import PageTransition from './components/PageTransition';
import RealtimeToasts from './components/RealtimeToasts';

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
const QrScanPage = lazy(() => import('./pages/QrScanPage'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const Events = lazy(() => import('./pages/Events'));
import HtChatWidget from './pages/HtChat';

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
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminParentLink = lazy(() => import('./pages/admin/AdminParentLink'));
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'));
const AdminQuiz = lazy(() => import('./pages/admin/AdminQuiz'));
const QuizPage = lazy(() => import('./pages/Quiz'));
const QuizTake = lazy(() => import('./pages/QuizTake'));
const QuizMonitor = lazy(() => import('./pages/QuizMonitor'));
const QuizGrade = lazy(() => import('./pages/QuizGrade'));
const QuizLeaderboard = lazy(() => import('./pages/QuizLeaderboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ConditionalFooter = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <Footer />;
};

// Bù offset cho Navbar fixed (h-16 = 64px).
// Home được miễn vì Hero full-bleed đã overlay lên Navbar transparent.
// Admin tự quản lý layout riêng nên cũng miễn.
const NavbarOffset = () => {
  const { pathname } = useLocation();
  const exempt = pathname === '/' || pathname.startsWith('/admin');
  if (exempt) return null;
  return <div style={{ height: 64 }} aria-hidden="true" />;
};

const withErrorBoundary = (children, boundaryName, props = {}) => (
  <ErrorBoundary boundaryName={boundaryName} {...props}>
    {children}
  </ErrorBoundary>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location}>
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
            <Route path="/su-kien" element={withErrorBoundary(<Events />, 'Events')} />
            <Route path="/diem-danh-qr" element={withErrorBoundary(<QrScanPage />, 'QrScanPage')} />
            <Route
              path="/hoc-sinh/:lopId/:id"
              element={withErrorBoundary(<RouteGuard><StudentProfile /></RouteGuard>, 'StudentProfile')}
            />

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
              <Route path="su-kien" element={withErrorBoundary(<AdminEvents />, 'AdminEvents')} />
              <Route path="phu-huynh" element={withErrorBoundary(<AdminParentLink />, 'AdminParentLink')} />
              <Route path="phan-cong" element={withErrorBoundary(<AdminAssignments />, 'AdminAssignments')} />
              <Route path="quiz" element={withErrorBoundary(<AdminQuiz />, 'AdminQuiz')} />
            </Route>

            <Route path="/quiz" element={withErrorBoundary(<RouteGuard><QuizPage /></RouteGuard>, 'QuizPage')} />
            <Route path="/quiz/:id/take" element={withErrorBoundary(<RouteGuard><QuizTake /></RouteGuard>, 'QuizTake')} />
            <Route path="/quiz/:id/monitor" element={withErrorBoundary(<RouteGuard><QuizMonitor /></RouteGuard>, 'QuizMonitor')} />
            <Route path="/quiz/:id/grade" element={withErrorBoundary(<RouteGuard><QuizGrade /></RouteGuard>, 'QuizGrade')} />
            <Route path="/quiz/:id/leaderboard" element={withErrorBoundary(<RouteGuard><QuizLeaderboard /></RouteGuard>, 'QuizLeaderboard')} />
            <Route path="/quiz/manage" element={withErrorBoundary(<RouteGuard roles={['admin','giaoly']}><AdminQuiz /></RouteGuard>, 'QuizManage')} />
            <Route path="*" element={withErrorBoundary(<NotFound />, 'NotFound')} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <HelmetProvider>
          <BrowserRouter>
            <PushNotificationManager />
            <RealtimeToasts />
            <ChatWidget />
            <HtChatWidget />
            <Navbar />
            <NavbarOffset />
            <UrgentBanner />
            <AnimatedRoutes />
            <ConditionalFooter />
          </BrowserRouter>
        </HelmetProvider>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
