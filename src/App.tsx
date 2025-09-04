import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import TenantForm from './pages/TenantForm';
import GroupsPage from './pages/GroupsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportView from './pages/ReportView';
import AuthForm from './components/AuthForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LandlordDashboard from './components/LandlordDashboard';
import AnonymousReport from './components/AnonymousReport';
import NegotiationGuide from './components/NegotiationGuide';
import TenantVoting from './components/TenantVoting';
import NotificationBell from './components/NotificationBell';
import HowItWorks from './components/HowItWorks';
import DiagnosisSystem from './components/DiagnosisSystem';
import DiagnosisResult from './components/DiagnosisResult';
import { User } from './types';
import { hasPermission, getRoleDisplayName } from './utils/rolePermissions';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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

  const AppContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!currentUser) {
      if (showAdminLogin) {
        return <AdminLogin onAdminLogin={handleAdminAuthSuccess} onBack={handleBackToMain} />;
      }
      return (
        <>
          <HowItWorks />
          <div className="py-8">
            <AuthForm onAuthSuccess={handleAuthSuccess} onAdminLogin={handleAdminLogin} />
          </div>
        </>
      );
    }

    if (currentUser.role === 'admin') {
      return <AdminDashboard admin={currentUser} onLogout={handleLogout} />;
    }

    if (currentUser.role === 'landlord' && currentUser.isVerified) {
      return <LandlordDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          {/* ... Nav content ... */}
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
            <Route path="/report/advanced" element={<ReportView currentUser={currentUser} />} />
            <Route path="/diagnosis" element={<DiagnosisSystem currentUser={currentUser} onComplete={() => window.location.href = '/diagnosis/result'} />} />
            <Route path="/diagnosis/result" element={<DiagnosisResult currentUser={currentUser} />} />
            <Route path="/info-cards" element={<InfoCardListPage />} />
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
