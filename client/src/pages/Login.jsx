import { useState } from 'react';
import axios from 'axios';
import { BeakerIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTempLogin, setShowTempLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', credentials);

      if (response.data.success) {
        // 로컬 스토리지에 로그인 정보 저장
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', response.data.username);
        
        setIsAuthenticated(true);
        
        // 로그인 성공 시 대시보드로 이동
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTempLogin = () => {
    setCredentials({
      username: 'admin',
      password: 'admin123'
    });
    setShowTempLogin(true);
    setTimeout(() => setShowTempLogin(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                <BeakerIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              서울대학교 탄소중립포털
            </h2>
            <p className="text-lg text-blue-200">
              Content Management System
            </p>
          </div>
        
          {error && (
            <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4 mb-6">
              <h3 className="text-sm font-medium text-red-200">{error}</h3>
            </div>
          )}

          {showTempLogin && (
            <div className="rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-400/30 p-4 mb-6">
              <h3 className="text-sm font-medium text-green-200">임시 관리자 계정 정보가 입력되었습니다!</h3>
            </div>
          )}
        
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="username" className="sr-only">
                  사용자명
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="사용자명"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="비밀번호"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : '로그인'}
              </button>

              <button
                type="button"
                onClick={handleTempLogin}
                className="relative w-full flex justify-center py-3 px-4 border border-white/20 text-base font-medium rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transform transition-all duration-200 hover:scale-105"
              >
                임시 관리자로 로그인
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-blue-200">
          © 2024 Seoul National University Carbon Neutral Portal
        </p>
      </div>
    </div>
  );
}