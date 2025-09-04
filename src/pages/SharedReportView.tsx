import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface AnonymousReport {
  reportId: string;
  title: string;
  summary: string;
  createdAt: string;
  dataReliability: {
    buildingParticipantCount: number;
    neighborhoodParticipantCount: number;
    buildingReliabilityScore: number;
    neighborhoodReliabilityScore: number;
    isReportEligible: boolean;
    reliabilityMessage: string;
  };
  negotiationCards: Array<{
    issueId: string;
    issueName: string;
    category: 'LEGAL_REPAIR' | 'STRUCTURAL' | 'GENERAL';
    description: string;
    negotiationStrategy: string;
    priority: number;
    scoreDifference: number;
    legalBasis: string;
    suggestedAction: string;
  }>;
  negotiationScenario: string;
  successRate: number;
  accessCount: number;
  lastAccessedAt: string;
}

export default function SharedReportView() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [report, setReport] = useState<AnonymousReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (shareToken) {
      fetchSharedReport(shareToken);
    }
  }, [shareToken]);

  const fetchSharedReport = async (token: string) => {
    try {
      const response = await fetch(`/api/reports/shared/${token}`);
      const result = await response.json();
      
      if (result.ok) {
        setReport(result.data);
      } else {
        setError(result.message || '리포트를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('리포트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEGAL_REPAIR': return 'bg-red-100 text-red-800 border-red-200';
      case 'STRUCTURAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'GENERAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'LEGAL_REPAIR': return '법적 수선 의무';
      case 'STRUCTURAL': return '구조적 문제';
      case 'GENERAL': return '일반적 문제';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">리포트를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(report.createdAt).toLocaleDateString('ko-KR')}에 생성됨
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">리포트 열람</div>
              <div className="text-lg font-semibold text-indigo-600">{report.accessCount}회</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 요약 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 리포트 요약</h2>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </div>

        {/* 신뢰도 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 데이터 신뢰도</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{report.dataReliability.buildingParticipantCount}</div>
              <div className="text-sm text-gray-600">건물 참여자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{report.dataReliability.neighborhoodParticipantCount}</div>
              <div className="text-sm text-gray-600">동네 참여자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{report.dataReliability.buildingReliabilityScore.toFixed(1)}점</div>
              <div className="text-sm text-gray-600">건물 신뢰도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{report.dataReliability.neighborhoodReliabilityScore.toFixed(1)}점</div>
              <div className="text-sm text-gray-600">동네 신뢰도</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{report.dataReliability.reliabilityMessage}</p>
          </div>
        </div>

        {/* 협상 카드 */}
        {report.negotiationCards.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🃏 협상 카드</h2>
            <div className="space-y-4">
              {report.negotiationCards.map((card, index) => (
                <div key={card.issueId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(card.category)}`}>
                      {getCategoryName(card.category)}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">#{index + 1} 우선순위</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{card.issueName}</h3>
                  <p className="text-gray-700 mb-3">{card.description}</p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-800"><strong>협상 전략:</strong> {card.negotiationStrategy}</p>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>법적 근거:</strong> {card.legalBasis}</p>
                    <p><strong>제안 행동:</strong> {card.suggestedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 협상 시나리오 */}
        {report.negotiationScenario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 협상 전략 시나리오</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{report.negotiationScenario}</pre>
            </div>
          </div>
        )}

        {/* 협상 성공 확률 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 협상 성공 확률</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {report.successRate.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${report.successRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {report.successRate >= 80 ? '매우 높은 성공 확률' : 
               report.successRate >= 60 ? '높은 성공 확률' : 
               report.successRate >= 40 ? '보통 성공 확률' : '낮은 성공 확률'}
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 space-y-2">
            <p>이 리포트는 세입자가 생성한 객관적 데이터 분석입니다.</p>
            <p>더 자세한 정보나 협상 관련 문의는 세입자와 직접 연락하시기 바랍니다.</p>
            <p className="text-xs text-gray-400 mt-4">
              마지막 열람: {report.lastAccessedAt ? new Date(report.lastAccessedAt).toLocaleString('ko-KR') : '방금 전'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}