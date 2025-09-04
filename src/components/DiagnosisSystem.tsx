import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { DiagnosisQuestion, User } from '../types';
import { tenantApi, diagnosisApi } from '../lib/api';

interface DiagnosisSystemProps {
  currentUser: User;
  onComplete: () => void; // Changed to just signal completion
}

interface DiagnosisFormData {
  [questionId: string]: string;
}

const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  // 소음 관련
  {
    id: 'noise_level',
    category: 'noise',
    question: '옆집 생활 소음(대화, TV 소리)이 들리는 편인가요?',
    options: ['전혀 안 들림', '가끔 들림', '자주 들림', '매우 자주 들림'],
  },
  {
    id: 'noise_interfloor',
    category: 'noise',
    question: '층간소음으로 불편을 겪은 적이 있나요?',
    options: ['없음', '월 1-2회', '주 1-2회', '거의 매일'],
  },
  // 수압 관련
  {
    id: 'water_pressure',
    category: 'water',
    question: '샤워기나 세면대의 수압은 만족스러우신가요?',
    options: ['매우 강함', '적당함', '약함', '매우 약함'],
  },
  // 채광 관련
  {
    id: 'sunlight',
    category: 'lighting',
    question: '자연 채광이 충분한 편인가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
  },
   // 주차 관련
  {
    id: 'parking',
    category: 'parking',
    question: '거주자 우선 주차 공간은 충분한가요?',
    options: ['매우 충분함', '충분함', '부족함', '매우 부족함'],
  },
  // 난방 관련
  {
    id: 'heating',
    category: 'heating',
    question: '겨울철 난방은 잘 되는 편인가요?',
    options: ['매우 잘 됨', '잘 됨', '부족함', '매우 부족함'],
  },
  // 보안 관련
  {
    id: 'security',
    category: 'security',
    question: '건물 공동현관 및 CCTV 등 보안 상태는 어떻다고 느끼시나요?',
    options: ['매우 안전함', '안전함', '불안함', '매우 불안함'],
  },
];

export default function DiagnosisSystem({ currentUser, onComplete }: { currentUser: User, onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<DiagnosisFormData>({});

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<DiagnosisFormData>();

  const currentQuestion = DIAGNOSIS_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / DIAGNOSIS_QUESTIONS.length) * 100;

  const getScoreFromAnswer = (answer: string): number => {
      const scoreMap: { [key: string]: number } = {
        '전혀 안 들림': 4, '없음': 4, '매우 강함': 4, '매우 충분함': 4, '매우 잘 됨': 4, '매우 안전함': 4,
        '가끔 들림': 3, '월 1-2회': 3, '적당함': 3, '충분함': 3, '잘 됨': 3, '안전함': 3,
        '자주 들림': 2, '주 1-2회': 2, '약함': 2, '부족함': 2, '불안함': 2,
        '매우 자주 들림': 1, '거의 매일': 1, '매우 약함': 1, '매우 부족함': 1, '매우 불안함': 1
      };
      return scoreMap[answer] || 2; // Default to a neutral score
  };

  const finalSubmit = async () => {
    if (!currentUser.id || !currentUser.buildingName || !currentUser.neighborhood) {
        toast.error('사용자 정보가 필요합니다. 다시 로그인해주세요.');
        return;
    }

    setIsSubmitting(true);
    try {
        const responsesToSubmit = Object.entries(answers).map(([questionId, answer]) => ({
            userId: currentUser.id,
            buildingName: currentUser.buildingName,
            neighborhood: currentUser.neighborhood,
            questionId: questionId,
            answerValue: getScoreFromAnswer(answer),
        }));

        await diagnosisApi.submitBulk(responsesToSubmit);

        toast.success('진단이 완료되었습니다! 결과를 확인하세요.');
        onComplete();

    } catch (error) {
      console.error('Diagnosis submission error:', error);
      toast.error('진단 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
        toast.error('답변을 선택해주세요.');
        return;
    }
    if (currentStep < DIAGNOSIS_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
        // Last question, move to final submission view
        setCurrentStep(currentStep + 1);
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

  // Final confirmation screen after the last question
  if (currentStep >= DIAGNOSIS_QUESTIONS.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">진단 완료!</h2>
          <p className="text-gray-600 mb-6">모든 질문에 답변해주셔서 감사합니다. 아래 버튼을 눌러 최종 제출하고 결과를 확인하세요.</p>
          <button
            onClick={finalSubmit}
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? '결과 생성 중...' : '진단 결과 확인하기'}
          </button>
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

        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer border" onClick={() => handleAnswerChange(currentQuestion.id, option)}>
                  <input
                    type="radio"
                    value={option}
                    name={currentQuestion.id}
                    checked={answers[currentQuestion.id] === option}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === DIAGNOSIS_QUESTIONS.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
