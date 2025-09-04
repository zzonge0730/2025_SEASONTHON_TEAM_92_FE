import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tenantApi } from '../lib/api';
import { Tenant, User } from '../types';
import OnboardingProgress from '../components/OnboardingProgress';

interface TenantFormProps {
  currentUser: User;
  onComplete?: (updatedUser: User) => void;
}

export default function TenantForm({ currentUser, onComplete }: TenantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<Tenant>({
    defaultValues: {
      buildingName: currentUser.buildingName || '',
      neighborhood: currentUser.neighborhood || '',
      city: currentUser.address || '서울',
      streetAddress: currentUser.address || ''
    }
  });

  const consentValue = watch('consentYesNo');

  const onSubmit = async (data: Tenant) => {
    if (!data.consentYesNo) {
      toast.error('정보 제공에 동의해주세요');
      return;
    }

    // Add userId to the tenant data
    const tenantData = {
      ...data,
      userId: currentUser.id
    };

    setIsSubmitting(true);
    try {
      const response = await tenantApi.createTenant(tenantData);
      if (response.ok) {
        toast.success('정보가 성공적으로 제출되었습니다!');
        
        // Update user profile completion status
        const updatedUser = {
          ...currentUser,
          profileCompleted: true
        };
        
        if (onComplete) {
          onComplete(updatedUser);
        } else {
          navigate('/');
        }
      } else {
        toast.error(response.message || '정보 제출에 실패했습니다');
      }
    } catch (error) {
      console.error('Error submitting tenant data:', error);
      toast.error('정보 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <OnboardingProgress 
          currentStep={2} 
          totalSteps={3} 
          stepNames={['위치 인증', '프로필 입력', '진단 시작']} 
        />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            STEP 1-3: 거주 프로필 입력
          </h1>
          <p className="text-sm text-gray-600">
            리포트 생성을 위한 핵심 정보를 입력해주세요
          </p>
          {currentUser.buildingName && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ 위치 인증이 완료되어 건물명과 주소가 자동으로 입력되었습니다. 필요시 수정하실 수 있습니다.
              </p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Building Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">건물 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                건물명 *
                {currentUser.buildingName && (
                  <span className="ml-2 text-xs text-green-600">✓ 위치 인증으로 자동 입력됨</span>
                )}
              </label>
              <input
                {...register('buildingName', { required: '건물명을 입력해주세요' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="예: 행복아파트"
              />
              {errors.buildingName && (
                <p className="mt-1 text-sm text-red-600">{errors.buildingName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                건물 유형 *
              </label>
              <select
                {...register('buildingType', { required: '건물 유형을 선택해주세요' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">건물 유형을 선택하세요</option>
                <option value="apartment">아파트</option>
                <option value="officetel">오피스텔</option>
                <option value="villa">빌라</option>
              </select>
              {errors.buildingType && (
                <p className="mt-1 text-sm text-red-600">{errors.buildingType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                도로명 주소 *
                {currentUser.address && (
                  <span className="ml-2 text-xs text-green-600">✓ 위치 인증으로 자동 입력됨</span>
                )}
              </label>
              <input
                {...register('streetAddress', { required: '도로명 주소를 입력해주세요' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="예: 울산 중구 성남동 123-45"
              />
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  동/읍/면 *
                  {currentUser.neighborhood && (
                    <span className="ml-2 text-xs text-green-600">✓ 자동 입력됨</span>
                  )}
                </label>
                <input
                  {...register('neighborhood', { required: '동/읍/면을 입력해주세요' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="예: 성남동"
                />
                {errors.neighborhood && (
                  <p className="mt-1 text-sm text-red-600">{errors.neighborhood.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  시/구 *
                  {currentUser.address && (
                    <span className="ml-2 text-xs text-green-600">✓ 자동 입력됨</span>
                  )}
                </label>
                <input
                  {...register('city', { required: '시/구를 입력해주세요' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="예: 울산 중구"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  건물 유형 *
                </label>
                <select
                  {...register('buildingType', { required: '건물 유형을 선택해주세요' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">건물 유형을 선택하세요</option>
                  <option value="apartment">아파트</option>
                  <option value="officetel">오피스텔</option>
                  <option value="villa">빌라</option>
                </select>
                {errors.buildingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.buildingType.message}</p>
                )}
              </div>
              
            </div>
          </div>

          {/* 계약 정보 */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">계약 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                계약 유형 *
              </label>
              <select
                {...register('contractType', { required: '계약 유형을 선택해주세요' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">계약 유형을 선택하세요</option>
                <option value="monthly">월세</option>
                <option value="yearly">전세</option>
              </select>
              {errors.contractType && (
                <p className="mt-1 text-sm text-red-600">{errors.contractType.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  현재 월세 (원) *
                </label>
                <input
                  type="number"
                  {...register('currentRentKrw', { 
                    required: '현재 월세를 입력해주세요',
                    min: { value: 1, message: '월세는 0보다 커야 합니다' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="750000"
                />
                {errors.currentRentKrw && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentRentKrw.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보증금 (원) *
                </label>
                <input
                  type="number"
                  {...register('depositKrw', { 
                    required: '보증금을 입력해주세요',
                    min: { value: 1, message: '보증금은 0보다 커야 합니다' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="5000000"
                />
                {errors.depositKrw && (
                  <p className="mt-1 text-sm text-red-600">{errors.depositKrw.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                관리비 (원) - 선택사항
              </label>
              <input
                type="number"
                {...register('maintenanceFee', { 
                  min: { value: 0, message: '관리비는 0 이상이어야 합니다' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="100000"
              />
              {errors.maintenanceFee && (
                <p className="mt-1 text-sm text-red-600">{errors.maintenanceFee.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                임대 종료일 *
              </label>
              <input
                type="text"
                {...register('leaseEndYyyyMm', { 
                  required: '임대 종료일을 입력해주세요',
                  pattern: {
                    value: /^\d{4}-\d{2}$/,
                    message: '날짜는 YYYY-MM 형식으로 입력해주세요'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="2025-12"
              />
              {errors.leaseEndYyyyMm && (
                <p className="mt-1 text-sm text-red-600">{errors.leaseEndYyyyMm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                최근 인상 통지율 % (선택사항)
              </label>
              <input
                type="number"
                {...register('increaseNoticePctOptional', { 
                  min: { value: 0, message: '비율은 0 이상이어야 합니다' },
                  max: { value: 100, message: '비율은 100을 초과할 수 없습니다' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="5"
              />
              {errors.increaseNoticePctOptional && (
                <p className="mt-1 text-sm text-red-600">{errors.increaseNoticePctOptional.message}</p>
              )}
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">추가 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                집주인 이메일 (선택사항)
              </label>
              <input
                type="email"
                {...register('landlordEmailOptional')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                불만사항 (선택사항)
              </label>
              <textarea
                {...register('painPointsFreeText')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="예: 엘리베이터 고장, 통지 기간이 짧음"
              />
            </div>
          </div>

          {/* 동의 */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  {...register('consentYesNo', { required: '동의가 필요합니다' })}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  공동 협상을 위해 월세 정보 공유에 동의합니다 *
                </label>
                {errors.consentYesNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.consentYesNo.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !consentValue}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '정보 제출'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}