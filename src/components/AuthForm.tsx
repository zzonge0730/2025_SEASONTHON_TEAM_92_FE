import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
  onAdminLogin?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, onAdminLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = isLoginView 
        ? await authApi.login(data) 
        : await authApi.register(data);

      if (response.ok) {
        onAuthSuccess(response.data);
        toast.success(isLoginView ? '로그인 성공!' : '회원가입 성공! 다음 단계로 이동합니다.');
        reset();
      } else {
        toast.error(response.message || '인증에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '네트워크 오류가 발생했습니다.';
      toast.error(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginView ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLoginView ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                reset();
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLoginView ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                {...register('email', { required: '이메일을 입력해주세요.' })}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <input
                {...register('password', { required: '비밀번호를 입력해주세요.' })}
                type="password"
                className={isLoginView ? "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" : "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"}
                placeholder="비밀번호"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
            {!isLoginView && (
              <>
                <div>
                  <input
                    {...register('confirmPassword', { 
                        required: '비밀번호를 다시 입력해주세요.',
                        validate: value => value === password || "비밀번호가 일치하지 않습니다."
                    })}
                    type="password"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="비밀번호 확인"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
                </div>
                <div>
                  <input
                    {...register('nickname', { required: '닉네임을 입력해주세요.' })}
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="닉네임"
                  />
                  {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message as string}</p>}
                </div>
                <div>
                  <select
                    {...register('role', { required: '역할을 선택해주세요' })}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  >
                    <option value="tenant">세입자</option>
                    <option value="landlord">집주인</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message as string}</p>}
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : (isLoginView ? '로그인' : '회원가입')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;