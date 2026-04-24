import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
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
import Liturgy        from './pages/Liturgy';
import ClassList      from './pages/ClassList';
import ClassDetail    from './pages/ClassDetail';

import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts     from './pages/admin/AdminPosts';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminClasses   from './pages/admin/AdminClasses';
import AdminExport    from './pages/admin/AdminExport';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <UrgentBanner />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/dang-ky"         element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gio-le"          element={<Liturgy />} />
        <Route path="/tin-tuc"         element={<News />} />
        <Route path="/tin-tuc/:id"     element={<NewsDetail />} />

        {/* Yêu cầu đăng nhập */}
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
          <Route index        element={<AdminDashboard />} />
          <Route path="bai-viet"    element={<AdminPosts />} />
          <Route path="nguoi-dung"  element={<AdminUsers />} />
          <Route path="lop-hoc"     element={<AdminClasses />} />
          <Route path="export"      element={<AdminExport />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
