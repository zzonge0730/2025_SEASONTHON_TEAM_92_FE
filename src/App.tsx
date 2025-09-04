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
import AdminDashboard from './components/AdminDashboard';
import AnonymousReport from './components/AnonymousReport';
import NegotiationGuide from './components/NegotiationGuide';
import TenantVoting from './components/TenantVoting';
import DiagnosisSystem from './components/DiagnosisSystem';
import DiagnosisResult from './components/DiagnosisResult';
import LocationVerifier from './components/LocationVerifier';
import { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    localStorage.removeItem('currentUser');
  };

  // ... other handlers

  const AppContent = () => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">...Loading...</div>;
    }

    if (!currentUser) {
      // ... Login/Register Forms
      return <AuthForm onAuthSuccess={handleAuthSuccess} />;
    }

    // After login, check if location is verified
    if (!currentUser.address || !currentUser.buildingName) {
        return <LocationVerifier currentUser={currentUser} onVerificationSuccess={handleAuthSuccess} />;
    }

    // Check if profile is completed
    if (!currentUser.profileCompleted) {
        return <TenantForm currentUser={currentUser} onComplete={handleAuthSuccess} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminDashboard admin={currentUser} onLogout={handleLogout} />;
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
