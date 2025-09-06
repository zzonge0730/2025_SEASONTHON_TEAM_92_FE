import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Group, ComprehensiveDiagnosis } from '../types';
import { groupApi } from '../lib/api';
import { formatCurrency } from '../utils/formatting';
import DiagnosisSystem from '../components/DiagnosisSystem';
import DiagnosisResult from '../components/DiagnosisResult';
import WeeklyMission from '../components/WeeklyMission';
import ReportGenerator from '../components/ReportGenerator';
import InfoCardDisplay from '../components/InfoCardDisplay';

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
  const [activeTab, setActiveTab] = useState('report');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">데이터 로딩 중...</h2>
          <p className="text-gray-600 mb-4">사용자 정보를 가져오고 있습니다</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
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

  // Enhanced user data with real profile information
  const userData = {
    name: currentUser.nickname || '사용자',
    building: currentUser.buildingName || '건물명',
    location: currentUser.neighborhood || '동네',
    address: currentUser.address || '주소 정보 없음',
    email: currentUser.email || '이메일 정보 없음',
    role: getRoleDisplayName(currentUser.role),
    monthsLived: 14,
    overallScore: diagnosisResult?.overallScore || 73,
    buildingAverage: 68,
    neighborhoodAverage: 71,
    profileCompleted: currentUser.profileCompleted || false,
    diagnosisCompleted: currentUser.diagnosisCompleted || false,
    onboardingCompleted: currentUser.onboardingCompleted || false
  };

  // Mock analysis data
  const analysisData = {
    lowScoreItems: [
      { 
        category: '수압', 
        myScore: 45, 
        buildingAvg: 72, 
        neighborhoodAvg: 68, 
        type: 'facility',
        priority: 1,
        description: '임대인 수선 의무 해당',
        suggestion: '수압 펌프 점검 또는 수전 교체 요구',
        legalBasis: '주택임대차보호법 제20조 수선의무'
      },
      { 
        category: '곰팡이/습도', 
        myScore: 38, 
        buildingAvg: 65, 
        neighborhoodAvg: 62, 
        type: 'facility',
        priority: 1,
        description: '법적 수선 의무 해당',
        suggestion: '벽지 교체 및 환기시설 개선 요구',
        legalBasis: '주택임대차보호법 제20조 수선의무'
      },
      { 
        category: '주차', 
        myScore: 52, 
        buildingAvg: 68, 
        neighborhoodAvg: 71, 
        type: 'structural',
        priority: 2,
        description: '구조적 문제',
        suggestion: '월세 인상률 조정 근거로 활용',
        reasoning: '해결이 어려운 구조적 문제를 근거로 월세 협상'
      },
      { 
        category: '방음', 
        myScore: 58, 
        buildingAvg: 72, 
        neighborhoodAvg: 75, 
        type: 'structural',
        priority: 2,
        description: '구조적 문제',
        suggestion: '월세 동결 또는 최소 인상 요구',
        reasoning: '건물 구조상 개선이 어려운 문제로 인상률 조정 요구'
      }
    ],
    marketData: {
      avgRent: 85,
      avgDeposit: 5000,
      recentIncreaseRate: 3.2,
      recommendedIncreaseRate: 1.5,
      participantCount: 87
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // 실제로는 서버에서 리포트 생성 후 고유 URL 반환
      await new Promise(resolve => setTimeout(resolve, 3000));
      const generatedUrl = `${window.location.origin}/report/share/${Date.now()}`;
      setReportUrl(generatedUrl);
      setReportGenerated(true);
    } catch (error) {
      console.error('리포트 생성 실패:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      // 시각적 피드백 제공
      const button = document.getElementById('share-button');
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<div class="flex items-center"><i class="ri-check-line mr-2"></i>복사 완료!</div>';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    } catch (error) {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = reportUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleReportGenerated = () => {
    setCurrentView('report');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세 공동협약</h1>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요, {userData.name}님!</h2>
                <p className="text-gray-600">{userData.building} • {userData.location}</p>
                <p className="text-sm text-gray-500 mt-1">거주 기간: {userData.monthsLived}개월</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{userData.overallScore}</span>
                </div>
                <p className="text-sm text-gray-600">종합 만족도</p>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 프로필 및 진단 결과 섹션 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 사용자 프로필 상세 정보 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i className="ri-user-line mr-2 text-blue-600"></i>
              내 프로필 정보
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">닉네임</span>
                <span className="font-semibold text-gray-900">{userData.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">이메일</span>
                <span className="font-semibold text-gray-900 text-sm">{userData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">사용자 유형</span>
                <span className="font-semibold text-gray-900">{userData.role}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">건물명</span>
                <span className="font-semibold text-gray-900">{userData.building}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">동네</span>
                <span className="font-semibold text-gray-900">{userData.location}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">상세 주소</span>
                <span className="font-semibold text-gray-900 text-sm">{userData.address}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">거주 기간</span>
                <span className="font-semibold text-gray-900">{userData.monthsLived}개월</span>
              </div>
            </div>
            
            {/* 프로필 완성도 표시 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">프로필 완성도</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">기본 프로필</span>
                  <div className="flex items-center">
                    {userData.profileCompleted ? (
                      <i className="ri-check-circle-fill text-green-500 mr-1"></i>
                    ) : (
                      <i className="ri-close-circle-fill text-red-500 mr-1"></i>
                    )}
                    <span className={`text-sm font-medium ${userData.profileCompleted ? 'text-green-600' : 'text-red-600'}`}>
                      {userData.profileCompleted ? '완료' : '미완료'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">진단 완료</span>
                  <div className="flex items-center">
                    {userData.diagnosisCompleted ? (
                      <i className="ri-check-circle-fill text-green-500 mr-1"></i>
                    ) : (
                      <i className="ri-close-circle-fill text-red-500 mr-1"></i>
                    )}
                    <span className={`text-sm font-medium ${userData.diagnosisCompleted ? 'text-green-600' : 'text-red-600'}`}>
                      {userData.diagnosisCompleted ? '완료' : '미완료'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">온보딩</span>
                  <div className="flex items-center">
                    {userData.onboardingCompleted ? (
                      <i className="ri-check-circle-fill text-green-500 mr-1"></i>
                    ) : (
                      <i className="ri-close-circle-fill text-red-500 mr-1"></i>
                    )}
                    <span className={`text-sm font-medium ${userData.onboardingCompleted ? 'text-green-600' : 'text-red-600'}`}>
                      {userData.onboardingCompleted ? '완료' : '미완료'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 진단 결과 상세 정보 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <i className="ri-bar-chart-line mr-2 text-green-600"></i>
              진단 결과 요약
            </h3>
            
            {diagnosisResult ? (
              <div className="space-y-4">
                {/* 종합 점수 */}
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{diagnosisResult.overallScore}점</div>
                  <div className="text-sm text-gray-600">종합 만족도</div>
                </div>

                {/* 카테고리별 점수 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">카테고리별 점수</h4>
                  {Object.entries(diagnosisResult.categoryScores || {}).map(([category, score]) => (
                    <div key={category} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 capitalize">{category}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8">{score}점</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 건물/동네 비교 */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">비교 분석</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">건물 평균</span>
                      <span className="font-semibold">{userData.buildingAverage}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">동네 평균</span>
                      <span className="font-semibold">{userData.neighborhoodAverage}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">내 점수</span>
                      <span className="font-semibold text-blue-600">{userData.overallScore}점</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-bar-chart-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-4">아직 진단을 받지 않았습니다</p>
                <button
                  onClick={() => setCurrentView('diagnosis')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  진단 받기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <i className="ri-file-text-line mr-2"></i>
                맞춤형 협상 리포트
              </div>
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <i className="ri-bar-chart-line mr-2"></i>
                우리 동네 시세
              </div>
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <i className="ri-information-line mr-2"></i>
                정책 정보
              </div>
            </button>
          </div>

          <div className="p-8">
            {/* 맞춤형 협상 리포트 탭 */}
            {activeTab === 'report' && (
              <div className="space-y-8">
                {/* 리포트 생성 섹션 */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">맞춤형 협상 리포트</h3>
                      <p className="text-blue-100 mb-2">수집된 데이터를 바탕으로 실질적인 협상 자료를 생성합니다</p>
                      <div className="text-xs text-blue-200 flex items-center">
                        <i className="ri-group-line mr-1"></i>
                        최소 {analysisData.marketData.participantCount}명 참여 데이터 기반
                      </div>
                    </div>
                    <div className="text-right">
                      {!reportGenerated ? (
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          {isGeneratingReport ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                              생성 중...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <i className="ri-file-add-line mr-2"></i>
                              리포트 생성하기
                            </div>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center text-green-200 text-sm">
                            <i className="ri-check-circle-fill mr-2"></i>
                            리포트 생성 완료!
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 mb-3">
                            <div className="text-xs text-blue-200 mb-2">공유 링크</div>
                            <div className="text-sm text-white break-all bg-black/20 rounded p-2 mb-2">
                              {reportUrl}
                            </div>
                            <div className="text-xs text-blue-200">
                              임대인은 회원가입 없이 리포트를 확인할 수 있습니다
                            </div>
                          </div>
                          <button
                            id="share-button"
                            onClick={handleCopyLink}
                            className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <div className="flex items-center justify-center">
                              <i className="ri-file-copy-line mr-2"></i>
                              링크 복사하고 공유하기
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 협상 전략 제안 */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">📋 재계약 협상 전략 제안</h3>
                  
                  {/* 데이터 신뢰도 표시 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-blue-800">
                      <i className="ri-shield-check-line mr-2"></i>
                      <span className="font-medium">
                        이 분석은 {analysisData.marketData.participantCount}명의 이웃 데이터를 기반으로 합니다
                      </span>
                    </div>
                  </div>
                  
                  {/* 1순위: 시설 개선 요구 */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        1
                      </div>
                      <h4 className="text-xl font-bold text-red-800">최우선 협상 카드: 시설 개선 요구</h4>
                    </div>
                    
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                      <h5 className="font-bold text-red-800 mb-2">🎯 협상 전략</h5>
                      <p className="text-red-700 text-sm">
                        <strong>예시:</strong> "현재 제 수압 만족도(45점)는 우리 건물 평균(72점)보다 현저히 낮습니다. 
                        월세 인하가 어렵다면, 이 데이터를 근거로 수압 펌프 점검이나 수전 교체 등 명확한 시설 개선을 요구해 보세요."
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-gray-900">수압</h5>
                          <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            임대인 수선 의무 해당
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">내 점수:</span>
                            <span className="font-semibold text-red-600">45점</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">건물 평균:</span>
                            <span className="font-semibold">72점</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">점수 차이:</span>
                            <span className="font-bold text-red-600">-27점</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <i className="ri-lightbulb-line mr-1"></i>
                            <strong>제안:</strong> 수압 펌프 점검 또는 수전 교체 요구
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            <i className="ri-article-line mr-1"></i>
                            근거: 주택임대차보호법 제20조 수선의무
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 종합 협상 가이드 */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">💡 종합 협상 가이드라인</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">1단계: 시설 개선 우선 요구</h5>
                        <p className="text-gray-700 text-sm">
                          법적 수선 의무에 해당하는 '수압' 문제 해결을 최우선으로 요구하세요.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">2단계: 대안 제시</h5>
                        <p className="text-gray-700 text-sm">
                          집주인이 구조적 문제(주차, 방음) 해결이 어렵다고 할 경우, 
                          이를 사유로 월세 인상률 조정을 역제안하세요.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">3단계: 데이터 근거 제시</h5>
                        <p className="text-gray-700 text-sm">
                          "이웃 {analysisData.marketData.participantCount}명의 비교 데이터에 따르면..." 으로 시작하여 객관적 근거를 제시하며 협상하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 우리 동네 시세 탭 */}
            {activeTab === 'market' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 {userData.location} 시세 리포트</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-home-line text-xl text-blue-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">평균 월세</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{analysisData.marketData.avgRent}만원</div>
                      <p className="text-sm text-gray-500">아파트 기준</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-bank-line text-xl text-green-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">평균 보증금</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">{analysisData.marketData.avgDeposit}만원</div>
                      <p className="text-sm text-gray-500">아파트 기준</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-arrow-up-line text-xl text-orange-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">평균 인상률</h4>
                      <div className="text-2xl font-bold text-orange-600 mb-1">{analysisData.marketData.recentIncreaseRate}%</div>
                      <p className="text-sm text-gray-500">최근 6개월</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 정책 정보 탭 */}
            {activeTab === 'support' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">🏛️ 맞춤형 정책 정보</h3>
                
                {/* 청년 지원 정책 */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-xl font-bold text-green-800 mb-4">청년 월세 지원 정책</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-bold text-gray-900 mb-2">청년 월세 한시 특별지원</h5>
                      <p className="text-sm text-gray-600 mb-3">만 19~34세 청년에게 월 20만원씩 12개월 지원</p>
                      <a 
                        href="https://www.gov.kr" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700 cursor-pointer"
                      >
                        자세히 보기 <i className="ri-external-link-line ml-1"></i>
                      </a>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-bold text-gray-900 mb-2">청년 전월세 보증금 대출</h5>
                      <p className="text-sm text-gray-600 mb-3">최대 2억원까지 연 1.8% 금리로 지원</p>
                      <a 
                        href="https://www.hug.or.kr" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700 cursor-pointer"
                      >
                        자세히 보기 <i className="ri-external-link-line ml-1"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => setCurrentView('diagnosis')}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-refresh-line text-xl text-blue-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">진단 다시 받기</h4>
                <p className="text-sm text-gray-600">최신 상태로 다시 진단받아보세요</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('mission')}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-task-line text-xl text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">주간 미션 참여</h4>
                <p className="text-sm text-gray-600">이웃들과 함께 데이터를 개선해보세요</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}