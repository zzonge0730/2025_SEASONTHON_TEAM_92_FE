import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { DiagnosisQuestion, ComprehensiveDiagnosis, User } from '../types';
import { diagnosisApi } from '../lib/api';

interface DiagnosisSystemProps {
  currentUser: User;
  onComplete: (result: ComprehensiveDiagnosis) => void;
}

interface DiagnosisFormData {
  [questionId: string]: string;
}

const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  // 소음 관련
  {
    id: 'noise_1',
    category: 'noise',
    question: '옆집 생활 소음(대화, TV 소리)이 들리는 편인가요?',
    options: ['전혀 안 들림', '가끔 들림', '자주 들림', '매우 자주 들림'],
    weight: 3
  },
  {
    id: 'noise_2',
    category: 'noise',
    question: '층간소음으로 불편을 겪은 적이 있나요?',
    options: ['없음', '1-2번', '3-5번', '매우 자주'],
    weight: 4
  },
  {
    id: 'noise_3',
    category: 'noise',
    question: '외부 소음(도로, 공사 등)이 들리는 편인가요?',
    options: ['전혀 안 들림', '가끔 들림', '자주 들림', '매우 자주 들림'],
    weight: 2
  },

  // 수압 관련
  {
    id: 'water_1',
    category: 'water_pressure',
    question: '물압이 충분한 편인가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
    weight: 3
  },
  {
    id: 'water_2',
    category: 'water_pressure',
    question: '물 온도가 일정하게 유지되나요?',
    options: ['매우 일정함', '대체로 일정함', '가끔 변함', '자주 변함'],
    weight: 2
  },

  // 채광 관련
  {
    id: 'lighting_1',
    category: 'lighting',
    question: '자연 채광이 충분한 편인가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
    weight: 3
  },
  {
    id: 'lighting_2',
    category: 'lighting',
    question: '실내 조명이 충분한가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
    weight: 2
  },

  // 주차 관련
  {
    id: 'parking_1',
    category: 'parking',
    question: '주차 공간이 충분한가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
    weight: 3
  },
  {
    id: 'parking_2',
    category: 'parking',
    question: '주차비가 합리적인가요?',
    options: ['매우 합리적', '합리적', '비쌈', '매우 비쌈'],
    weight: 2
  },

  // 난방 관련
  {
    id: 'heating_1',
    category: 'heating',
    question: '난방이 잘 되는 편인가요?',
    options: ['매우 잘 됨', '잘 됨', '부족함', '매우 부족함'],
    weight: 3
  },
  {
    id: 'heating_2',
    category: 'heating',
    question: '난방비가 합리적인가요?',
    options: ['매우 합리적', '합리적', '비쌈', '매우 비쌈'],
    weight: 2
  },

  // 보안 관련
  {
    id: 'security_1',
    category: 'security',
    question: '건물 보안이 안전한 편인가요?',
    options: ['매우 안전함', '안전함', '불안함', '매우 불안함'],
    weight: 4
  },
  {
    id: 'security_2',
    category: 'security',
    question: '출입문 보안이 잘 되어 있나요?',
    options: ['매우 잘 됨', '잘 됨', '부족함', '매우 부족함'],
    weight: 3
  },

  // 엘리베이터 관련
  {
    id: 'elevator_1',
    category: 'elevator',
    question: '엘리베이터가 잘 작동하나요?',
    options: ['매우 잘 됨', '잘 됨', '가끔 고장', '자주 고장'],
    weight: 2
  },

  // 기타 시설
  {
    id: 'facilities_1',
    category: 'facilities',
    question: '공용 시설(세탁실, 택배함 등)이 잘 관리되나요?',
    options: ['매우 잘 됨', '잘 됨', '부족함', '매우 부족함'],
    weight: 2
  }
];

export default function DiagnosisSystem({ currentUser, onComplete }: DiagnosisSystemProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<DiagnosisFormData>({});

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<DiagnosisFormData>();

  const currentQuestion = DIAGNOSIS_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / DIAGNOSIS_QUESTIONS.length) * 100;

  const onSubmit = async (data: DiagnosisFormData) => {
    setIsSubmitting(true);
    try {
      // 점수 계산
      const categoryScores = calculateCategoryScores(data);
      const overallScore = calculateOverallScore(categoryScores);

      // 실제 API에서 비교 데이터 가져오기
      const diagnosisResponses = Object.entries(data).map(([questionId, answer]) => ({
        questionId,
        answerValue: getScoreFromAnswer(answer),
        userId: currentUser.id || '',
        buildingName: currentUser.buildingName || '',
        neighborhood: currentUser.neighborhood || '',
        timestamp: new Date().toISOString()
      }));

      // 진단 응답 제출
      await diagnosisApi.submitBulk(diagnosisResponses);

      // 비교 통계 가져오기
      const comparisonStats = await diagnosisApi.getComparisonStats(currentUser.id || '');
      
      const buildingComparison = {
        averageScore: comparisonStats.ok ? comparisonStats.data?.buildingAverageScores?.overall || 75 : 75,
        participantCount: comparisonStats.ok ? comparisonStats.data?.buildingParticipantCount || 12 : 12,
        rank: 3, // TODO: 실제 순위 계산 로직 구현
        percentile: 75 // TODO: 실제 백분위 계산 로직 구현
      };

      const neighborhoodComparison = {
        averageScore: comparisonStats.ok ? comparisonStats.data?.neighborhoodAverageScores?.overall || 72 : 72,
        participantCount: comparisonStats.ok ? comparisonStats.data?.neighborhoodParticipantCount || 45 : 45,
        rank: 8, // TODO: 실제 순위 계산 로직 구현
        percentile: 82 // TODO: 실제 백분위 계산 로직 구현
      };

      // 추천사항 생성
      const recommendations = generateRecommendations(categoryScores);

      const result: ComprehensiveDiagnosis = {
        id: `diagnosis_${Date.now()}`,
        userId: currentUser.id || '',
        overallScore,
        categoryScores,
        buildingComparison,
        neighborhoodComparison,
        recommendations,
        createdAt: new Date().toISOString()
      };

      onComplete(result);
      toast.success('진단이 완료되었습니다!');
    } catch (error) {
      console.error('Diagnosis error:', error);
      toast.error('진단 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCategoryScores = (answers: DiagnosisFormData): { [category: string]: number } => {
    const categoryTotals: { [category: string]: { score: number; weight: number } } = {};

    DIAGNOSIS_QUESTIONS.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const score = getScoreFromAnswer(answer);
        if (!categoryTotals[question.category]) {
          categoryTotals[question.category] = { score: 0, weight: 0 };
        }
        categoryTotals[question.category].score += score * question.weight;
        categoryTotals[question.category].weight += question.weight;
      }
    });

    const categoryScores: { [category: string]: number } = {};
    Object.keys(categoryTotals).forEach(category => {
      categoryScores[category] = Math.round(
        (categoryTotals[category].score / categoryTotals[category].weight) * 25
      );
    });

    return categoryScores;
  };

  const calculateOverallScore = (categoryScores: { [category: string]: number }): number => {
    const scores = Object.values(categoryScores);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getScoreFromAnswer = (answer: string): number => {
    const scoreMap: { [key: string]: number } = {
      '전혀 안 들림': 4, '매우 충분함': 4, '매우 일정함': 4, '매우 안전함': 4, '매우 잘 됨': 4, '매우 합리적': 4,
      '가끔 들림': 3, '충분함': 3, '대체로 일정함': 3, '안전함': 3, '잘 됨': 3, '합리적': 3,
      '자주 들림': 2, '부족함': 2, '가끔 변함': 2, '불안함': 2, '비쌈': 2,
      '매우 자주 들림': 1, '매우 부족함': 1, '자주 변함': 1, '매우 불안함': 1, '매우 비쌈': 1,
      '없음': 4, '1-2번': 3, '3-5번': 2, '매우 자주': 1, '가끔 고장': 2, '자주 고장': 1
    };
    return scoreMap[answer] || 2;
  };

  const generateRecommendations = (categoryScores: { [category: string]: number }): string[] => {
    const recommendations: string[] = [];
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 60) {
        switch (category) {
          case 'noise':
            recommendations.push('소음 문제가 심각합니다. 방음 시설 개선을 요구해보세요.');
            break;
          case 'water_pressure':
            recommendations.push('수압 문제가 있습니다. 급수 시설 점검을 요청해보세요.');
            break;
          case 'lighting':
            recommendations.push('채광이 부족합니다. 조명 시설 개선을 제안해보세요.');
            break;
          case 'parking':
            recommendations.push('주차 공간이 부족합니다. 주차비 할인이나 대안을 요구해보세요.');
            break;
          case 'heating':
            recommendations.push('난방 시설 개선이 필요합니다. 보일러 점검을 요청해보세요.');
            break;
          case 'security':
            recommendations.push('보안 시설 강화가 필요합니다. CCTV나 출입 시스템 개선을 요구해보세요.');
            break;
        }
      }
    });

    return recommendations.length > 0 ? recommendations : ['전반적으로 양호한 상태입니다.'];
  };

  const handleNext = () => {
    if (currentStep < DIAGNOSIS_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 완료 처리
      onSubmit(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setValue(questionId, answer);
  };

  if (currentStep >= DIAGNOSIS_QUESTIONS.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">진단 완료!</h2>
            <p className="text-gray-600 mb-6">모든 질문에 답변해주셔서 감사합니다.</p>
            <button
              onClick={() => onSubmit(answers)}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? '결과 생성 중...' : '진단 결과 확인하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">우리 집 종합 진단</h2>
            <span className="text-sm text-gray-500">{currentStep + 1} / {DIAGNOSIS_QUESTIONS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    value={option}
                    {...register(currentQuestion.id, { required: '답변을 선택해주세요' })}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            
            {errors[currentQuestion.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[currentQuestion.id]?.message}</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === DIAGNOSIS_QUESTIONS.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}