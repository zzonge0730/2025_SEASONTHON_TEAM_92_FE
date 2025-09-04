import { useState } from 'react';
import { Group, User } from '../types';
import ProposalModal from './ProposalModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GroupCardProps {
  group: Group;
  currentUser: User;
}

export default function GroupCard({ group, currentUser }: GroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatCurrencyK = (amount: number) => {
    // 원 단위를 만원 단위로 변환 (10000으로 나누기)
    const amountInManwon = amount / 10000;
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amountInManwon) + '만원';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {group.label}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {group.scope}
          </span>
          <span>{group.groupSize} 가구</span>
        </div>
      </div>

      {/* 세입자 데이터 */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-1">세입자 데이터</h4>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">평균 월세:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.avgRentKrw)}원
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">중간값 월세:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(group.medianRentKrw)}원
          </span>
        </div>
        
        {group.avgNoticePct > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">평균 인상 통지율:</span>
            <span className="font-medium text-gray-900">
              {group.avgNoticePct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Market Data Visualization */}
      {group.marketData && group.marketData.transactionCount > 0 && (
        <div className="space-y-3 mb-6 p-3 bg-green-50 rounded-md">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-green-700">
              시세 비교 분석
            </h4>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {group.marketData.transactionCount}건 거래 기준
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            우리 그룹과 시장 평균을 비교하여 협상 포인트를 파악하세요
          </p>
          
          {/* Rent Comparison Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: '우리 그룹',
                    월세: Math.round(group.avgRentKrw / 10000), // Convert to 만원
                    보증금: Math.round((group.avgRentKrw * 10) / 10000), // Estimate deposit as 10x rent (temporary)
                    fill: '#3B82F6'
                  },
                  {
                    name: '시장 평균',
                    월세: Math.round(group.marketData.avgMonthlyRent / 10000),
                    보증금: Math.round(group.marketData.avgDeposit / 10000),
                    fill: '#10B981'
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [`${value}만원`, name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="월세" fill="#3B82F6" name="월세" radius={[2, 2, 0, 0]} />
                <Bar dataKey="보증금" fill="#10B981" name="보증금" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Key Insights */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="text-gray-600">우리 그룹 평균</div>
              <div className="font-medium text-gray-900">
                {formatCurrencyK(group.avgRentKrw)}
              </div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-gray-600">시장 평균</div>
              <div className="font-medium text-gray-900">
                {formatCurrencyK(group.marketData.avgMonthlyRent)}
              </div>
            </div>
          </div>
          
          {/* Market Analysis */}
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600 mb-2">시장 분석</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>월세 차이:</span>
                <span className={`font-medium ${
                  group.avgRentKrw > group.marketData.avgMonthlyRent 
                    ? 'text-red-600' 
                    : group.avgRentKrw < group.marketData.avgMonthlyRent 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                }`}>
                  {group.avgRentKrw > group.marketData.avgMonthlyRent ? '+' : ''}
                  {formatCurrencyK(group.avgRentKrw - group.marketData.avgMonthlyRent)}
                  {group.marketData.avgMonthlyRent > 0 && (
                    <span className="ml-1">
                      ({group.avgRentKrw > group.marketData.avgMonthlyRent ? '+' : ''}
                      {Math.round(((group.avgRentKrw - group.marketData.avgMonthlyRent) / group.marketData.avgMonthlyRent) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>보증금 차이:</span>
                <span className={`font-medium ${
                  (group.avgRentKrw * 10) > group.marketData.avgDeposit 
                    ? 'text-red-600' 
                    : (group.avgRentKrw * 10) < group.marketData.avgDeposit 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                }`}>
                  {(group.avgRentKrw * 10) > group.marketData.avgDeposit ? '+' : ''}
                  {formatCurrencyK((group.avgRentKrw * 10) - group.marketData.avgDeposit)}
                  {group.marketData.avgDeposit > 0 && (
                    <span className="ml-1">
                      ({(group.avgRentKrw * 10) > group.marketData.avgDeposit ? '+' : ''}
                      {Math.round((((group.avgRentKrw * 10) - group.marketData.avgDeposit) / group.marketData.avgDeposit) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>거래 건수:</span>
                <span className="font-medium text-gray-900">
                  {group.marketData.transactionCount}건
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-green-600">
            최근 거래: {group.marketData.recentTransactionDate}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          제안서 생성
        </button>
      </div>

      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={group.groupId}
        currentUser={currentUser}
      />
    </div>
  );
}