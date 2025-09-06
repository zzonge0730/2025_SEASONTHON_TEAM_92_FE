import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';

interface VoteCreationProps {
  currentUser: User;
  onClose: () => void;
  onVoteCreated?: () => void;
}

interface VoteFormData {
  title: string;
  description: string;
  options: string[];
  deadline: string;
  isAnonymous: boolean;
}

export default function VoteCreation({ currentUser, onClose, onVoteCreated }: VoteCreationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<VoteFormData>({
    defaultValues: {
      isAnonymous: false,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 7일 후
    }
  });

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onSubmit = async (data: VoteFormData) => {
    // 빈 옵션 제거
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (validOptions.length < 2) {
      toast.error('최소 2개의 선택지를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const voteData = {
        ...data,
        options: validOptions,
        createdBy: currentUser.id,
        buildingName: currentUser.buildingName,
        neighborhood: currentUser.neighborhood,
        status: 'active'
      };

      console.log('🗳️ 투표 생성:', voteData);

      const response = await fetch('http://localhost:8891/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(voteData)
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('투표가 성공적으로 생성되었습니다!');
        onVoteCreated?.();
        onClose();
      } else {
        toast.error(result.message || '투표 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating vote:', error);
      toast.error('투표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">새 투표 만들기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 투표 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                투표 제목 *
              </label>
              <input
                {...register('title', { required: '투표 제목을 입력해주세요.' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 월세 인상 상한선 설정"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 투표 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                투표 설명
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="투표에 대한 자세한 설명을 입력해주세요."
              />
            </div>

            {/* 선택지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택지 * (최소 2개, 최대 6개)
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`선택지 ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  + 선택지 추가
                </button>
              )}
            </div>

            {/* 투표 마감일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                투표 마감일 *
              </label>
              <input
                {...register('deadline', { required: '투표 마감일을 설정해주세요.' })}
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            {/* 익명 투표 여부 */}
            <div className="flex items-center">
              <input
                {...register('isAnonymous')}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                익명 투표로 진행
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? '생성 중...' : '투표 생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}