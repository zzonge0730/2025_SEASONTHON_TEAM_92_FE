import React from 'react';

const NegotiationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          협상 근거 가이드
        </h1>

        {/* 법적 근거 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📚 법적 근거</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">임차인 보호법</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>임차인 보호법 제3조: 임차인의 권리 보호</li>
              <li>주택임대차보호법: 월세 상한제 및 갱신 요구권</li>
              <li>상가건물 임대차보호법: 상가 임차인 보호</li>
            </ul>
          </div>
        </div>

        {/* 시장 데이터 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 시장 데이터 활용</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">공공 데이터 활용</h3>
            <ul className="list-disc list-inside text-green-800 space-y-1">
              <li>국토교통부 실거래가 공개시스템 데이터</li>
              <li>한국부동산원 전월세 실거래가</li>
              <li>지역별 평균 임대료 비교</li>
              <li>인근 지역 임대료 동향 분석</li>
            </ul>
          </div>
        </div>

        {/* 협상 전략 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 협상 전략</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">준비 단계</h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                <li>시장 데이터 수집 및 분석</li>
                <li>같은 건물 세입자들과 연대</li>
                <li>합리적인 요구사항 정리</li>
                <li>대안 제시 준비</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-2">협상 단계</h3>
              <ul className="list-disc list-inside text-purple-800 space-y-1 text-sm">
                <li>정중하고 전문적인 태도</li>
                <li>구체적인 데이터 제시</li>
                <li>상호 이익이 되는 방안 제안</li>
                <li>서면으로 합의사항 정리</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 권리 정보 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚖️ 임차인 권리</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">기본 권리</h3>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>갱신 요구권: 계약 갱신 시 우선권</li>
              <li>차임 증액 제한: 5% 상한 (주택임대차보호법)</li>
              <li>보증금 반환 청구권</li>
              <li>수선 의무 이행 요구권</li>
              <li>안전한 주거환경 보장권</li>
            </ul>
          </div>
        </div>

        {/* 협상 템플릿 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 협상 템플릿</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">제안서 구성 요소</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>인사말 및 협상 목적 명시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>현재 상황 및 문제점 제시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>시장 데이터 기반 합리적 요구사항</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <span>상호 이익이 되는 대안 제시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">5.</span>
                <span>협력적 해결 방안 제안</span>
              </div>
            </div>
          </div>
        </div>

        {/* 유용한 링크 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔗 유용한 링크</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <ul className="space-y-2 text-indigo-800">
              <li>
                <a 
                  href="https://rt.molit.go.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  국토교통부 실거래가 공개시스템
                </a>
              </li>
              <li>
                <a 
                  href="https://www.reb.or.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  한국부동산원
                </a>
              </li>
              <li>
                <a 
                  href="https://www.law.go.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  국가법령정보센터
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">⚠️ 주의사항</h3>
          <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
            <li>모든 협상은 정중하고 합리적인 방식으로 진행하세요</li>
            <li>법적 근거는 정확한 정보를 바탕으로 제시하세요</li>
            <li>서면으로 합의사항을 정리하고 보관하세요</li>
            <li>필요시 전문가(변호사, 부동산 전문가) 상담을 받으세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NegotiationGuide;
