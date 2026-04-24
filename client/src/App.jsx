import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteGuard from './components/RouteGuard';

import Home          from './pages/Home';
import Login         from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import News          from './pages/News';
import NewsDetail    from './pages/NewsDetail';
import Liturgy       from './pages/Liturgy';
import ClassList     from './pages/ClassList';
import ClassDetail   from './pages/ClassDetail';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/gio-le"         element={<Liturgy />} />
        <Route path="/tin-tuc"        element={<News />} />
        <Route path="/tin-tuc/:id"    element={<NewsDetail />} />

        {/* Yêu cầu đăng nhập */}
        <Route path="/lop-hoc" element={
          <RouteGuard><ClassList /></RouteGuard>
        } />
        <Route path="/lop-hoc/:id" element={
          <RouteGuard><ClassDetail /></RouteGuard>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
