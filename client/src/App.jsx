import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import PostForm from './pages/PostForm';
import Files from './pages/Files';
import Categories from './pages/Categories';
import Menus from './pages/Menus';
import Boards from './pages/Boards';
import Pages from './pages/Pages';
import PageEditor from './pages/PageEditor';
import EnergyData from './pages/EnergyData';
import SolarData from './pages/SolarData';
import HeroSlides from './pages/HeroSlides';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import PageView from './pages/PageView';
import BoardView from './pages/BoardView';
import Home from './pages/public/Home';
import GreenhouseGas from './pages/public/GreenhouseGas';
import Energy from './pages/public/Energy';
import SolarPower from './pages/public/SolarPower';
import Infographic from './pages/public/Infographic';
import InfographicDetail from './pages/public/InfographicDetail';
import axios from 'axios';

// Vite 프록시를 사용하므로 baseURL 설정 불필요
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 요청 인터셉터 - 디버깅용
axios.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 401 에러 처리를 위한 응답 인터셉터
axios.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // 로그인 페이지가 아닌 경우에만 처리
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        window.location.href = '/admin/login';
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 로컬 스토리지 확인 먼저
      const storedAuth = localStorage.getItem('isAuthenticated');
      
      if (storedAuth === 'true') {
        // 로컬 스토리지에 인증 정보가 있으면 서버에 확인
        try {
          const response = await axios.get('/api/auth/check');
          if (response.data.authenticated) {
            setIsAuthenticated(true);
            localStorage.setItem('username', response.data.username);
          } else {
            // 서버 세션이 만료된 경우
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
          }
        } catch (error) {
          // 네트워크 에러 등의 경우 로컬 상태 유지
          console.error('Auth check error:', error);
          // 401 에러가 아닌 경우에만 로컬 상태 유지
          if (error.response?.status === 401) {
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // 페이지 포커스 시 재확인
    const handleFocus = () => {
      if (localStorage.getItem('isAuthenticated') === 'true') {
        checkAuth();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/greenhouse-gas" element={<GreenhouseGas />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/solar-power" element={<SolarPower />} />
          <Route path="/infographic" element={<Infographic />} />
          <Route path="/infographic/:id" element={<InfographicDetail />} />
          <Route path="/board/:slug" element={<BoardView />} />
          <Route path="/admin/login" element={
            !isAuthenticated ? 
            <Login setIsAuthenticated={(value) => {
              setIsAuthenticated(value);
              if (value) {
                localStorage.setItem('isAuthenticated', 'true');
              }
            }} /> : 
            <Navigate to="/admin/dashboard" />
          } />
          
          {/* CMS Public routes */}
          <Route path="/cms" element={<PublicLayout />}>
            <Route index element={<Navigate to="/cms/page/about" />} />
            <Route path="page/:slug" element={<PageView />} />
            <Route path="board/:slug" element={<BoardView />} />
          </Route>
          
          {/* Admin routes */}
          {isAuthenticated ? (
            <Route path="/admin" element={<Layout handleLogout={handleLogout} />}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="posts" element={<Posts />} />
              <Route path="posts/new" element={<PostForm />} />
              <Route path="posts/edit/:id" element={<PostForm />} />
              <Route path="files" element={<Files />} />
              <Route path="categories" element={<Categories />} />
              <Route path="menus" element={<Menus />} />
              <Route path="boards" element={<Boards />} />
              <Route path="pages" element={<Pages />} />
              <Route path="pages/new" element={<PageEditor />} />
              <Route path="pages/edit/:id" element={<PageEditor />} />
              <Route path="energy-data" element={<EnergyData />} />
              <Route path="solar-data" element={<SolarData />} />
              <Route path="hero-slides" element={<HeroSlides />} />
            </Route>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
          )}
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App
