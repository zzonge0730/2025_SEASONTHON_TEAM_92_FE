import { useState, useEffect } from 'react';
import { User, LandlordProperty } from '../types';
import { landlordApi } from '../lib/api';
import { formatCurrency } from '../utils/formatting';

interface LandlordDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function LandlordDashboard({ currentUser, onLogout }: LandlordDashboardProps) {
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await landlordApi.getProperties();
      if (response.ok) {
        setProperties(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = properties.reduce((sum, prop) => sum + prop.totalUnits, 0);
  const totalTenants = properties.reduce((sum, prop) => sum + prop.currentTenants, 0);
  const avgRent = properties.length > 0 
    ? properties.reduce((sum, prop) => sum + prop.avgRent, 0) / properties.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                집주인 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {currentUser.nickname}님
              </span>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 환영 섹션 */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">
            집주인 대시보드에 오신 것을 환영합니다! 🏠
          </h2>
          <p className="text-green-100">
            세입자들과의 원활한 소통을 통해 더 나은 임대 관계를 만들어보세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 건물 수</p>
                <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 세입자 수</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTenants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 세대 수</p>
                <p className="text-2xl font-semibold text-gray-900">{totalUnits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 월세</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(avgRent)}원
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 건물 관리 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">내 건물 관리</h2>
            <button
              onClick={() => alert('건물 추가 기능은 준비 중입니다.')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              건물 추가
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 건물이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                첫 번째 건물을 등록해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{property.buildingName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">세대 수:</span>
                      <span className="ml-1 font-medium">{property.totalUnits}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">세입자:</span>
                      <span className="ml-1 font-medium">{property.currentTenants}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">평균 월세:</span>
                    <span className="ml-1 font-medium text-indigo-600">
                      {formatCurrency(property.avgRent)}원
                    </span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-sm hover:bg-indigo-100">
                      제안서 보기
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100">
                      세입자 관리
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">새로운 제안서가 도착했습니다</p>
                <p className="text-xs text-blue-700">행복아파트 - 2시간 전</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">새로운 세입자가 등록했습니다</p>
                <p className="text-xs text-green-700">미래빌딩 - 5시간 전</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}