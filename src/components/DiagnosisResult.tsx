import { ComprehensiveDiagnosis } from '../types';

interface DiagnosisResultProps {
  result: ComprehensiveDiagnosis;
  onGenerateReport: () => void;
}

export default function DiagnosisResult({ result, onGenerateReport }: DiagnosisResultProps) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 전체 점수 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">우리 집 종합 점수</h2>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
            {result.overallScore}점
          </div>
          <p className="text-lg text-gray-600 mt-2">{getScoreLabel(result.overallScore)}</p>
        </div>
      </div>

      {/* 카테고리별 점수 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">카테고리별 점수</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.categoryScores).map(([category, score]) => (
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
        {/* 같은 건물 비교 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏢 같은 건물 비교</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">평균 점수:</span>
              <span className="font-semibold">{result.buildingComparison.averageScore}점</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">참여자 수:</span>
              <span className="font-semibold">{result.buildingComparison.participantCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">순위:</span>
              <span className="font-semibold">{result.buildingComparison.rank}위</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상위:</span>
              <span className="font-semibold">{result.buildingComparison.percentile}%</span>
            </div>
          </div>
        </div>

        {/* 같은 동네 비교 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏘️ 같은 동네 비교</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">평균 점수:</span>
              <span className="font-semibold">{result.neighborhoodComparison.averageScore}점</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">참여자 수:</span>
              <span className="font-semibold">{result.neighborhoodComparison.participantCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">순위:</span>
              <span className="font-semibold">{result.neighborhoodComparison.rank}위</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상위:</span>
              <span className="font-semibold">{result.neighborhoodComparison.percentile}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 추천사항 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 개선 추천사항</h3>
        <ul className="space-y-2">
          {result.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3"></span>
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 리포트 생성 버튼 */}
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 협상 리포트 생성</h3>
        <p className="text-gray-600 mb-4">
          진단 결과를 바탕으로 임대인과의 협상을 위한 상세한 리포트를 생성할 수 있습니다.
        </p>
        <button
          onClick={onGenerateReport}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
        >
          리포트 생성하기
        </button>
      </div>
    </div>
  );
}