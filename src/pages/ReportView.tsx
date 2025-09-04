import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NegotiationReport, AdvancedReport } from '../types';
import { reportApi } from '../lib/api';

export default function ReportView() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<NegotiationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // reportId가 userId로 사용됨 (실제 구현에서는 별도 매핑이 필요할 수 있음)
        const userId = reportId || 'user_123'; // 임시로 기본값 사용
        
        const response = await reportApi.getAdvancedReport(userId);
        
        if (response.ok && response.data) {
          const advancedReport: AdvancedReport = response.data;
          
          // AdvancedReport를 NegotiationReport 형식으로 변환
          const convertedReport: NegotiationReport = {
            id: reportId || '',
            userId: userId,
            reportUrl: '',
            title: '거주 환경 분석 리포트',
            summary: `이 리포트는 ${advancedReport.userProfile.neighborhood || '해당 지역'}의 거주 환경을 종합적으로 분석한 결과입니다.`,
            keyFindings: advancedReport.keyFindings || generateKeyFindings(advancedReport),
            recommendations: advancedReport.recommendations || generateRecommendations(advancedReport),
            marketData: advancedReport.marketData,
            diagnosisData: convertDiagnosisStats(advancedReport.diagnosisStats),
            createdAt: new Date().toISOString(),
            isShared: true
          };
          
          setReport(convertedReport);
        } else {
          setError(response.message || '리포트를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('리포트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // AdvancedReport에서 keyFindings 생성
  const generateKeyFindings = (advancedReport: AdvancedReport): string[] => {
    const findings: string[] = [];
    
    // 시장 데이터 기반 발견사항
    if (advancedReport.marketData) {
      findings.push(`${advancedReport.marketData.neighborhood} 지역의 평균 월세는 ${advancedReport.marketData.avgMonthlyRent.toLocaleString()}원입니다.`);
    }
    
    // 진단 통계 기반 발견사항
    if (advancedReport.diagnosisStats && advancedReport.diagnosisStats.userScores) {
      const userScores = advancedReport.diagnosisStats.userScores;
      const lowestScore = Math.min(...Object.values(userScores));
      const lowestCategory = Object.keys(userScores).find(key => userScores[key] === lowestScore);
      
      if (lowestCategory && lowestScore < 60) {
        findings.push(`${getCategoryLabel(lowestCategory)} 항목의 만족도가 낮습니다 (${lowestScore}점).`);
      }
    }
    
    // 데이터 신뢰도 기반 발견사항
    if (advancedReport.dataReliability) {
      if (advancedReport.dataReliability.buildingParticipantCount > 0) {
        findings.push(`같은 건물에서 ${advancedReport.dataReliability.buildingParticipantCount}명이 참여하여 신뢰할 수 있는 비교 데이터를 제공합니다.`);
      }
    }
    
    return findings.length > 0 ? findings : ['종합적인 거주 환경 분석이 완료되었습니다.'];
  };

  // AdvancedReport에서 recommendations 생성
  const generateRecommendations = (advancedReport: AdvancedReport): string[] => {
    const recommendations: string[] = [];
    
    // 협상 전략 기반 추천사항
    if (advancedReport.negotiationStrategies && advancedReport.negotiationStrategies.length > 0) {
      advancedReport.negotiationStrategies
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3) // 상위 3개만 표시
        .forEach(strategy => {
          recommendations.push(strategy.message);
        });
    }
    
    // 데이터 신뢰도 기반 추천사항
    if (advancedReport.dataReliability && !advancedReport.dataReliability.isReportEligible) {
      recommendations.push(advancedReport.dataReliability.reliabilityMessage);
    }
    
    return recommendations.length > 0 ? recommendations : ['데이터 기반의 객관적 근거를 제시하여 협상력을 높이세요.'];
  };

  // DiagnosisStats를 ComprehensiveDiagnosis 형식으로 변환
  const convertDiagnosisStats = (diagnosisStats: any) => {
    const userScores = diagnosisStats.userScores || {};
    const userScoreValues = Object.values(userScores) as number[];
    const overallScore = userScoreValues.length > 0 
      ? Math.round(userScoreValues.reduce((a: number, b: number) => a + b, 0) / userScoreValues.length)
      : 75;
    
    const buildingScores = diagnosisStats.buildingAverageScores ? Object.values(diagnosisStats.buildingAverageScores) as number[] : [];
    const neighborhoodScores = diagnosisStats.neighborhoodAverageScores ? Object.values(diagnosisStats.neighborhoodAverageScores) as number[] : [];
    
    return {
      id: 'diagnosis_' + Date.now(),
      userId: reportId || 'user_123',
      overallScore: overallScore,
      categoryScores: userScores,
      buildingComparison: {
        averageScore: buildingScores.length > 0 
          ? Math.round(buildingScores.reduce((a: number, b: number) => a + b, 0) / buildingScores.length) : 75,
        participantCount: diagnosisStats.buildingParticipantCount || 0,
        rank: 1,
        percentile: 75
      },
      neighborhoodComparison: {
        averageScore: neighborhoodScores.length > 0 
          ? Math.round(neighborhoodScores.reduce((a: number, b: number) => a + b, 0) / neighborhoodScores.length) : 72,
        participantCount: diagnosisStats.neighborhoodParticipantCount || 0,
        rank: 1,
        percentile: 82
      },
      recommendations: [],
      createdAt: new Date().toISOString()
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '보통';
    return '개선 필요';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'noise': '소음',
      'water_pressure': '수압',
      'lighting': '채광',
      'parking': '주차',
      'heating': '난방',
      'security': '보안',
      'elevator': '엘리베이터',
      'facilities': '기타 시설'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">리포트 로딩 실패</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">리포트를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 리포트가 존재하지 않거나 삭제되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-gray-600 mt-1">월세 공동협약 네트워크</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">생성일</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(report.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 요약 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 요약</h2>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </div>

        {/* 종합 점수 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 종합 점수</h2>
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-3xl font-bold ${getScoreColor(report.diagnosisData.overallScore)}`}>
              {report.diagnosisData.overallScore}점
            </div>
            <p className="text-lg text-gray-600 mt-2">{getScoreLabel(report.diagnosisData.overallScore)}</p>
          </div>
        </div>

        {/* 카테고리별 점수 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 카테고리별 점수</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(report.diagnosisData.categoryScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-lg font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <p className="text-sm text-gray-600 mt-2">{getCategoryLabel(category)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 비교 분석 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏢 같은 건물 비교</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">평균 점수:</span>
                <span className="font-semibold">{report.diagnosisData.buildingComparison.averageScore}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">참여자 수:</span>
                <span className="font-semibold">{report.diagnosisData.buildingComparison.participantCount}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">순위:</span>
                <span className="font-semibold">{report.diagnosisData.buildingComparison.rank}위</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상위:</span>
                <span className="font-semibold">{report.diagnosisData.buildingComparison.percentile}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏘️ 같은 동네 비교</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">평균 점수:</span>
                <span className="font-semibold">{report.diagnosisData.neighborhoodComparison.averageScore}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">참여자 수:</span>
                <span className="font-semibold">{report.diagnosisData.neighborhoodComparison.participantCount}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">순위:</span>
                <span className="font-semibold">{report.diagnosisData.neighborhoodComparison.rank}위</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상위:</span>
                <span className="font-semibold">{report.diagnosisData.neighborhoodComparison.percentile}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 시장 데이터 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 시장 데이터</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{report.marketData.avgMonthlyRent.toLocaleString()}</p>
              <p className="text-sm text-gray-600">평균 월세</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{report.marketData.avgDeposit.toLocaleString()}</p>
              <p className="text-sm text-gray-600">평균 보증금</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{report.marketData.transactionCount}</p>
              <p className="text-sm text-gray-600">거래 건수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{report.marketData.neighborhood}</p>
              <p className="text-sm text-gray-600">지역</p>
            </div>
          </div>
        </div>

        {/* 주요 발견사항 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 주요 발견사항</h2>
          <ul className="space-y-3">
            {report.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
                <span className="text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 추천사항 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 추천사항</h2>
          <ul className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 푸터 */}
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            이 리포트는 월세 공동협약 네트워크에서 생성되었습니다.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            데이터 기반의 객관적 협상을 통해 더 나은 거주 환경을 만들어가세요.
          </p>
        </div>
      </div>
    </div>
  );
}