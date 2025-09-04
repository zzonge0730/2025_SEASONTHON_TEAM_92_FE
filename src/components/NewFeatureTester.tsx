import React, { useState } from 'react';
import { User } from '../types';

interface NewFeatureTesterProps {
  currentUser: User;
}

interface DataReliability {
  buildingParticipantCount: number;
  neighborhoodParticipantCount: number;
  buildingReliabilityScore: number;
  neighborhoodReliabilityScore: number;
  isReportEligible: boolean;
  reliabilityMessage: string;
}

interface NegotiationCard {
  issueId: string;
  issueName: string;
  category: 'LEGAL_REPAIR' | 'STRUCTURAL' | 'GENERAL';
  description: string;
  negotiationStrategy: string;
  priority: number;
  scoreDifference: number;
  legalBasis: string;
  suggestedAction: string;
}

export default function NewFeatureTester({ currentUser }: NewFeatureTesterProps) {
  const [reliability, setReliability] = useState<DataReliability | null>(null);
  const [negotiationCards, setNegotiationCards] = useState<NegotiationCard[]>([]);
  const [scenario, setScenario] = useState<string>('');
  const [successRate, setSuccessRate] = useState<number>(0);
  const [loading, setLoading] = useState<string>('');

  const testDataReliability = async () => {
    setLoading('reliability');
    try {
      const response = await fetch(`/api/reports/reliability/${currentUser.id}`);
      const result = await response.json();
      
      if (result.ok) {
        setReliability(result.data);
      } else {
        alert(`신뢰도 조회 실패: ${result.message}`);
      }
    } catch (error) {
      alert('신뢰도 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading('');
    }
  };

  const testNegotiationCards = async () => {
    setLoading('cards');
    try {
      const response = await fetch(`/api/reports/negotiation-cards/${currentUser.id}`);
      const result = await response.json();
      
      if (result.ok) {
        setNegotiationCards(result.data);
      } else {
        alert(`협상 카드 조회 실패: ${result.message}`);
      }
    } catch (error) {
      alert('협상 카드 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading('');
    }
  };

  const testNegotiationScenario = async () => {
    setLoading('scenario');
    try {
      const response = await fetch(`/api/reports/negotiation-scenario/${currentUser.id}`);
      const result = await response.json();
      
      if (result.ok) {
        setScenario(result.data);
      } else {
        alert(`협상 시나리오 조회 실패: ${result.message}`);
      }
    } catch (error) {
      alert('협상 시나리오 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading('');
    }
  };

  const testSuccessRate = async () => {
    setLoading('success');
    try {
      const response = await fetch(`/api/reports/success-rate/${currentUser.id}`);
      const result = await response.json();
      
      if (result.ok) {
        setSuccessRate(result.data);
      } else {
        alert(`성공 확률 조회 실패: ${result.message}`);
      }
    } catch (error) {
      alert('성공 확률 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading('');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEGAL_REPAIR': return 'bg-red-100 text-red-800';
      case 'STRUCTURAL': return 'bg-yellow-100 text-yellow-800';
      case 'GENERAL': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🧪 새로운 기능 테스트
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 테스트 버튼들 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API 테스트</h2>
          <div className="space-y-3">
            <button
              onClick={testDataReliability}
              disabled={loading === 'reliability'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading === 'reliability' ? '로딩...' : '1. 데이터 신뢰도 조회'}
            </button>
            
            <button
              onClick={testNegotiationCards}
              disabled={loading === 'cards'}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'cards' ? '로딩...' : '2. 협상 카드 목록 조회'}
            </button>
            
            <button
              onClick={testNegotiationScenario}
              disabled={loading === 'scenario'}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading === 'scenario' ? '로딩...' : '3. 협상 시나리오 조회'}
            </button>
            
            <button
              onClick={testSuccessRate}
              disabled={loading === 'success'}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading === 'success' ? '로딩...' : '4. 협상 성공 확률 조회'}
            </button>
          </div>
        </div>

        {/* 신뢰도 정보 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📊 데이터 신뢰도</h2>
          {reliability ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>건물 참여자:</span>
                <span className="font-medium">{reliability.buildingParticipantCount}명</span>
              </div>
              <div className="flex justify-between">
                <span>동네 참여자:</span>
                <span className="font-medium">{reliability.neighborhoodParticipantCount}명</span>
              </div>
              <div className="flex justify-between">
                <span>건물 신뢰도:</span>
                <span className="font-medium">{reliability.buildingReliabilityScore.toFixed(1)}점</span>
              </div>
              <div className="flex justify-between">
                <span>동네 신뢰도:</span>
                <span className="font-medium">{reliability.neighborhoodReliabilityScore.toFixed(1)}점</span>
              </div>
              <div className="flex justify-between">
                <span>리포트 생성 가능:</span>
                <span className={`font-medium ${reliability.isReportEligible ? 'text-green-600' : 'text-red-600'}`}>
                  {reliability.isReportEligible ? '가능' : '불가능'}
                </span>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{reliability.reliabilityMessage}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">신뢰도 정보를 조회해주세요.</p>
          )}
        </div>
      </div>

      {/* 협상 카드 목록 */}
      {negotiationCards.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">🃏 협상 카드 목록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {negotiationCards.map((card, index) => (
              <div key={card.issueId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(card.category)}`}>
                    {getCategoryName(card.category)}
                  </span>
                  <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{card.issueName}</h3>
                <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  <strong>법적 근거:</strong> {card.legalBasis}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  <strong>제안 행동:</strong> {card.suggestedAction}
                </div>
                <div className="text-xs text-gray-500">
                  <strong>우선순위 점수:</strong> {card.priority}점
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 협상 시나리오 */}
      {scenario && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 협상 전략 시나리오</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{scenario}</pre>
          </div>
        </div>
      )}

      {/* 협상 성공 확률 */}
      {successRate > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🎯 협상 성공 확률</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {successRate.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {successRate >= 80 ? '매우 높은 성공 확률' : 
               successRate >= 60 ? '높은 성공 확률' : 
               successRate >= 40 ? '보통 성공 확률' : '낮은 성공 확률'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}