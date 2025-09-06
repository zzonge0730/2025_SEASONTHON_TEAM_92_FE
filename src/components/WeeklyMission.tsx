import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { missionApi } from '../lib/api';

interface WeeklyMissionProps {
  currentUser: User;
}

interface MissionQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  weight: number;
  category: string;
}

interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: MissionQuestion[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  participantCount: number;
}

interface MissionResult {
  userScore: number;
  buildingAverage: number;
  neighborhoodAverage: number;
  buildingRank: number;
  neighborhoodRank: number;
  buildingParticipantCount: number;
  neighborhoodParticipantCount: number;
  missionTitle: string;
  category: string;
  submittedAt: string;
}

export default function WeeklyMission({ currentUser }: WeeklyMissionProps) {
  const [mission, setMission] = useState<WeeklyMission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  useEffect(() => {
    loadCurrentMission();
  }, []);

  const loadCurrentMission = async () => {
    try {
      setIsLoading(true);
      const response = await missionApi.getCurrentMission();
      
      if (response.ok) {
        setMission(response.data);
      } else {
        toast.error('주간 미션을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error loading mission:', error);
      toast.error('주간 미션을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!mission) return;

    try {
      setIsParticipating(true);
      
      // 답변 데이터 준비
      const answers: { [key: string]: string } = {};
      mission.questions.forEach(question => {
        if (data[question.id]) {
          answers[question.id] = data[question.id];
        }
      });

      console.log('🎯 주간 미션 참여 시작:', answers);

      const resultData = await missionApi.participateInMission(answers);

      if (resultData.ok) {
        setResult(resultData.data);
        toast.success('주간 미션 참여 완료! 결과를 확인해보세요.');
      } else {
        toast.error(resultData.message || '미션 참여에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error participating in mission:', error);
      toast.error('미션 참여 중 오류가 발생했습니다.');
    } finally {
      setIsParticipating(false);
    }
  };

  const handleNext = () => {
    if (mission && currentStep < mission.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetMission = () => {
    setResult(null);
    setCurrentStep(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주간 미션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">현재 진행 중인 주간 미션이 없습니다</h2>
          <p className="text-gray-600">다음 주간 미션을 기다려주세요!</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">미션 완료! 🎉</h1>
              <p className="text-gray-600">{result.missionTitle}</p>
              <p className="text-sm text-gray-500 mt-2">참여 시간: {result.submittedAt}</p>
            </div>

            {/* 결과 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{result.userScore}</div>
                <div className="text-sm text-blue-800">내 점수</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{result.buildingAverage}</div>
                <div className="text-sm text-green-800">우리 건물 평균</div>
                <div className="text-xs text-green-600 mt-1">({result.buildingParticipantCount}명 참여)</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{result.neighborhoodAverage}</div>
                <div className="text-sm text-purple-800">우리 동네 평균</div>
                <div className="text-xs text-purple-600 mt-1">({result.neighborhoodParticipantCount}명 참여)</div>
              </div>
            </div>

            {/* 순위 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 우리 건물 순위</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{result.buildingRank}위</div>
                  <div className="text-sm text-gray-600">총 {result.buildingParticipantCount}명 중</div>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏘️ 우리 동네 순위</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{result.neighborhoodRank}위</div>
                  <div className="text-sm text-gray-600">총 {result.neighborhoodParticipantCount}명 중</div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="text-center">
              <button
                onClick={resetMission}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                다른 미션 참여하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = mission.questions[currentStep];
  const progress = ((currentStep + 1) / mission.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{mission.title}</h1>
            <p className="text-gray-600 mb-4">{mission.description}</p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span>📅 {mission.startDate} ~ {mission.endDate}</span>
              <span>👥 {mission.participantCount}명 참여</span>
            </div>
          </div>

          {/* 진행률 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">진행률</span>
              <span className="text-sm text-gray-500">{currentStep + 1} / {mission.questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 질문 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      value={option}
                      {...register(currentQuestion.id, { required: '답변을 선택해주세요' })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              
              {errors[currentQuestion.id] && (
                <p className="mt-2 text-sm text-red-600">{errors[currentQuestion.id]?.message}</p>
              )}
            </div>

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              {currentStep === mission.questions.length - 1 ? (
                <button
                  type="submit"
                  disabled={isParticipating}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParticipating ? '제출 중...' : '완료하기'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  다음
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}