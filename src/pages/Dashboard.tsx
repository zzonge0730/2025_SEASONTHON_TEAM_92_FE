import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Group, ComprehensiveDiagnosis } from '../types';
import { groupApi } from '../lib/api';
import { formatCurrency } from '../utils/formatting';
import DiagnosisSystem from '../components/DiagnosisSystem';
import DiagnosisResult from '../components/DiagnosisResult';
import WeeklyMission from '../components/WeeklyMission';
import ReportGenerator from '../components/ReportGenerator';

interface DashboardProps {
  currentUser: User;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    myGroups: 0,
    totalRent: 0,
    avgRent: 0
  });

  // 새로운 상태들
  const [diagnosisResult, setDiagnosisResult] = useState<ComprehensiveDiagnosis | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'diagnosis' | 'mission' | 'report'>('dashboard');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch both building and neighborhood groups
      const [buildingResponse, neighborhoodResponse] = await Promise.all([
        groupApi.getGroups('building'),
        groupApi.getGroups('neighborhood')
      ]);

      const allGroups = [
        ...(buildingResponse.ok ? buildingResponse.data || [] : []),
        ...(neighborhoodResponse.ok ? neighborhoodResponse.data || [] : [])
      ];

      setGroups(allGroups);
      
      // Calculate stats
      const totalRent = allGroups.reduce((sum, group) => sum + group.avgRentKrw, 0);
      setStats({
        totalGroups: allGroups.length,
        myGroups: allGroups.length, // For now, assume user is in all groups
        totalRent,
        avgRent: allGroups.length > 0 ? totalRent / allGroups.length : 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'tenant': return '세입자';
      case 'landlord': return '집주인';
      case 'anonymous': return '익명 사용자';
      case 'admin': return '관리자';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 핸들러 함수들
  const handleDiagnosisComplete = (result: ComprehensiveDiagnosis) => {
    setDiagnosisResult(result);
    setCurrentView('diagnosis');
  };

  const handleMissionComplete = () => {
    setCurrentView('dashboard');
    // 미션 완료 후 대시보드로 돌아가기
  };

  const handleReportGenerated = () => {
    setCurrentView('report');
  };

  const handleGenerateReport = () => {
    if (diagnosisResult) {
      setCurrentView('report');
    }
  };

  // 뷰별 렌더링
  if (currentView === 'diagnosis') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
        {diagnosisResult ? (
          <DiagnosisResult 
            currentUser={currentUser}
            result={diagnosisResult} 
            onGenerateReport={handleGenerateReport}
          />
        ) : (
          <DiagnosisSystem 
            currentUser={currentUser} 
            onComplete={handleDiagnosisComplete}
          />
        )}
      </div>
    );
  }

  if (currentView === 'mission') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
        <WeeklyMission 
          currentUser={currentUser} 
          onComplete={handleMissionComplete}
        />
      </div>
    );
  }

  if (currentView === 'report') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
        {diagnosisResult && (
          <ReportGenerator
            currentUser={currentUser}
            diagnosisData={diagnosisResult}
            marketData={groups[0]?.marketData || {
              neighborhood: '성남동',
              buildingName: '행복아파트',
              avgDeposit: 5000000,
              avgMonthlyRent: 500000,
              medianDeposit: 4500000,
              medianMonthlyRent: 480000,
              transactionCount: 12,
              recentTransactionDate: '2024-01-15'
            }}
            onReportGenerated={handleReportGenerated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {currentUser.nickname}님! 👋
        </h1>
        <p className="text-indigo-100">
          {getRoleDisplayName(currentUser.role)}으로 활동하고 계시는군요. 
          {currentUser.onboardingCompleted ? 
            ' 온보딩이 완료되었습니다! 이제 서비스를 자유롭게 이용하실 수 있습니다.' :
            ' 오늘도 공동 협상을 통해 더 나은 임대 조건을 만들어보세요.'
          }
        </p>
        {currentUser.onboardingCompleted && (
          <div className="mt-3 p-3 bg-green-500 bg-opacity-20 rounded-lg">
            <p className="text-sm text-green-100">
              ✅ 온보딩 완료 - 프로필 입력이 완료되었습니다.
              {!currentUser.diagnosisCompleted && (
                <span className="block mt-1">
                  💡 진단을 완료하시면 더 정확한 협상 리포트를 받으실 수 있습니다.
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 새로운 기능 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">우리 집 진단</h3>
              <p className="text-sm text-gray-600">거주 환경 종합 분석</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('diagnosis')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {currentUser.diagnosisCompleted ? '진단 결과 보기' : 
             currentUser.onboardingCompleted && !currentUser.diagnosisCompleted ? '진단 다시 시작하기' : '진단 시작하기'}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">주간 미션</h3>
              <p className="text-sm text-gray-600">이번 주 주제: 방음 상태</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('mission')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            미션 참여하기
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">협상 리포트</h3>
              <p className="text-sm text-gray-600">데이터 기반 협상 자료</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('report')}
            disabled={!currentUser.diagnosisCompleted}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentUser.diagnosisCompleted ? '리포트 생성하기' : '진단 완료 후 이용 가능'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">참여 그룹</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.myGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 월세</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.avgRent)}원
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 그룹 수</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활동 상태</p>
              <p className="text-2xl font-semibold text-gray-900">활발</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">정보 입력</p>
              <p className="text-sm text-gray-600">월세 정보 등록</p>
            </div>
          </Link>

          <Link
            to="/groups"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">그룹 보기</p>
              <p className="text-sm text-gray-600">참여 그룹 확인</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">익명 신고</p>
              <p className="text-sm text-gray-600">문제 상황 신고</p>
            </div>
          </Link>

          <Link
            to="/voting"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">투표 참여</p>
              <p className="text-sm text-gray-600">의사결정 참여</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Groups */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 그룹</h2>
          <Link
            to="/groups"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            모두 보기 →
          </Link>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">아직 그룹이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              월세 정보를 입력하여 그룹에 참여해보세요.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                정보 입력하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 6).map((group) => (
              <div key={group.groupId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{group.label}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {group.scope}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {group.groupSize} households
                </div>
                <div className="text-sm font-medium text-gray-900">
                  평균 {formatCurrency(group.avgRentKrw)}원
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}