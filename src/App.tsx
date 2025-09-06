import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import TenantForm from './pages/TenantForm';
import GroupsPage from './pages/GroupsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportView from './pages/ReportView';
import SharedReportView from './pages/SharedReportView';
import AuthForm from './components/AuthForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AnonymousReport from './components/AnonymousReport';
import NegotiationGuide from './components/NegotiationGuide';
import TenantVoting from './components/TenantVoting';
import DiagnosisSystem from './components/DiagnosisSystem';
import DiagnosisResult from './components/DiagnosisResult';
import LocationVerifier from './components/LocationVerifier';
import { User } from './types';
import { authApi } from './lib/api';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('jwtToken');
      
      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // 서버에서 최신 사용자 정보 가져오기 (백그라운드에서)
          try {
            const response = await authApi.getCurrentUser();
            if (response.ok && response.data) {
              // 서버의 최신 정보로 업데이트
              setCurrentUser(response.data);
              localStorage.setItem('currentUser', JSON.stringify(response.data));
            }
          } catch (error) {
            console.log('서버에서 사용자 정보를 가져올 수 없습니다. 로컬 정보를 사용합니다.');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('jwtToken');
        }
      }
      setIsLoading(false);
    };
    
    initializeUser();
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdminLogin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');
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

  const AppContent = () => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">...Loading...</div>;
    }

    if (!currentUser) {
      if (showAdminLogin) {
        return (
          <AdminLogin
            onAdminLogin={handleAdminAuthSuccess}
            onBack={handleBackToMain}
          />
        );
      }
      return <AuthForm onAuthSuccess={handleAuthSuccess} onAdminLogin={handleAdminLogin} />;
    }

    // 관리자는 온보딩 스킵
    if (currentUser.role === 'admin') {
        return <AdminDashboard admin={currentUser} onLogout={handleLogout} />;
    }

    // After login, check if location is verified
    if (!currentUser.address || !currentUser.buildingName) {
        return <LocationVerifier currentUser={currentUser} onVerificationSuccess={handleAuthSuccess} onGoHome={handleLogout} />;
    }

    // Check if profile is completed
    if (!currentUser.profileCompleted) {
        return <TenantForm currentUser={currentUser} onComplete={handleAuthSuccess} onGoHome={handleLogout} />;
    }

    // Check if diagnosis is completed (only if onboarding is not completed)
    if (!currentUser.onboardingCompleted) {
        return <DiagnosisSystem 
            currentUser={currentUser} 
            onComplete={async () => {
                // Update user with diagnosis completion
                const updatedUser = {
                    ...currentUser,
                    diagnosisCompleted: true,
                    onboardingCompleted: true
                };
                
                try {
                    // Update user in backend
                    const response = await authApi.updateUser(updatedUser);
                    if (response.ok) {
                        handleAuthSuccess(response.data);
                    } else {
                        // If backend update fails, still update locally
                        handleAuthSuccess(updatedUser);
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    // If backend update fails, still update locally
                    handleAuthSuccess(updatedUser);
                }
            }}
            onSkip={async () => {
                // Update user with diagnosis skipped
                const updatedUser = {
                    ...currentUser,
                    diagnosisCompleted: false, // 진단을 스킵했으므로 false
                    onboardingCompleted: true
                };
                
                try {
                    // Update user in backend
                    const response = await authApi.updateUser(updatedUser);
                    if (response.ok) {
                        handleAuthSuccess(response.data);
                    } else {
                        // If backend update fails, still update locally
                        handleAuthSuccess(updatedUser);
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    // If backend update fails, still update locally
                    handleAuthSuccess(updatedUser);
                }
            }}
            onGoHome={handleLogout}
        />;
    }


    // ... other roles and main app layout
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  월세 공동협약 네트워크
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">안녕하세요, {currentUser.nickname}님</span>
                
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  대시보드
                </Link>
                
                <Link
                  to="/groups"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  그룹 보기
                </Link>
                
                <Link
                  to="/reports"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  익명 신고
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그아웃
                </button>
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
            <Route path="/report/advanced" element={<ReportView />} />
            <Route path="/shared-report/:shareToken" element={<SharedReportView />} />
            <Route path="/diagnosis" element={<DiagnosisSystem currentUser={currentUser} onComplete={() => window.location.href = '/'} />} />
            <Route path="/diagnosis/result" element={<DiagnosisResult currentUser={currentUser} />} />
          </Routes>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
