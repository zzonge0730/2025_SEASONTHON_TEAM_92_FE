import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
  onAdminLogin?: () => void;
  onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, onAdminLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();


  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      const requestData = isLoginView ? data : {...data, role: 'tenant'};
      console.log('📤 전송할 데이터:', requestData);
      
      const response = isLoginView 
        ? await authApi.login(data) 
        : await authApi.register(requestData);

      if (response.ok) {
        if (isLoginView && response.data.token) {
          localStorage.setItem('jwtToken', response.data.token);
        }
        onAuthSuccess(response.data.user || response.data);
        toast.success(isLoginView ? '로그인 성공!' : '회원가입 성공! 다음 단계로 이동합니다.');
      } else {
        setError(response.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
            <i className="ri-home-heart-line text-white text-lg"></i>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          월세 공동협약 네트워크
        </h1>
        <p className="text-gray-600 text-sm">
          {isLoginView ? '계정에 로그인하여 서비스를 이용하세요' : '새 계정을 만들어 시작하세요'}
        </p>
      </div>

      {/* Admin Login Button */}
      {onAdminLogin && (
        <div className="text-center mb-4">
          <button
            onClick={onAdminLogin}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <i className="ri-admin-line mr-1"></i>
            관리자 로그인
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            {...register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식이 아닙니다'
              }
            })}
            type="email"
            id="email"
            placeholder="이메일을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: {
                value: 8,
                message: '비밀번호는 최소 8자 이상이어야 합니다'
              }
            })}
            type="password"
            id="password"
            placeholder={isLoginView ? "비밀번호를 입력하세요" : "8-64자 비밀번호를 입력하세요"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
          )}
        </div>

        {/* Nickname (for registration) */}
        {!isLoginView && (
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              닉네임
            </label>
            <input
              {...register('nickname', {
                required: '닉네임을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '닉네임은 최소 2자 이상이어야 합니다'
                }
              })}
              type="text"
              id="nickname"
              placeholder="닉네임을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.nickname && (
              <p className="text-red-500 text-xs mt-1">{errors.nickname.message as string}</p>
            )}
          </div>
        )}


        {/* Remember Me (for login) */}
        {isLoginView && (
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              로그인 상태 유지
            </label>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isLoginView ? '로그인 중...' : '가입 처리 중...'}
            </div>
          ) : (
            isLoginView ? '로그인' : '회원가입'
          )}
        </button>
      </form>

      {/* Toggle View */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {isLoginView ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              reset();
              setError('');
            }}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            {isLoginView ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>

      {/* Demo Credentials for Login */}
      {isLoginView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">데모 계정</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>이메일:</strong> demo@example.com</p>
            <p><strong>비밀번호:</strong> password123</p>
          </div>
        </div>
      )}

      {/* Terms (for registration) */}
      {!isLoginView && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            회원가입 시 <a href="#" className="text-blue-600 hover:text-blue-500">이용약관</a> 및{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthForm;