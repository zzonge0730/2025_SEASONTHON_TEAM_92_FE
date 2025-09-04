import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AnonymousReportProps {
  onReportSubmitted?: () => void;
}

interface ReportFormData {
  buildingName: string;
  report: string;
  neighborhood?: string;
  city?: string;
}

const AnonymousReport: React.FC<AnonymousReportProps> = ({ onReportSubmitted }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReportFormData>();

  const onSubmit = async (data: ReportFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reports/anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('익명 신고가 성공적으로 제출되었습니다!');
        reset();
        onReportSubmitted?.();
      } else {
        toast.error(result.message || '신고 제출에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Report submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          익명 신고하기
        </h3>
        <p className="text-sm text-gray-600">
          건물 문제, 집주인 관행 또는 기타 우려사항에 대한 정보를 공유하세요. 
          귀하의 신원은 익명으로 유지됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700">
            건물명 *
          </label>
          <input
            {...register('buildingName', { required: '건물명을 입력해주세요' })}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="건물명을 입력하세요"
          />
          {errors.buildingName && (
            <p className="mt-1 text-sm text-red-600">{errors.buildingName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
            동/읍/면
          </label>
          <input
            {...register('neighborhood')}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter neighborhood (optional)"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            {...register('city')}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter city (optional)"
          />
        </div>

        <div>
          <label htmlFor="report" className="block text-sm font-medium text-gray-700">
            Report Details *
          </label>
          <textarea
            {...register('report', { 
              required: 'Report details are required',
              maxLength: {
                value: 1000,
                message: 'Report must be less than 1000 characters'
              }
            })}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the issue or concern..."
          />
          {errors.report && (
            <p className="mt-1 text-sm text-red-600">{errors.report.message}</p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Privacy Notice:</strong> This report is completely anonymous. 
                No personal information is collected or stored.
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Anonymous Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnonymousReport;
