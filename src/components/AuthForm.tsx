import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import axios from 'axios';
import { getDistrictFromCoordinates, DistrictInfo } from '../utils/locationUtils';
import LandlordVerification from './LandlordVerification';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
  onAdminLogin?: () => void;
}

interface AuthFormData {
  username?: string;  // 아이디 (회원가입 시에만)
  password?: string;  // 패스워드 (회원가입 시에만)
  nickname: string;
  role: 'tenant' | 'landlord' | 'anonymous';
  latitude?: number;
  longitude?: number;
  address?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [districtInfo, setDistrictInfo] = useState<DistrictInfo | null>(null);
  const [showLandlordVerification, setShowLandlordVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AuthFormData>();

  // GPS 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS를 지원하지 않는 브라우저입니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        setValue('latitude', lat);
        setValue('longitude', lng);
        setLocationError('');
        
        // GPS 좌표를 기반으로 구 단위 정보 추출
        const district = getDistrictFromCoordinates(lat, lng);
        setDistrictInfo(district);
        setValue('address', district.fullName);
      },
      (error) => {
        setLocationError('위치 정보를 가져올 수 없습니다.');
        console.error('GPS Error:', error);
      }
    );
  };

  const onSubmit = async (data: AuthFormData) => {
    if (!location) {
      toast.error('위치 정보를 먼저 가져와주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/users/login' : '/users/register';
      const payload = isLogin 
        ? { 
            nickname: data.nickname, 
            latitude: location.latitude, 
            longitude: location.longitude 
          }
        : {
            ...data,
            latitude: location.latitude,
            longitude: location.longitude
          };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891/api';
      const url = baseUrl.endsWith('/api') ? `${baseUrl}${endpoint}` : `${baseUrl}/api${endpoint}`;
      const response = await axios.post(url, payload);
      const result = response.data;

      if (result.ok) {
        const user: User = {
          id: result.data.id,
          nickname: result.data.nickname,
          role: result.data.role,
          address: result.data.address,
          latitude: location.latitude,
          longitude: location.longitude,
          isVerified: result.data.isVerified,
        };
        
        // 집주인이고 인증되지 않은 경우 인증 플로우로 이동
        if (user.role === 'landlord' && !user.isVerified) {
          setPendingUser(user);
          setShowLandlordVerification(true);
          toast.success('회원가입 성공! 집주인 인증을 진행해주세요.');
        } else {
          onAuthSuccess(user);
          toast.success(isLogin ? '로그인 성공!' : '회원가입 성공!');
          reset();
          setLocation(null);
        }
      } else {
        toast.error(result.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            {isLogin ? '위치 기반 로그인' : 'STEP 1: 회원가입 및 거주 인증'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "계정이 없으신가요? " : '이미 계정이 있으신가요? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                reset();
                setLocation(null);
                setLocationError('');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
          {!isLogin && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">📋 회원가입 단계</h3>
              <ol className="text-xs text-blue-800 space-y-1">
                <li>1. 아이디/패스워드 설정</li>
                <li>2. GPS 기반 거주지 인증</li>
                <li>3. 거주 프로필 입력</li>
              </ol>
            </div>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* GPS 위치 가져오기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 위치
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                📍 위치 가져오기
              </button>
              {location && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-600">
                    ✅ 위치 확인됨
                  </p>
                  {districtInfo && (
                    <div className="text-sm text-blue-600 font-medium space-y-1">
                      <p>🏘️ <strong>{districtInfo.fullName}</strong> 거주 인증 완료</p>
                      <p className="text-xs text-gray-500">
                        동 단위 인증으로 신뢰할 수 있는 거주자 데이터만 수집됩니다
                      </p>
                    </div>
                  )}
                </div>
              )}
              {locationError && (
                <p className="mt-2 text-sm text-red-600">{locationError}</p>
              )}
            </div>

            {/* 회원가입 시에만 아이디/패스워드 필드 표시 */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    아이디
                  </label>
                  <input
                    {...register('username', { 
                      required: !isLogin ? '아이디는 필수입니다' : false,
                      minLength: {
                        value: 4,
                        message: '아이디는 최소 4자 이상이어야 합니다'
                      },
                      maxLength: {
                        value: 20,
                        message: '아이디는 20자 이하여야 합니다'
                      }
                    })}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="아이디를 입력하세요"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    {...register('password', { 
                      required: !isLogin ? '비밀번호는 필수입니다' : false,
                      minLength: {
                        value: 6,
                        message: '비밀번호는 최소 6자 이상이어야 합니다'
                      }
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="비밀번호를 입력하세요"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <input
                {...register('nickname', { 
                  required: '닉네임은 필수입니다',
                  minLength: {
                    value: 2,
                    message: '닉네임은 최소 2자 이상이어야 합니다'
                  },
                  maxLength: {
                    value: 50,
                    message: '닉네임은 50자 이하여야 합니다'
                  }
                })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  역할
                </label>
                <select
                  {...register('role', { required: '역할을 선택해주세요' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">역할을 선택하세요</option>
                  <option value="tenant">세입자</option>
                  <option value="landlord">집주인</option>
                  <option value="anonymous">익명 신고자</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !location}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
            
            {onAdminLogin && (
              <button
                type="button"
                onClick={onAdminLogin}
                className="w-full flex justify-center py-2 px-4 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                관리자 로그인
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* 집주인 인증 모달 */}
      {showLandlordVerification && pendingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">집주인 인증</h2>
                <button
                  onClick={() => {
                    setShowLandlordVerification(false);
                    setPendingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <LandlordVerification
                currentUser={pendingUser}
                onVerificationComplete={() => {
                  setShowLandlordVerification(false);
                  onAuthSuccess(pendingUser);
                  setPendingUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
