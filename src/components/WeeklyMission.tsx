import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { WeeklyMission, MissionParticipation, User } from '../types';

interface WeeklyMissionProps {
  currentUser: User;
  onComplete: (participation: MissionParticipation) => void;
}

interface MissionFormData {
  [questionId: string]: string;
}

// 주간 미션 데이터 (실제로는 API에서 가져와야 함)
const CURRENT_MISSION: WeeklyMission = {
  id: 'mission_1',
  title: '방음 상태 점검',
  description: '이번 주는 우리 집의 방음 상태를 자세히 점검해보세요.',
  questions: [
    {
      id: 'mission_noise_1',
      category: 'noise',
      question: '옆집 생활 소음(대화, TV 소리)이 들리는 편인가요?',
      options: ['전혀 안 들림', '가끔 들림', '자주 들림', '매우 자주 들림'],
      weight: 3
    },
    {
      id: 'mission_noise_2',
      category: 'noise',
      question: '최근 1달 내 층간소음으로 불편을 겪은 적이 있나요?',
      options: ['없음', '1~2번', '3번 이상'],
      weight: 4
    },
    {
      id: 'mission_noise_3',
      category: 'noise',
      question: '방음 시설(벽지, 창문 등)이 잘 되어 있다고 생각하시나요?',
      options: ['매우 잘 됨', '잘 됨', '부족함', '매우 부족함'],
      weight: 3
    }
  ],
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true
};

export default function WeeklyMission({ currentUser, onComplete }: WeeklyMissionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<MissionFormData>({});
  const [mission] = useState<WeeklyMission>(CURRENT_MISSION);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<MissionFormData>();

  const currentQuestion = mission.questions[currentStep];
  const progress = ((currentStep + 1) / mission.questions.length) * 100;

  const onSubmit = async (data: MissionFormData) => {
    setIsSubmitting(true);
    try {
      const participation: MissionParticipation = {
        id: `participation_${Date.now()}`,
        userId: currentUser.id || '',
        missionId: mission.id,
        answers: data,
        completedAt: new Date().toISOString()
      };

      onComplete(participation);
      toast.success('주간 미션이 완료되었습니다!');
    } catch (error) {
      console.error('Mission completion error:', error);
      toast.error('미션 완료 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < mission.questions.length - 1) {
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

  if (currentStep >= mission.questions.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">미션 완료!</h2>
            <p className="text-gray-600 mb-6">이번 주 미션을 성공적으로 완료했습니다.</p>
            <button
              onClick={() => onSubmit(answers)}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? '결과 확인 중...' : '결과 확인하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        {/* 미션 헤더 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              주간 미션
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{mission.title}</h2>
          <p className="text-gray-600 text-sm">{mission.description}</p>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">진행률</span>
            <span className="text-sm text-gray-500">{currentStep + 1} / {mission.questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === mission.questions.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}