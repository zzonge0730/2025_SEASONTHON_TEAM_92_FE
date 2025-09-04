import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LandlordVerification as LandlordVerificationType, User } from '../types';
import { landlordApi } from '../lib/api';

interface LandlordVerificationProps {
  currentUser: User;
  onVerificationComplete: () => void;
}

interface VerificationFormData {
  businessRegistrationNumber: string;
  propertyAddresses: string;
  verificationDocuments: string;
}

export default function LandlordVerification({ currentUser, onVerificationComplete }: LandlordVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<VerificationFormData>();

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    try {
      const verification: LandlordVerificationType = {
        userId: currentUser.id || '',
        businessRegistrationNumber: data.businessRegistrationNumber,
        propertyAddresses: data.propertyAddresses.split('\n').filter(addr => addr.trim()),
        verificationDocuments: data.verificationDocuments.split('\n').filter(doc => doc.trim()),
        status: 'pending'
      };

      const response = await landlordApi.submitVerification(verification);
      if (response.ok) {
        toast.success('집주인 인증 신청이 제출되었습니다!');
        setVerificationStatus('pending');
        onVerificationComplete();
      } else {
        toast.error(response.message || '인증 신청에 실패했습니다');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('인증 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            집주인 인증
          </h1>
          <p className="text-gray-600">
            집주인으로 인증받으시면 세입자들과 직접 소통하고 제안서에 응답할 수 있습니다.
          </p>
        </div>

        {verificationStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-medium">인증 심사 중</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              제출하신 서류를 검토 중입니다. 1-2 영업일 내에 결과를 알려드리겠습니다.
            </p>
          </div>
        )}

        {verificationStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">인증 완료</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              집주인 인증이 완료되었습니다. 이제 세입자들과 소통할 수 있습니다.
            </p>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">인증 거부</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              제출하신 서류에 문제가 있습니다. 다시 신청해주세요.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 사업자 등록번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자 등록번호 *
            </label>
            <input
              {...register('businessRegistrationNumber', { 
                required: '사업자 등록번호를 입력해주세요',
                pattern: {
                  value: /^\d{3}-\d{2}-\d{5}$/,
                  message: '사업자 등록번호는 000-00-00000 형식으로 입력해주세요'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="123-45-67890"
            />
            {errors.businessRegistrationNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.businessRegistrationNumber.message}</p>
            )}
          </div>

          {/* 소유 건물 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소유 건물 주소 *
            </label>
            <textarea
              {...register('propertyAddresses', { 
                required: '소유 건물 주소를 입력해주세요',
                minLength: { value: 10, message: '주소를 정확히 입력해주세요' }
              })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="각 주소를 새 줄로 구분하여 입력하세요&#10;예:&#10;서울시 강남구 테헤란로 123&#10;서울시 서초구 서초대로 456"
            />
            {errors.propertyAddresses && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyAddresses.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              소유하고 계신 건물의 주소를 모두 입력해주세요. 각 주소는 새 줄로 구분해주세요.
            </p>
          </div>

          {/* 인증 서류 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              인증 서류 (선택사항)
            </label>
            <textarea
              {...register('verificationDocuments')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="제출하신 서류 목록을 입력하세요&#10;예:&#10;부동산 등기부등본&#10;사업자등록증&#10;임대차계약서"
            />
            <p className="mt-1 text-xs text-gray-500">
              제출하신 서류 목록을 입력해주세요. (부동산 등기부등본, 사업자등록증 등)
            </p>
          </div>

          {/* 안내사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">인증 안내사항</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 사업자 등록번호는 정확히 입력해주세요</li>
              <li>• 소유 건물 주소는 등기부등본과 일치해야 합니다</li>
              <li>• 인증 완료 후 세입자들과 직접 소통할 수 있습니다</li>
              <li>• 제출된 정보는 인증 목적으로만 사용됩니다</li>
            </ul>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '인증 신청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}