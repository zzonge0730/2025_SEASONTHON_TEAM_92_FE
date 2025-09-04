import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import TenantForm from './pages/TenantForm';
import GroupsPage from './pages/GroupsPage';
import NotificationsPage from './pages/NotificationsPage';
import AuthForm from './components/AuthForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LandlordDashboard from './components/LandlordDashboard';
import AnonymousReport from './components/AnonymousReport';
import NegotiationGuide from './components/NegotiationGuide';
import TenantVoting from './components/TenantVoting';
import NotificationBell from './components/NotificationBell';
import HowItWorks from './components/HowItWorks'; // 추가
import { User } from './types';
import { hasPermission, getRoleDisplayName } from './utils/rolePermissions';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // Check if user is logged in (stored in localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdminLogin(false);
    localStorage.removeItem('currentUser');
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminAuthSuccess = (admin: User) => {
    setCurrentUser(admin);
    setShowAdminLogin(false);
    localStorage.setItem('currentUser', JSON.stringify(admin));
  };

  const handleBackToMain = () => {
    setShowAdminLogin(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (showAdminLogin) {
      return (
        <div className="min-h-screen bg-gray-50">
          <AdminLogin 
            onAdminLogin={handleAdminAuthSuccess} 
            onBack={handleBackToMain}
          />
          <Toaster position="top-right" />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <HowItWorks /> 
        <div className="py-8">
          <AuthForm 
            onAuthSuccess={handleAuthSuccess} 
            onAdminLogin={handleAdminLogin}
          />
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // 관리자 대시보드
  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminDashboard 
          admin={currentUser} 
          onLogout={handleLogout}
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  // 집주인 대시보드
  if (currentUser.role === 'landlord' && currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LandlordDashboard 
          currentUser={currentUser} 
          onLogout={handleLogout}
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900">
                  <span className="hidden sm:inline">월세 공동 협상 네트워크</span>
                  <span className="sm:hidden">월세 협상</span>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  안녕하세요, {currentUser.nickname}님 ({getRoleDisplayName(currentUser.role as any)})
                </span>
                
                {/* 알림 벨 */}
                <NotificationBell currentUser={currentUser} />
                
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  대시보드
                </Link>
                
                {hasPermission(currentUser.role as any, 'canSubmitRentInfo') && (
                  <Link
                    to="/tenant-form"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    정보 입력
                  </Link>
                )}
                
                {hasPermission(currentUser.role as any, 'canViewGroups') && (
                  <Link
                    to="/groups"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    그룹 보기
                  </Link>
                )}
                
                <Link
                  to="/reports"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  익명 신고
                </Link>
                
                <Link
                  to="/notifications"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  알림
                </Link>
                
                {hasPermission(currentUser.role as any, 'canViewNegotiationGuide') && (
                  <Link
                    to="/guide"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    협상 가이드
                  </Link>
                )}
                
                {hasPermission(currentUser.role as any, 'canVote') && (
                  <Link
                    to="/voting"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    투표 참여
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그아웃
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="lg:hidden flex items-center space-x-2">
                <span className="text-xs text-gray-600 truncate max-w-20">
                  {currentUser.nickname}님
                </span>
                
                {/* 모바일 알림 벨 */}
                <NotificationBell currentUser={currentUser} />
                
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm"
                >
                  로그아웃
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Bar */}
            <div className="lg:hidden border-t border-gray-200 py-2">
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                >
                  대시보드
                </Link>
                
                {hasPermission(currentUser.role as any, 'canSubmitRentInfo') && (
                  <Link
                    to="/tenant-form"
                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                  >
                    정보 입력
                  </Link>
                )}
                
                {hasPermission(currentUser.role as any, 'canViewGroups') && (
                  <Link
                    to="/groups"
                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                  >
                    그룹 보기
                  </Link>
                )}
                
                <Link
                  to="/reports"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                >
                  익명 신고
                </Link>
                
                <Link
                  to="/notifications"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                >
                  알림
                </Link>
                
                {hasPermission(currentUser.role as any, 'canViewNegotiationGuide') && (
                  <Link
                    to="/guide"
                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                  >
                    협상 가이드
                  </Link>
                )}
                
                {hasPermission(currentUser.role as any, 'canVote') && (
                  <Link
                    to="/voting"
                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm bg-gray-50"
                  >
                    투표 참여
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/tenant-form" element={<TenantForm currentUser={currentUser} />} />
            <Route path="/groups" element={<GroupsPage currentUser={currentUser} />} />
            <Route path="/reports" element={<AnonymousReport />} />
            <Route path="/guide" element={<NegotiationGuide />} />
            <Route path="/voting" element={<TenantVoting currentUser={currentUser} />} />
            <Route path="/notifications" element={<NotificationsPage currentUser={currentUser} />} />
          </Routes>
        </main>

        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;