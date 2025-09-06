import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { tenantApi, authApi } from '../lib/api';
import { Tenant, User } from '../types';

interface TenantFormProps {
  currentUser: User;
  onComplete?: (updatedUser: User) => void;
  onGoHome?: () => void;
}

export default function TenantForm({ currentUser, onComplete, onGoHome }: TenantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<Tenant>({
    defaultValues: {
      buildingName: currentUser.buildingName || '',
      neighborhood: currentUser.neighborhood || '',
      city: currentUser.address || '서울',
      streetAddress: currentUser.address || '',
      buildingType: undefined as 'apartment' | 'officetel' | 'villa' | undefined,
      contractType: undefined as 'monthly' | 'yearly' | undefined,
      depositKrw: 0,
      currentRentKrw: 0,
      maintenanceFee: 0,
      leaseEndYyyyMm: '',
      consentYesNo: false
    }
  });

  const buildingTypes = [
    { value: 'apartment', label: '아파트' },
    { value: 'officetel', label: '오피스텔' },
    { value: 'villa', label: '빌라/연립' }
  ];

  const contractTypes = [
    { value: 'monthly', label: '월세' },
    { value: 'yearly', label: '연세' }
  ];


  const handleNumberChange = (field: string, value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setValue(field as keyof Tenant, numericValue as any);
  };

  const isFormValid = () => {
    const values = watch();
    return values.buildingName && 
           values.buildingType && 
           values.contractType && 
           values.depositKrw && 
           values.currentRentKrw &&
           values.leaseEndYyyyMm &&
           values.consentYesNo;
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Transform data to match backend expectations
      const tenantData = {
        ...data,
        userId: currentUser.id,
        // Ensure numeric values are properly converted
        depositKrw: Number(data.depositKrw) || 0,
        currentRentKrw: Number(data.currentRentKrw) || 0,
        maintenanceFee: data.maintenanceFee ? Number(data.maintenanceFee) : undefined,
        // Ensure consent is boolean
        consentYesNo: Boolean(data.consentYesNo)
      };

      console.log('Sending tenant data:', tenantData);
      const response = await tenantApi.createTenant(tenantData);
      if (response.ok) {
        // Update user profile completion status
        const updatedUser = {
          ...currentUser,
          profileCompleted: true,
          buildingName: data.buildingName,
          address: data.streetAddress,
          neighborhood: data.neighborhood
        };

        const userResponse = await authApi.updateUser(updatedUser);
        if (userResponse.ok) {
          onComplete?.(userResponse.data);
        } else {
          onComplete?.(updatedUser);
        }
        
        toast.success('프로필이 성공적으로 저장되었습니다!');
      } else {
        setError(response.message || '프로필 저장에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '프로필 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('Tenant form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세 공동협약</h1>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            거주 프로필 입력
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            정확한 분석을 위한 거주 정보를 입력해주세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 거주지 주소 섹션 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                거주지 주소
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="neighborhood" className="block text-xs text-gray-500 mb-1">
                    구/동 (자동 입력됨)
                  </label>
                  <input
                    {...register('neighborhood', { required: '동네 정보가 필요합니다.' })}
                    type="text"
                    disabled
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-500 rounded-lg bg-gray-100 text-sm"
                    value={currentUser.neighborhood || '강남구 역삼동'}
                  />
                </div>

                <div>
                  <label htmlFor="streetAddress" className="block text-xs text-gray-500 mb-1">
                    세부 주소 *
                  </label>
                  <input
                    {...register('streetAddress', { required: '세부 주소를 입력해주세요.' })}
                    type="text"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                    placeholder="예: 역삼로 123"
                  />
                  {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress.message}</p>}
                </div>

                <div>
                  <label htmlFor="buildingName" className="block text-xs text-gray-500 mb-1">
                    건물명 *
                  </label>
                  <input
                    {...register('buildingName', { required: '건물명을 입력해주세요.' })}
                    type="text"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                    placeholder="예: 역삼타워"
                  />
                  {errors.buildingName && <p className="text-red-500 text-xs mt-1">{errors.buildingName.message}</p>}
                </div>
              </div>
            </div>

            {/* 건물 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                건물 유형 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {buildingTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('buildingType', type.value as any)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer ${
                      watch('buildingType') === type.value
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {errors.buildingType && <p className="text-red-500 text-xs mt-1">건물 유형을 선택해주세요.</p>}
            </div>

            {/* 계약 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                계약 유형 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {contractTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('contractType', type.value as any)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer ${
                      watch('contractType') === type.value
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {errors.contractType && <p className="text-red-500 text-xs mt-1">계약 유형을 선택해주세요.</p>}
            </div>

            {/* 계약 조건 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                계약 조건
              </label>
              <div className="space-y-4">
                <div>
                  <label htmlFor="depositKrw" className="block text-xs text-gray-500 mb-1">
                    보증금 *
                  </label>
                  <div className="relative">
                    <input
                      {...register('depositKrw', { required: '보증금을 입력해주세요.' })}
                      type="text"
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      onChange={(e) => handleNumberChange('depositKrw', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                  {errors.depositKrw && <p className="text-red-500 text-xs mt-1">{errors.depositKrw.message}</p>}
                </div>

                <div>
                  <label htmlFor="currentRentKrw" className="block text-xs text-gray-500 mb-1">
                    {watch('contractType') === 'monthly' ? '월세' : '연세'} *
                  </label>
                  <div className="relative">
                    <input
                      {...register('currentRentKrw', { required: '임대료를 입력해주세요.' })}
                      type="text"
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      onChange={(e) => handleNumberChange('currentRentKrw', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                  {errors.currentRentKrw && <p className="text-red-500 text-xs mt-1">{errors.currentRentKrw.message}</p>}
                </div>

                <div>
                  <label htmlFor="maintenanceFee" className="block text-xs text-gray-500 mb-1">
                    관리비 (선택)
                  </label>
                  <div className="relative">
                    <input
                      {...register('maintenanceFee')}
                      type="text"
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="leaseEndYyyyMm" className="block text-xs text-gray-500 mb-1">
                    계약 만료일 *
                  </label>
                  <input
                    {...register('leaseEndYyyyMm', { 
                      required: '계약 만료일을 입력해주세요.',
                      pattern: {
                        value: /^\d{4}-\d{2}$/,
                        message: 'YYYY-MM 형식으로 입력해주세요 (예: 2025-12)'
                      }
                    })}
                    type="text"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                    placeholder="2025-12"
                  />
                  {errors.leaseEndYyyyMm && <p className="text-red-500 text-xs mt-1">{errors.leaseEndYyyyMm.message}</p>}
                </div>
              </div>
            </div>

            {/* 동의 섹션 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                개인정보 처리 동의 *
              </label>
              <div className="flex items-start space-x-3">
                <input
                  {...register('consentYesNo', { required: '개인정보 처리에 동의해주세요.' })}
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <div className="text-sm text-gray-600">
                  <p>입력하신 정보는 임대료 협상 분석을 위해서만 사용되며, 관련 법령에 따라 안전하게 보호됩니다.</p>
                  <p className="mt-1 text-xs text-gray-500">동의하지 않으시면 서비스를 이용하실 수 없습니다.</p>
                </div>
              </div>
              {errors.consentYesNo && <p className="text-red-500 text-xs mt-1">{errors.consentYesNo.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </div>
                ) : (
                  '프로필 저장 완료'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-shield-check-line"></i>
              </div>
              <p>입력된 정보는 분석을 위해서만 사용되며 안전하게 보호됩니다.</p>
            </div>
          </div>

          {onGoHome && (
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={onGoHome}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-home-line mr-1"></i>
                홈으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
