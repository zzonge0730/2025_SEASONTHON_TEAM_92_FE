import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { locationApi } from '../lib/api';
import OnboardingProgress from './OnboardingProgress';

interface LocationVerifierProps {
  currentUser: User;
  onVerificationSuccess: (updatedUser: User) => void;
  onGoHome?: () => void;
}

interface FormData {
    buildingName: string;
}

export default function LocationVerifier({ currentUser, onVerificationSuccess, onGoHome }: LocationVerifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ address: string; dong: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const handleGetLocation = async () => {
    console.log('📍 GPS 위치 가져오기 시작');
    setIsLoading(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('📍 GPS 위치 성공:', position.coords);
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        setCoords(coords);
        
        // GPS 위치를 가져온 후 바로 VWorld API로 주소 변환
        try {
          console.log('🌍 VWorld API 호출 시작 (위치 인증용)');
          const payload = {
            userId: currentUser.id!,
            latitude: coords.lat,
            longitude: coords.lon,
            buildingName: ''
          };
          
          const response = await locationApi.verifyLocation(payload);
          
          if (response.ok && response.data) {
            setLocationInfo({
              address: response.data.address || '주소 정보 없음',
              dong: response.data.neighborhood || '동 정보 없음'
            });
            toast.success(`위치 확인: ${response.data.neighborhood}`);
            console.log('✅ 주소 변환 성공:', response.data);
          } else {
            setLocationInfo({
              address: '주소 정보를 가져올 수 없습니다',
              dong: '동 정보를 가져올 수 없습니다'
            });
            toast.success('GPS 좌표를 성공적으로 가져왔습니다.');
          }
        } catch (error) {
          console.error('❌ 주소 변환 실패:', error);
          setLocationInfo({
            address: '주소 정보를 가져올 수 없습니다',
            dong: '동 정보를 가져올 수 없습니다'
          });
          toast.success('GPS 좌표를 성공적으로 가져왔습니다.');
        }
        
        console.log('📍 GPS 좌표 설정 완료:', coords);
        setIsLoading(false);
      },
      (error) => {
        console.error('📍 GPS 위치 에러:', error);
        setLocationError('GPS 위치 정보를 가져올 수 없습니다. 브라우저의 위치 정보 접근 권한을 확인해주세요.');
        setIsLoading(false);
      }
    );
  };

  const onSubmit = async (data: FormData) => {
    console.log('🚀 LocationVerifier onSubmit 시작!');
    console.log('📍 coords:', coords);
    console.log('📍 locationInfo:', locationInfo);
    console.log('🏠 건물명:', data.buildingName);
    console.log('👤 사용자 ID:', currentUser.id);
    console.log('👤 currentUser 전체:', currentUser);

    if (!coords) {
      toast.error('먼저 GPS 위치를 가져와주세요.');
      console.log('❌ coords가 없음');
      return;
    }

    if (!currentUser.id) {
      toast.error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      console.log('❌ currentUser.id가 없음');
      return;
    }

    setIsLoading(true);
    try {
        const payload = {
            userId: currentUser.id,
            latitude: coords.lat,
            longitude: coords.lon,
            buildingName: data.buildingName
        };
        
        console.log('📤 API 호출 시작:', payload);
        console.log('🌐 API URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891'}/api/location/verify`);
        
        const response = await locationApi.verifyLocation(payload);
        console.log('📥 API 응답:', response);

        if (response.ok && response.data) {
            toast.success(`${response.data.neighborhood} 인증 완료!`);
            onVerificationSuccess(response.data);
        } else {
            toast.error(response.message || '위치 인증에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('❌ API 호출 에러:', error);
        console.error('❌ 에러 상세:', error.response);
        const message = error.response?.data?.message || '인증 중 오류가 발생했습니다.';
        toast.error(message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
            <OnboardingProgress 
              currentStep={1} 
              totalSteps={3} 
              stepNames={['위치 인증', '프로필 입력', '진단 시작']} 
            />
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">실거주지 인증</h2>
            <p className="text-center text-sm text-gray-600 mb-6">리포트 생성을 위해, 현재 위치를 기반으로 동네를 인증하고 거주 중인 건물명을 입력해주세요.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. GPS 위치 인증</label>
                    <button type="button" onClick={handleGetLocation} disabled={isLoading} className="mt-1 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                        📍 내 위치로 동네 인증하기
                    </button>
                    
                    {coords && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium">✅ 위치 정보 수집 완료</p>
                        {locationInfo && (
                          <div className="mt-2 text-sm text-green-700">
                            <p><strong>동:</strong> {locationInfo.dong}</p>
                            <p><strong>주소:</strong> {locationInfo.address}</p>
                            <p className="text-xs text-green-600 mt-1">위치가 정확한지 확인해주세요</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {locationError && <p className="mt-2 text-sm text-red-500">{locationError}</p>}
                </div>

                <div>
                    <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700">2. 건물명 입력</label>
                    <input 
                        {...register('buildingName', { required: '거주 중인 건물명을 입력해주세요.' })}
                        type="text"
                        placeholder="예: 행복빌라, OO아파트"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.buildingName && <p className="mt-2 text-sm text-red-500">{errors.buildingName.message as string}</p>}
                </div>

                <div className="space-y-3">
                    <button 
                        type="submit" 
                        disabled={isLoading || !coords} 
                        onClick={() => console.log('🔘 인증 완료 버튼 클릭됨!', { isLoading, coords, currentUser: currentUser.id })}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isLoading ? '인증 중...' : '인증 완료하고 시작하기'}
                    </button>
                    
                    {onGoHome && (
                        <button 
                            type="button" 
                            onClick={onGoHome}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            🏠 홈으로 돌아가기
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
  );
}
