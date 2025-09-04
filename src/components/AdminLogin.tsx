import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';

interface AdminLoginProps {
  onAdminLogin: (admin: User) => void;
  onBack: () => void;
}

interface AdminLoginData {
  adminId: string;
  password: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginData>();

  const onSubmit = async (data: AdminLoginData) => {
    setIsLoading(true);
    try {
      // 관리자 인증 (실제로는 서버에서 처리)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891';
      const url = `${baseUrl}/api/admin/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        const admin: User = {
          id: result.data.id,
          email: result.data.email || '',
          nickname: result.data.nickname,
          role: 'admin',
          address: result.data.address || '',
        };
        
        onAdminLogin(admin);
        toast.success('관리자 로그인 성공!');
      } else {
        toast.error(result.message || '관리자 인증에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류. 다시 시도해주세요.');
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자만 접근할 수 있는 영역입니다
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700">
                관리자 ID
              </label>
              <input
                {...register('adminId', { required: '관리자 ID를 입력해주세요' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="관리자 ID를 입력하세요"
              />
              {errors.adminId && (
                <p className="mt-1 text-sm text-red-600">{errors.adminId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                {...register('password', { required: '비밀번호를 입력해주세요' })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              뒤로가기
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;